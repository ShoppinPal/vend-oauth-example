/**
 * Created by megha on 9/9/14.
 */
'use strict';
var nconf = require('nconf')
  , log = require('winston')
  , q = require('q')
  , redis = require('then-redis')
  , vend = require('vend-nodejs-sdk')({});

var redisStore = function(clientId){
  var redisClient = redis.createClient();
  return redisClient.exists(clientId)
    .then(function(value){
      if(value === 1){
        log.debug('Key exists in Redis: '+ value);
        return redisClient.get(clientId)
          .then(function(response){
            log.debug('Value obtained from key in response: '+ JSON.parse(response));
            return q(response);
          });
      }
      else {
        log.debug('Key does not exist in Redis: '+ value);
        return q(clientId);
      }
    }, function(error){
      log.debug('No VendTokenDetails key found in Redis');
      return q.reject(error);
    });
};



exports.current = function(req, res){
  log.debug('ClientId: '+ JSON.stringify(req.params.clientId));
  return redisStore(req.params.clientId)
    .then(function(response){
      res.send(response);
    }, function(error){
      log.debug('There is some problem with redis connection');
      res.send(500, {message: 'Some problem with Redis connection', error: JSON.stringify(error)});
    });
};


exports.token = function(req,res){
  /* jshint camelcase: false */
  log.debug('inside token method');
  var redisClient = redis.createClient();

  if (!req.query.code) {
    res.send(400, 'Bad Request: code not provided');
  }
  else if (!req.query.domain_prefix) {
    res.send(400, 'Bad Request: domain_prefix not provided');
  }
  else {
    log.debug('req.query.code: ', req.query.code);
    log.debug('req.query.domain_prefix: ', req.query.domain_prefix);
    log.debug('req.query.state: ', req.query.state);
    var state = req.query.state.split(',');
    log.debug('ClientId: '+ state[0] + ' /n clientSecret: '+ state[1]);


    var redirectUri = nconf.get('site:baseUrl') + '/token/vend';
    log.debug('redirectUri: '+ redirectUri);

    vend.getInitialAccessToken(
      nconf.get('vend:token_service'),
      state[0],
      state[1],
      redirectUri,
      req.query.code,
      req.query.domain_prefix,
      req.query.state
    )
      .then(function(response) {
        var token = {
          'access_token': response.access_token,
          'token_type': response.token_type,
          'expires': response.expires,
          'expires_in': response.expires_in,
          'refresh_token': response.refresh_token,
          'domain_prefix': response.domain_prefix
        };
        log.debug('Vend token object to save in Redis : '+ JSON.stringify(token));
        return redisClient.setex(state[0], 600, JSON.stringify(token));
      })
      .then(function(){ //sample vend api call w/ oauth as creds
        var nconfTemp = require('nconf');
        nconfTemp.file({ file: 'oauth.txt' });
        return vend.fetchProducts(
          nconfTemp.get('domain_prefix'),
          nconfTemp.get('access_token')
        );
      })
      .then(function(){
        //log.debug('wrote oauth info to file: oauth.txt');
        log.debug('redirecting to: ' + nconf.get('site:baseUrl') + '/#/home');
        res.redirect(nconf.get('site:baseUrl') + '/#/home/'+ state[0]);
      },function(error){
        log.error('Error receiving vend token information: ', JSON.stringify(error));
        res.send(500, {message: 'An error occurred while receiving vend token info.', error: JSON.stringify(error)});
      });
  }
};

var internalRefreshAccessToken = function(clientid, clientsecret){
  log.debug('inside internalRefreshAccessToken(): '+ clientid + '-'+ clientsecret);
  var redisClient = redis.createClient();
      /*jshint camelcase: false*/

  return redisStore(clientid)
    .then(function(response){
      log.debug('response from redis store: '+ JSON.parse(response));
      var data;

      try {
        data = JSON.parse(response);
        log.debug('token service '+ nconf.get('vend:token_service'));

        return vend.refreshAccessToken(
          nconf.get('vend:token_service'),
          clientid,
          clientsecret,
          data.refresh_token,
          data.domain_prefix
        )
          .then(function(resp){
            log.debug('resp refreshAccessToken - '+ JSON.stringify(resp));
            log.debug('resp refreshAccessToken - '+ JSON.stringify(data.refresh_token));

            var token = {
              'access_token': resp.access_token,
              'token_type': resp.token_type,
              'expires': resp.expires,
              'expires_in': resp.expires_in,
              'refresh_token': resp.refresh_token || data.refresh_token,
              'domain_prefix': data.domain_prefix
            };
            return redisClient.setex(clientid, 600, JSON.stringify(token));
          });
      } catch (e){
        log.error('Value obtained from RedisStore() is not a proper object');
        return q.reject(e);
      }
    }, function(error){
      log.error('Error occured while getting the value from RedisStore(): ',JSON.stringify(error));
      return q.reject(error);

    });

};

exports.refreshAccessToken = function(req,res){
  log.debug('req.params.clientId: ', req.query.clientId);
  log.debug('req.params.clientSecret: ', req.query.clientSecret);

  return internalRefreshAccessToken(req.query.clientId,req.query.clientSecret)
    .then(function(){
      res.redirect(nconf.get('site:baseUrl') + '/#/home/'+ req.query.clientId);
    }
    ,function(error){
      log.error('Error refreshing access token information: ', JSON.stringify(error));
      res.send(500, {message: 'An error occurred while refreshing access token info.', error: JSON.stringify(error)});
    });
};

exports.fetchProducts = function(req,res){
  log.debug('req.params.clientId: ', req.query.clientId);
  log.debug('req.params.clientSecret: ', req.query.clientSecret);

  /*jshint camelcase: false*/

  var waitFor;
  return redisStore(req.query.clientId)
    .then(function(response) {
      log.debug('response from redis store: ' + JSON.stringify(response));
      var data;
      try{
        data = JSON.parse(response);
        if (vend.hasAccessTokenExpired(data.expires)) {
          log.debug('inside fetchProducts() - token has expired');
          waitFor = internalRefreshAccessToken();
          log.debug('waitFor if: ' + waitFor);
          return [data,waitFor];
        }
        else {
          console.log('inside fetchProducts() - token has NOT expired');
          waitFor = q();
          log.debug('waitFor else: ' + waitFor);
          return [data,waitFor];
        }
      } catch(e){
        log.error('Value obtained from RedisStore() is not a proper object');
        return q.reject(e);
      }

    })
    .then(function(resp){ //sample vend api call w/ oauth as creds
      var redisData = resp[0];
      log.debug('inside fetchProducts() - calling vend...');
      log.debug('domain prefix: '+ redisData.domain_prefix);


      var args = vend.args.products.fetch();
      args.orderBy.value = 'id';
      args.page.value = 1;
      args.pageSize.value = 5;
      args.active.value = true;
      var connectionInfo = {
        domainPrefix: redisData.domain_prefix,
        accessToken: redisData.access_token,
        // if you want auto-retries on 401, additional data is required:
        refreshToken: redisData.refresh_token, // oauth.txt
        vendTokenService: nconf.get('vend:token_service'), // config/<env>.json
        vendClientId: req.query.clientId, // config/<env>.json
        vendClientSecret: req.query.clientSecret // config/<env>.json
      };
      return vend.products.fetch(args, connectionInfo);
    })
    .then(function(vendResponse){
      res.json(vendResponse);
    }
    ,function(error){
      log.error('Error receiving token information: ', JSON.stringify(error));
      res.send(500, {message: 'An error occurred while receiving token info.', error: JSON.stringify(error)});
    });
};

/**
 * Created by megha on 9/9/14.
 */
'use strict';
var nconf = require('nconf')
  , log = require('winston')
  , q = require('q')
  , fileSystem = require('q-io/fs')
  , vend = require('vend-nodejs-sdk');

exports.token = function(req,res){
  /* jshint camelcase: false */
  log.debug('inside token method');
  console.log('req.query: ', req.query);
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

    var redirectUri = nconf.get('site:baseUrl') + '/token/vend';
    log.debug('redirectUri: '+ redirectUri);

    vend.getInitialAccessToken(
      nconf.get('vend:token_service'),
      nconf.get('vend:client_id'),
      nconf.get('vend:client_secret'),
      redirectUri,
      req.query.code,
      req.query.domain_prefix,
      req.query.state
    )
      .then(function(response) {
        log.debug('Vend Token Details ' + JSON.stringify(response,null,2));
        return fileSystem.write('oauth.txt', JSON.stringify(response,null,2));
      })
      .then(function(){
        log.debug('wrote oauth info to file: oauth.txt');
        log.debug('it would be better to persist this to redis cache or your backend server for actual usage');
        log.debug('redirecting to: ' + nconf.get('site:baseUrl') + '/#/done');
        res.redirect(nconf.get('site:baseUrl') + '/#/done');
      }
      ,function(error){
        log.error('Error receiving token information: ', JSON.stringify(error));
        res.send(500, {message: 'An error occurred while receiving token info.', error: JSON.stringify(error)});
      });
  }
};

var internalRefreshAccessToken = function(){
  log.debug('inside internalRefreshAccessToken()');
  var nconfTemp = require('nconf');
  nconfTemp.file({ file: 'oauth.txt' });
  return vend.refreshAccessToken(
    nconf.get('vend:token_service'),
    nconf.get('vend:client_id'),
    nconf.get('vend:client_secret'),
    nconfTemp.get('refresh_token'),
    nconfTemp.get('domain_prefix')
  )
    .then(function(response){
      /*jshint camelcase: false*/
      log.debug('refreshAccessToken - ', response);
      // if there isn't an updated refresh_token, then re-persist the older one
      response.refresh_token = nconfTemp.get('refresh_token');
      response.domain_prefix = nconfTemp.get('domain_prefix');
      return fileSystem.write('oauth.txt', JSON.stringify(response,null,2));
    });
};

exports.refreshAccessToken = function(req,res){
  return internalRefreshAccessToken()
    .then(function(){
      //res.json(response); do not return access token to user, persist it instead
      //res.redirect(nconf.get('site:baseUrl') + '/#/home');
      res.end();
    },
    function(error){
      log.error('Error receiving token information: ', JSON.stringify(error));
      res.send(500, {message: 'An error occurred while receiving token info.', error: JSON.stringify(error)});
    });
};

exports.fetchProducts = function(req,res){
  console.log('inside fetchProducts()');

  var nconfTemp = require('nconf');
  nconfTemp.file({ file: 'oauth.txt' });
  //return res.end();

  var waitFor;
  if ( vend.hasAccessTokenExpired(nconfTemp.get('expires')) ) {
    console.log('inside fetchProducts() - token has expired');
    waitFor = internalRefreshAccessToken();
  }
  else{
    console.log('inside fetchProducts() - token has NOT expired');
    waitFor = q();
  }
  return waitFor
    .then(function(){ //sample vend api call w/ oauth as creds
      console.log('inside fetchProducts() - calling vend...');
      nconfTemp.file({ file: 'oauth.txt' }); // reloads ... right?

      var args = vend.args.products.fetch();
      args.orderBy.value = 'id';
      args.page.value = 1;
      args.pageSize.value = 5;
      args.active.value = true;
      var connectionInfo = {
        domainPrefix: nconfTemp.get('domain_prefix'),
        accessToken: nconfTemp.get('access_token'),
        // if you want auto-retries on 401, additional data is required:
        refreshToken: nconfTemp.get('refresh_token'), // oauth.txt
        vendTokenService: nconf.get('vend:token_service'), // config/<env>.json
        vendClientId: nconf.get('vend:client_id'), // config/<env>.json
        vendClientSecret: nconf.get('vend:client_secret') // config/<env>.json
      };

      // not sure why config/<env>.json is not loaded into `nconf` for this method without the use of:
      // `NODE_ENV=development grunt server --subdomain <domainPrefix>`
      // while in exports.token it works just fine when launched with:
      // `grunt server --subdomain <domainPrefix>`
      // why ???
      //console.log('connectionInfo: ', connectionInfo);
      //console.log('nconf: ', nconf.get());

      return vend.products.fetch(args, connectionInfo);
    })
    .then(function(vendResponse){
      res.json(vendResponse);
    }
    ,function(error){
      log.error('Error: ', JSON.stringify(error));
      res.send(500, {message: 'An error occurred in fetchProducts()', error: JSON.stringify(error)});
    });
};

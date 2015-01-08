/**
 * Created by megha on 9/9/14.
 */
'use strict';
var nconf = require('nconf')
  , q = require('q')
  , log = require('winston')
  , responseHandler = require('./response-handler')
  , request = require('request')
  , fileSystem = require('q-io/fs');

var getInitialAccessToken = function(code, domainPrefix, state) {
  /* jshint camelcase: false */

  log.debug('client Id: ' + nconf.get('vend:client_id'));
  log.debug('client Secret: ' + nconf.get('vend:client_secret'));
  log.debug('redirect_uri: ' +  nconf.get('site:baseUrl') + '/token/vend');
  log.debug('code: ' + code);
  log.debug('state: ' + state);

  log.debug('domain_prefix: ' + domainPrefix);
  log.debug('token_service: ' + nconf.get('vend:token_service'));
  var tokenUrl = nconf.get('vend:token_service').replace(/\{DOMAIN_PREFIX\}/, domainPrefix);
  log.debug('tokenUrl: '+ 'https://'+ domainPrefix + nconf.get('vend:token_service'));

  var deferred = q.defer();
  request.post({
    url: tokenUrl,
    headers: {
      'Accept': 'application/json'
    },
    form:{
      'code': code,
      'client_id': nconf.get('vend:client_id'),
      'client_secret': nconf.get('vend:client_secret'),
      'grant_type': 'authorization_code',
      'state': state,
      'redirect_uri': nconf.get('site:baseUrl') + '/token/vend'
    }
  }, function(err, resp, body){
    responseHandler.processResponse(err, resp, body)
      .then(function(result){
        deferred.resolve(result);
      }, function(error){
        deferred.reject(error);
      });
  });
  return deferred.promise;
};

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
    var userSessionToken =  req.query.state;
    log.debug('SessionToken: '+ userSessionToken);
    getInitialAccessToken(req.query.code, req.query.domain_prefix, req.query.state)
      .then(function(response){
        log.debug('Vend Token Details ' + JSON.stringify(response,null,2));
        return fileSystem.write('oauth.txt', JSON.stringify(response,null,2));
      })
      .then(function(){ //sample call w/ oauth
        var nconfTemp = require('nconf');
        nconfTemp.file({ file: 'oauth.txt' });

        var Vend = require('vend-nodejs-sdk').Vend;
        var vend = new Vend(
          nconfTemp.get('domain_prefix'),
          nconfTemp.get('access_token')
        );

        return vend.fetchProducts();
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

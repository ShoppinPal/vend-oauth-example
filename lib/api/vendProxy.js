/**
 * Created by megha on 9/9/14.
 */
'use strict';
var nconf = require('nconf')
  , log = require('winston')
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
      .then(function(){ //sample vend api call w/ oauth as creds
        var nconfTemp = require('nconf');
        nconfTemp.file({ file: 'oauth.txt' });
        return vend.fetchProducts(
          nconfTemp.get('domain_prefix'),
          nconfTemp.get('access_token')
        );
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

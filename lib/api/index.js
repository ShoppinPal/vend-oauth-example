'use strict';

var vendProxy = require('./vendProxy');

exports.token = function(req, res) {
  console.log('req.params.tokenProvider: ' + req.params.tokenProvider);
  switch (req.params.tokenProvider) {
    case 'vend':
      vendProxy.token(req,res);
      break;
    default:
      res.send(400, 'Bad Request: no known tokenProvider was specified');
      break;
  }
};

exports.refreshAccessToken = function(req, res) {
  console.log('req.params.tokenProvider: ' + req.params.tokenProvider);
  switch (req.params.tokenProvider) {
    case 'vend':
      vendProxy.refreshAccessToken(req,res);
      break;
    default:
      res.send(400, 'Bad Request: no known tokenProvider was specified');
      break;
  }
};
'use strict';

var vendProxy = require('./vendProxy');

exports.token = function(req, res) {
  console.log('req.params.tokenProvider: ' + req.params.tokenProvider);
  switch (req.params.tokenProvider) {
    case 'vend':
      vendProxy.token(req,res);
      break;
    default:
      res.send(400, 'Bad Request: tokenProvider not specified');
      break;
  }
};
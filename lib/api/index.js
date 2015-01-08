'use strict';
var vend = require('./vend');
exports.vend = vend;

exports.token = function(req, res) {
  console.log('req.params.tokenProvider: ' + req.params.tokenProvider);
  switch (req.params.tokenProvider) {
    case 'vend':
      vend.token(req,res);
      break;
    default:
      res.send(400, 'Bad Request: tokenProvider not specified');
      break;
  }
};
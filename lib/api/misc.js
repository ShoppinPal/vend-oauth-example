'use strict';

exports.current = function(req,res){

  var moment = require('moment');

  var nconf = require('nconf');
  nconf
    .file('oauth', { file: 'oauth.txt' })
    .file('config', { file: 'config/' + process.env.NODE_ENV + '.json' });
  //console.log(nconf.get());

  res.json({
    'config' : {
      'filename': 'config/' + process.env.NODE_ENV + '.json',
      'vend': {
        'client_id': (nconf.get('vend:client_id')) ? true : false,
        'client_secret': (nconf.get('vend:client_secret')) ? true : false
      }
    },
    'oauth': {
      'refresh_token': (nconf.get('refresh_token')) ? true : false,
      'access_token': (nconf.get('access_token')) ? true : false,
      'expires': moment.unix(nconf.get('expires')).format('dddd, MMMM Do YYYY, h:mm:ss a ZZ'),
      'expires_in': nconf.get('expires_in'),
      'domain_prefix': nconf.get('domain_prefix')
    }
  });
};

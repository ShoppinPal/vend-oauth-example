var nconf = require('nconf');
nconf
  .file('config', { file: 'config/' + process.env.NODE_ENV + '.json' })
  .file('oauth', { file: 'oauth.txt' });
//console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
//console.log('nconf.get(): ', nconf.get());

var replay = require('replay');
replay.mode = 'record';
replay.headers.push(/^content-length/);

var vendSdk = require('vend-nodejs-sdk')({});

vendSdk.fetchProducts(
  nconf.get('domain_prefix'),
  nconf.get('access_token')
)
  .then(function(/*products*/){
    console.log('done');
    //console.log('products: ', products);
  });

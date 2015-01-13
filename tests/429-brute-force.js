var nconf = require('nconf');
nconf
  .file('config', { file: 'config/' + process.env.NODE_ENV + '.json' })
  .file('oauth', { file: 'oauth.txt' });
console.log('process.env.NODE_ENV: ', process.env.NODE_ENV);
console.log('nconf.get(): ', nconf.get());

/*var replay = require('replay');
 replay.mode = 'bloody';
 replay.headers.push(/^content-length/);*/

var Promise = require('bluebird');
var vend = require('vend-nodejs-sdk');

var registers = 4;
var apiLimit = 300 * registers + 50; // 5 minute window
var exceedApiLimit = apiLimit + 1;
console.log('need to run more than ' + apiLimit + ' times in a 5 min window for rate limitign to kick-in');

// similar fucntionality can be accomplished from CLI via:
//   ab -c 20 -n 1251 -A username:password -v 3 https://fermiyontest.vendhq.com/api/products
// reference doc for ab: http://httpd.apache.org/docs/2.0/programs/ab.html
var promises = [];
for (var i = 0; i < exceedApiLimit; ++i) {
  promises.push(
    vend.fetchProducts(
      nconf.get('domain_prefix'),
      nconf.get('access_token')
    )
  );
}
Promise.all(promises)
  .then(function(/*products*/){
    console.log('done');
    //console.log('products: ', products);
  });

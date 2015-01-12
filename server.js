/**
 * Module dependencies.
 */

var express = require('express')
  , http = require('http')
  , path = require('path')
  , api = require('./lib/api')
  , misc = require('./lib/api/misc')
  , nconf = require('nconf')
  , winston = require('winston');

var app = express();

// configuration command line args > environment vars > <env>.json file in config folder.
nconf.argv()
  .env()
  .file({ file: 'config/' + app.get('env') + '.json' });

// logging configuration
var loggingConfig = nconf.get('logging');

if(loggingConfig.console) {
  winston.remove(winston.transports.Console);
  winston.add(winston.transports.Console, {colorize: true, timestamp: false, level: 'debug'});
}

if(loggingConfig.file) {
  winston.add(winston.transports.File, {filename: 'logs/errors.log', timestamp: true});
}

// all environments
app.set('port', process.env.PORT || 3000);

// Enable CORS
var allowCrossDomain = function(req, res, next) {
  'use strict';
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

  // intercept OPTIONS method
  if ('OPTIONS' === req.method) {
    res.send(200);
  }
  else {
    next();
  }
};

app.use(allowCrossDomain);
app.use(express.logger('dev'));

// Three links were used to decide how to force the redirect from HTTP to HTTPS:
// For sample code: http://stackoverflow.com/questions/7185074/heroku-nodejs-http-to-https-ssl-forced-redirect
// For understanding order of placement: http://stackoverflow.com/questions/12695591/node-js-express-js-how-does-app-router-work
// For deciding the order of placement: http://expressjs.com/3x/api.html#app.use
var forceSsl = function (req, res, next) {
  'use strict';
  if (req.headers['x-forwarded-proto'] !== 'https' &&
      process.env.NODE_ENV !== 'development' &&
      process.env.E2E_TESTING !== 'true') {
    console.log('process.env.NODE_ENV: ' + process.env.NODE_ENV);
    console.log('forcing a redirect from http to https: ' + req.method + ' ' + req.url);
    return res.redirect(['https://', req.get('Host'), req.url].join(''));
  } else {
    next();
  }
};
app.use(forceSsl);

app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

app.set('views', __dirname + '/app/views');
app.engine('html', require('ejs').renderFile);

app.use(express.static(path.join(__dirname, '.tmp')));
app.use(express.static(path.join(__dirname, 'app')));
app.use(express.errorHandler());

app.get('/current', misc.current);
app.get('/token/:tokenProvider/refresh', api.refreshAccessToken);
app.get('/token/:tokenProvider', api.token);
app.get('/:tokenProvider/fetchProducts', api.fetchProducts);

http.createServer(app).listen(app.get('port'), function () {
  'use strict';
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});
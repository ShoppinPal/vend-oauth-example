# vend-oauth-example

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shoppinpal/vend-oauth-example?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## setup
1. `git clone --recursive https://github.com/ShoppinPal/vend-oauth-example.git`
2. `cd vend-oauth-example`
3. `npm install`
4. `bower install`
5. edit `config/development.json` and fill out your vend developer `client_id` and `client_secret` which can be found here: https://developers.vendhq.com/developer/applications
5. `cd node_modules/vend-nodejs-sdk`
8. `npm install`
9. `cd ../..`

## run it - short & sweet version
1. Make sure that your vend developer app is registered with Redirect URI: `https://<vendDomainPrefix>.localtunnel.me/token/vend`
2. `grunt server --subdomain vendDomainPrefix`
  1. so, if I have a vend store named: `blah123.vendhq.com`
  2. then I will register a Redirect URI: https://blah123.localtunnel.me/token/vend
  3. and *afterwards* run the sample with the command: `grunt server --subdomain blah123`

## run it - long boring detailed story
There is some magic happening behind the scenes on your behalf for this sample: a publically accessible url is being spun up so that Vend can talk to the code running locally on your machine. That url is of the form: `vendDomainPrefix.localtunnel.me` because there is a good chance that nobody else is using your store's vendDomainPrefix with localtunnel ... so stick to that. If its nto working for you, try substituting with another unique word or name when launching.

# tests
1. demonstrates how a 429 response code due to Vend rate limiting is handled: `NODE_ENV=development node tests/429.js`
2. attempts (doesn't work) to record a 429 response code from Vend by exceedign the rate limit: `NODE_ENV=development node tests/429.js`

## contributions

You can pick and choose from the existing issues for any features you want to help add, or any bugs you want to crush. Get in touch via the chat link above if you wish to contribute and have specific questions. Otherwise, jsut fork the repo, make your changes and when you're ready, issue a pull-request for review.

# vend-oauth-example

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/shoppinpal/vend-oauth-example?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

## setup
1. git clone --recursive https://github.com/ShoppinPal/vend-oauth-example.git
2. cd vend-oauth-example
3. npm install
4. bower install
5. edit `config/development.json` and fill out your vend developer `client_id` and `client_secret` which can be found here: https://developers.vendhq.com/developer/applications
5. cd node_modules/vend-nodejs-sdk
8. npm install
9. cd ../..

## run
grunt server --subdomain yourUniqueDummyDomainName

## contributions

You can pick and choose from the existing issues for any features you want to help add, or any bugs you want to crush. Get in touch via the chat link above if you wish to contribute and have specific questions. Otherwise, jsut fork the repo, make your changes and when you're ready, issue a pull-request for review.

!/bin/bash
./node_modules/bower/bin/bower install
./node_modules/grunt-cli/bin/grunt server
./node_modules/grunt-cli/bin/grunt jshint
./node_modules/grunt-cli/bin/grunt loadConfig
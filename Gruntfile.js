'use strict';

module.exports = function (grunt) {
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  grunt.initConfig({
    yeoman: {
      // configurable paths
      app: require('./bower.json').appPath || 'app',
      api: 'lib/api'
    },
    express: {
      options: {
        script: 'server.js',
        port: process.env.PORT || 9090,
        livereload: true
      },
      development: {
        options: {
          'node_env': 'development'
        }
      }
    },
    watch: {
      express: {
        files: [
          '<%= yeoman.app %>/{,*//*}*.html',
          '{.tmp,<%= yeoman.app %>}/styles/{,*//*}*.css',
          '{.tmp,<%= yeoman.app %>}/scripts/{,*//*}*.js',
          '<%= yeoman.app %>/images/{,*//*}*.{png,jpg,jpeg,gif,webp,svg}',
          'server.js',
          'lib/{,*//*}*.{js,json}'
        ],
        tasks: ['express:development'],
        options: {
          livereload: true,
          spawn: false //Without this option specified express won't be reloaded
        }
      },
      styles: {
        files: ['<%= yeoman.app %>/styles/{,*/}*.css'],
        tasks: ['copy:styles', 'autoprefixer']
      }
    },
    clean: {
      server: '.tmp'
    },
    jshint: {
      server:{
        options: {
          jshintrc: '.jshintrc',
          reporter: require('jshint-stylish')
        },
        files: {
          src: [
            'Gruntfile.js',
            'server.js',
            '<%= yeoman.api %>/{,*/}*.js'
          ]
        }
      },
      client: {
        options: {
          jshintrc: 'app/.jshintrc',
          reporter: require('jshint-stylish')
        },
        files: {
          src: '<%= yeoman.app %>/scripts/{,*/}*.js'
        }
      }
    },
    // Put files not handled in other tasks here
    copy: {
      styles: {
        expand: true,
        cwd: '<%= yeoman.app %>/styles',
        dest: '.tmp/styles/',
        src: '{,*/}*.css'
      }
    },
    env: {
      options: {},
      development: {
        'site:baseUrl': '<%= buildProperties.site.baseUrl %>'
      },
      staging: {},
      production: {}
    },
    replace: {
      dev: {
        options: {
          patterns: [
            {
              json: {
                vendAuthEndpoint: '<%= buildProperties.vend.auth_endpoint %>',
                vendClientId: '<%= buildProperties.vend.client_id %>',
                baseUrl: '<%= buildProperties.site.baseUrl %>'
              }
            }
          ]
        },
        files: [
          { src: '<%= yeoman.app %>/scripts/app-constants.js', dest: '.tmp/scripts/app-constants.js'}
        ]
      }
    },
    localtunnel: {
      dev: {
        options: {
          subdomain: grunt.option('subdomain') || 'pleaseSetSubDomain',
          port: '<%= express.options.port %>',
          open: true,
          keepalive: false,
          handleTunnelSuccess: function(tunnel) {
            grunt.config('buildProperties.site.baseUrl', tunnel.url);
            console.log('tunnel.url: ', tunnel.url);
          }
        }
      }
    }
  });

  grunt.registerTask('loadConfig', function(target){
    var environment = target || 'development';

    var config = grunt.file.readJSON('config/' + environment + '.json');
    config.environment = environment;
    grunt.config('buildProperties', config);
  });

  /**
   *   grunt server --subdomain vendstore1
   */
  grunt.registerTask('server', function () {
    // TODO: perhaps add a grunt task to start redis?
    //       a) https://www.npmjs.org/package/grunt-redis, or
    //       b) https://www.npmjs.org/package/connect-redis
    return grunt.task.run([
      'jshint',
      'loadConfig:development',
      'localtunnel:dev',
      'clean:server',
      'env:development',
      'replace:dev',
      'express:development',
      'watch'
    ]);
  });

};

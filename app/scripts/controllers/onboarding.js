angular.module('DemoApp')
  .controller('OnboardingCtrl', [
    '$scope','$http','$sessionStorage', '$stateParams','$state','$filter',//angular namespace
    'vendAuthEndpoint','vendTokenService','vendClientId','baseUrl',//constants
    function (
      $scope,$http,$sessionStorage, $stateParams,$state,$filter,//angular namespace
      vendAuthEndpoint,vendTokenService,vendClientId,baseUrl)//constants
    {
      'use strict';

      $scope.vendClientId=vendClientId;
      $scope.vendAuthEndpoint=vendAuthEndpoint;
      $scope.vendTokenService=vendTokenService;
      $scope.baseUrl=baseUrl;

      // =========
      // Load Page
      // =========

      var loadCurrentStatus = function(){
        return $http.get(baseUrl + '/current')
          .success(function(response){
            /*jshint camelcase: false*/
            console.log(response);
            $scope.currentState = response;
            $scope.domainPrefix = $scope.currentState.oauth.domain_prefix;
          })
          .error(function(error){
            console.log(error);
          });
      };
      loadCurrentStatus();

      // ==================
      // Vend related code
      // ==================

      $scope.vend = {};
      $scope.vend.loginUrl = function() {
        console.log('inside $scope.vend.loginUrl()');
        var loginUrl;
        if ($scope.domainPrefix && $scope.domainPrefix.length > 0 && $scope.domainPrefix.trim().length > 0) {
          $scope.vend.tokenService = vendTokenService.replace(/\{DOMAIN_PREFIX\}/, $scope.domainPrefix.trim());
          $scope.vend.authEndpoint = vendAuthEndpoint.replace(/\{DOMAIN_PREFIX\}/, $scope.domainPrefix.trim());
          var clientId = encodeURIComponent(vendClientId);
          var redirectUri = encodeURIComponent(baseUrl + '/token/vend');
          loginUrl = $scope.vend.authEndpoint  +
            '?response_type=code' +
            '&client_id=' + clientId +
            '&redirect_uri=' + redirectUri +
            '&state=' + 'any static data which your app needs to continue oauth workflow when user comes back';
        }
        return loginUrl;
      };
      //console.log('Vend Url: ', $scope.loginUrl);

      $scope.vend.refreshAccessToken = function() {
        $http.get(baseUrl + '/token/vend/refresh')
          .success(function(response){
            /*jshint camelcase: false*/
            console.log(response);
            return loadCurrentStatus(); // we want to update the time on-screen for the newest accessToken
          })
          .error(function(error){
            console.log(error);
          });
      };

    }
  ]);

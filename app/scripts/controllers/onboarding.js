angular.module('DemoApp')
  .controller('OnboardingCtrl', [
    '$scope','$http','$sessionStorage', '$stateParams','$state','$filter',//angular namespace
    'vendAuthEndpoint','vendClientId','baseUrl',//constants
    function (
      $scope,$http,$sessionStorage, $stateParams,$state,$filter,//angular namespace
      vendAuthEndpoint,vendClientId,baseUrl)//constants
    {
      'use strict';

      $scope.vendClientId=vendClientId;
      $scope.vendAuthEndpoint=vendAuthEndpoint;
      $scope.baseUrl=baseUrl;

      // ====================================================
      // Data Binding code for onboarding_addStoreConfig.html view
      // ====================================================

      $scope.addNewStoreConfig = function(){
        console.log('addNewStoreConfig()');
      };

      // ==================
      // Vend related code
      // ==================

      $scope.vend = {};
      $scope.vend.loginUrl = function() {
        console.log('inside $scope.vend.loginUrl()');
        var loginUrl;
        if ($scope.domainPrefix && $scope.domainPrefix.length > 0 && $scope.domainPrefix.trim().length > 0) {
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
    }
  ]);

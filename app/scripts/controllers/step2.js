/**
 * Created by Megha on 6/5/15.
 */
angular.module('DemoApp')
  .controller('Step2Ctrl', ['$scope','$http','$stateParams','vendTokenService','vendAuthEndpoint','baseUrl',
    function($scope,$http,$stateParams, vendTokenService, vendAuthEndpoint, baseUrl){
      'use strict';

      $scope.baseUrl = baseUrl;
      console.log('$stateParams: '+ $stateParams.clientId);
      $scope.vend = {};
      $scope.vend.loginUrl = function() {
        console.log('inside $scope.vend.loginUrl()');
        var loginUrl;
        if ($scope.domainPrefix && $scope.domainPrefix.length > 0 && $scope.domainPrefix.trim().length > 0) {
          $scope.vend.tokenService = vendTokenService.replace(/\{DOMAIN_PREFIX\}/, $scope.domainPrefix.trim());
          $scope.vend.authEndpoint = vendAuthEndpoint.replace(/\{DOMAIN_PREFIX\}/, $scope.domainPrefix.trim());
          var ClientId = encodeURIComponent($stateParams.clientId);
          var redirectUri = encodeURIComponent(baseUrl + '/token/vend');
          loginUrl = $scope.vend.authEndpoint  +
          '?response_type=code' +
          '&client_id=' + ClientId +
          '&redirect_uri=' + redirectUri +
          '&state=' + $stateParams.clientId +','+ $scope.vend.clientSecret;
        }
        return loginUrl;
      };
    }]);

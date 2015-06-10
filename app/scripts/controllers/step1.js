/**
 * Created by Megha on 5/28/15.
 */
angular.module('DemoApp')
  .controller('Step1Ctrl', ['$scope','$http','$state','vendTokenService','vendAuthEndpoint','baseUrl',
    function($scope,$http, $state, vendTokenService, vendAuthEndpoint, baseUrl){
      'use strict';

      $scope.baseUrl = baseUrl;

      $scope.vend = {};
      $scope.next = function(){
        return $http.get('/vend/current/'+ $scope.vend.clientId)
          .then(function(response){
            console.log('Response: '+ JSON.stringify(response));
            if(response.data === $scope.vend.clientId){
              $state.go('step2',{
                'clientId': response.data
              });
            }
            else {
              $state.go('home', {
                'clientId': $scope.vend.clientId
              });
            }
          });
      };

    }]);

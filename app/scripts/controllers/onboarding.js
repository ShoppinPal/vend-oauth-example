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

      $scope.jsoneditorOptions = {
        'mode': 'view'
      };
      $scope.json = {};


      // =========
      // Load Page
      // =========

      $scope.vend = {};
      $scope.refresh = {};

      console.log($stateParams.clientId);
      $http.get(baseUrl + '/vend/current/'+$stateParams.clientId)
        .success(function(response){
          /*jshint camelcase: false*/
          if(!response.access_token && !response.refresh_token){
            $state.go('step1');
          }
          else {
            console.log(response);
            $scope.vend = response;
            $scope.refresh.clientId = $stateParams.clientId;
          }
        })
        .error(function(error){
          console.log(error);
        });



      // ==================
      // Vend related code
      // ==================

      $scope.refreshAccessToken = function() {
        console.log('inside refresh: '+ $stateParams.clientId + '-'+ $scope.refresh.clientSecret);
        $http.get(baseUrl + '/token/vend/refresh',{params: {
          clientId: $stateParams.clientId,
          clientSecret: $scope.refresh.clientSecret
        }
        })
          .success(function(){
            /*jshint camelcase: false*/
            $state.go($state.$current, null, {reload: true});
          })
          .error(function(error){
            console.log(error);
          });
      };

      $scope.fetchProducts = function() {
        console.log('inside products: '+ $stateParams.clientId + '-'+ $scope.refresh.clientSecret);

        $http.get(baseUrl + '/vend/fetchProducts',{params: {
          clientId: $stateParams.clientId,
          clientSecret: $scope.refresh.clientSecret
        }
        })
          .success(function(response){
            /*jshint camelcase: false*/
            $scope.json = response;
            $scope.jsoneditorOptions.name = 'fetchProducts';
          })
          .error(function(error){
            console.log(error);
          });
      };

    }
  ]);

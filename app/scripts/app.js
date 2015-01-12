'use strict';

angular.module('DemoApp', [
    'ui.bootstrap'
    ,'ngCookies'
    ,'ngResource'
    ,'ngSanitize'
    ,'ui.router'
    ,'ngStorage'
    ,'ui.utils'
    ,'app-constants'
    ,'ngJsonEditor'
  ])
  .config(['$stateProvider', '$urlRouterProvider',function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('done',{
        url: '/done',
        templateUrl: 'views/done.html',
        authenticate: true
      })
      .state('home',{
        url: '/home',
        templateUrl: 'views/onboarding.html',
        controller: 'OnboardingCtrl',
        authenticate: true
      });

    $urlRouterProvider.otherwise('/home');
  }]);

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
  ])
  .config(['$stateProvider', '$urlRouterProvider',function ($stateProvider, $urlRouterProvider) {
    $stateProvider
      .state('step1',{
        url: '/step1',
        templateUrl: '../views/step1.html',
        controller: 'Step1Ctrl',
        authenticate: true
      })
      .state('step2',{
        url: '/step2/:clientId',
        templateUrl: '../views/step2.html',
        controller: 'Step2Ctrl',
        authenticate: true
      })
      .state('home',{
        url: '/home/:clientId',
        templateUrl: 'views/onboarding.html',
        controller: 'OnboardingCtrl',
        authenticate: true
      });

    $urlRouterProvider.otherwise('/step1');
  }]);

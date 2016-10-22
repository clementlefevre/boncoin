//
var bonCoinApp = angular.module('bonCoinApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'LocalStorageModule', 'smart-table']);

bonCoinApp.config(function ($routeProvider, $httpProvider, localStorageServiceProvider) {

    localStorageServiceProvider.setPrefix('bon_coin');

    $routeProvider.when('/search_agents', {
        templateUrl: '/static/partials/search_agents.html',
        controller: 'searchAgentsController'
    });

    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

    $httpProvider.interceptors.push(function ($rootScope, $q) {
        return {
            'responseError': function (rejection) {
                if (rejection.status === 401 || rejection.status === 403) {
                    console.log(rejection.status);
                    $rootScope.$broadcast('event:login-required', rejection);
                }
                return $q.reject(rejection);
            }
        };
    });
//

});



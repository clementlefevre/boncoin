//
var exampleApp = angular.module('exampleApp', ['ngRoute', 'ngAnimate', 'ui.bootstrap', 'LocalStorageModule', 'smart-table']);

exampleApp.config(function ($routeProvider, $httpProvider, localStorageServiceProvider) {

    localStorageServiceProvider.setPrefix('image_matcher');

    $routeProvider.when('/search_images', {
        templateUrl: '/static/partials/search_images.html',
        controller: 'search_imagesController'
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


exampleApp.controller('FormController1',
    function ($scope) {
        $scope.buttonClicked = function () {
            $scope.modText = "Hello " + $scope.inputText + " from controller 1";
        };

    });

exampleApp.controller('FormController2',
    function ($scope) {
        $scope.buttonClicked = function () {
            $scope.modText = "Hello " + $scope.inputText + " from controller 2";
        };


    }); 
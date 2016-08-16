var hermesApp = angular.module('hermesApp', ['ngRoute', 'ngMessages', 'uiGmapgoogle-maps', 'ui.bootstrap', 'ngSanitize', 'ui.select', 'ngCookies', 'LocalStorageModule']);

hermesApp.config(function ($routeProvider, $httpProvider, localStorageServiceProvider) {

    localStorageServiceProvider.setPrefix('hermes');

    $routeProvider.when('/login', {
        templateUrl: 'login.html',
        controller: 'navigation'
    }).when('/customers', {
        templateUrl: '/partials/customers.html',
        controller: 'customerController'
    }).when('/users', {
        templateUrl: '/partials/users.html',
        controller: 'usersController'
    }).when('/matching', {
        templateUrl: '/partials/matching.html',
        controller: 'matchingController'
    }).when('/sites', {
        templateUrl: '/partials/sites.html',
        controller: 'siteController'
    }).when('/siteDetails', {
            templateUrl: '/partials/siteDetails.html',
            controller: 'siteDetailsController'
        })
        .when('/missing_customers', {
            templateUrl: '/partials/missing_customers.html',
            controller: 'missingCustomersController'
        }).otherwise('/customers');

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


hermesApp.filter('propsFilter', function () {
    return function (items, props) {
        var out = [];

        if (angular.isArray(items)) {
            items.forEach(function (item) {
                var itemMatches = false;

                var keys = Object.keys(props);
                for (var i = 0; i < keys.length; i++) {
                    var prop = keys[i];
                    var text = props[prop].toLowerCase();
                    if (item[prop].toString().toLowerCase().indexOf(text) !== -1) {
                        itemMatches = true;
                        break;
                    }
                }
                if (itemMatches) {
                    out.push(item);
                }
            });
        } else {
            // Let the output be the input untouched
            out = items;
        }

        return out;
    }
});

hermesApp.directive('datepickerPopup', function () {
    return {
        restrict: 'EAC',
        require: 'ngModel',
        link: function (scope, element, attr, controller) {
            //remove the default formatter from the input directive to prevent conflict
            controller.$formatters.shift();
        }
    }
});

hermesApp.controller(
    'navigation',


    function ($rootScope, $scope, $http, $location, $route, $interval) {


        $scope.currentYear = new Date().getFullYear();

        $scope.version = $http.get('/info').success(function (data) {
            $scope.version = data.application.version;

        });


        getUserName();


        function getUserName() {
            $http.get('/customers/user')
                .success(function (data) {
                    console.log("current user : " + data.username);
                    $scope.username = data.username;
                    $scope.isAdmin = (data.isAdmin == "true") ? true : false;

                    if (!$scope.isAdmin) {
                        $scope.minimizeBottom();
                    }
                });
        }

        $scope.updateGrantedCustomers = function () {
            $http.post('/customers/update_granted', null)
                .success(function (data) {
                    console.log("update of granted customer successful");

                });

        }


        $scope.$on('event:login-required', function () {
            console.log("event:login-required");
            $window.location.href = 'login.html';
        });


        function getLogs() {
            $http.get('/logs/')
                .success(function (dataLogs) {
                    $rootScope.logs = dataLogs;
                });
        };


        $interval(getLogs, 5000);


        $scope.tab = function (route) {
            return $route.current && route === $route.current.controller;
        };

        $scope.minimizeBottom = function () {
            angular.element(document.getElementById("bottom-component")).toggle();
            if (angular.element(document.getElementById("bottom-component")).css("display") == "none") {
                angular.element(document.getElementById("top-component")).css("bottom", "0px");
            } else {
                angular.element(document.getElementById("top-component")).css("bottom", "20em");
            }

        }

    });


hermesApp.service('GlobalSettings', function ($http, $route, $filter) {
    this.selectedCustomer = null;
    this.selectedSite = null;

    this.getSelectedCustomer = function () {
        console.log(selectedCustomer.id);
        return this.selectedCustomer;
    };
    this.setSelectedCustomer = function (customer) {
        console.log("displayCustomerDetailClick var : " + customer.customer);
        this.selectedCustomer = customer;
    };

    this.getSelectedSite = function () {
        console.log(selectedSite.id);
        return this.selectedSite;
    };
    this.setSelectedSite = function (site) {
        console.log("displaySiteDetailClick var : " + site.name);
        this.selectedSite = site;
    };


    this.loadingDatas = function () {
        bootbox.dialog({
                message: '<span class="fa fa-cog fa-spin fa-4x"></span>',
                title: '<div ng-show="loading"> Retrieving Data... </div > '
            }
        );
    };
    this.closeLoading = function () {
        bootbox.hideAll();
    };


    this.createBlankOpeningHours = function () {
        var openingHours = {};

        openingHours.from = $filter('date')(new Date("2000-01-01"), 'medium');
        openingHours.isNew = false;
        openingHours.openingHours = []
        for (var i = 0; i < 7; i++) {
            openingHours.openingHours[i] = {
                weekDay: i + 1,
                fromHours: "00",
                fromMinutes: "00",
                toHours: "00",
                toMinutes: "00",
                overMidnight: false,
                closed: false
            }

        }
        return openingHours;
    }

    this.convertDateToUTC = function (date) {
        if (typeof date.getTime == 'function') {
            return date.getTime();
        } else {
            return date;
        }
    }

    this.convertUTCToDate = function (sites) {
        for (var i = 0; i < sites.length; i++) {
            if (sites[i].calibrationEnd < 0) {
                var calibrationEndDate = new Date()
            } else {
                var calibrationEndDate = new Date(sites[i].calibrationEnd)
            }
            sites[i].calibrationEnd = calibrationEndDate;
        }
    }

    this.isOpeningHoursValid = function (fromHours, fromMinutes, toHours, toMinutes) {
        var periodLength = (parseInt(toHours) * 60 + parseInt(toMinutes)) - (parseInt(fromHours)
            * 60 + parseInt(fromMinutes));

        if (periodLength >= 0) {
            return true;

        } else {
            return false;
        }
    }

});

hermesApp.factory('RestServices', function ($http) {

    var notConnectedChannels = function (customerIdentifier) {
        return $http.get('customers/' + customerIdentifier + '/channels/notconnected/').then(function (data) {
            return data;

        });
    };

    var getSiteDetails = function (customerIdentifier, siteId) {
        return $http.get('customer/' + customerIdentifier + '/site/' + siteId).then(function (data) {
            return data;
        });
    }

    var getSitesList = function (customerIdentifier) {
        return $http.get('/customers/sites/' + customerIdentifier).success(function (data) {
            return data;
        });
    }


    return {
        notConnectedChannels: notConnectedChannels,
        getSiteDetails: getSiteDetails,
        getSitesList: getSitesList,

    }

});




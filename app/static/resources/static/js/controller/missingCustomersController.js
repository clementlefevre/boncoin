/**
 * Created by lefevre on 07.09.2015.
 */

hermesApp.controller('missingCustomersController', function ($rootScope, $scope, GlobalSettings, $http, $route, $window) {
    console.log("Missing Sites Controller  reporting for duty.");


    function initData() {
        $scope.loading_missing_customers_in_MD = true
        $scope.loading_missing_customers_in_confluence = true;

        $http.get('/customers/missing_in_master_device_db').
            success(function (data) {
                $scope.missing_customers_in_MD = data;
                $scope.loading_missing_customers_in_MD = false;


            });

        $http.get('/customers/configuration').
            success(function (data) {
                $scope.masterDevicesUrl = data;


            });


        $http.get('/customers/missing_in_confluence').
            success(function (data) {
                $scope.missing_customers_in_confluence = data;
                $scope.loading_missing_customers_in_confluence = false;

            });


    }

    $scope.updateCustomersLists = function () {
        $scope.loading_customers_list = true;
        $scope.loading_missing_customers_in_MD = true
        $scope.loading_missing_customers_in_confluence = true;


        $http.get('/customers/update_customers_lists').
            success(function (data) {
                $scope.loading_customers_list = false;
                initData();

            });
    }


    $scope.sort = {
        column: 'name',
        descending: false
    };
    $scope.changeSorting = function (column) {

        var sort = $scope.sort;

        if (sort.column == column) {
            sort.descending = !sort.descending;
        } else {
            sort.column = column;
            sort.descending = false;
        }
    };


    initData();

});

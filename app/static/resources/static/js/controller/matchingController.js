/**
 * Created by lefevre on 07.09.2015.
 */

hermesApp.controller('matchingController', function ($rootScope, $scope, GlobalSettings, $http, $route, $window, localStorageService) {


    function initData() {
        $scope.loading = true;
        $http.get('customers/sites/matching').success(function (data) {
            $scope.matchingSites = data;
            $scope.loading = false;

        });
    }




    $scope.sort = {
        column: 'customerName',
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

/**
 * Created by lefevre on 07.09.2015.
 */

hermesApp.controller('usersController', function ($rootScope, $scope, GlobalSettings, $http, $route, $window, localStorageService) {
    console.log("Page Controller users reporting for duty.");


    function initData() {
        $scope.loading = true;
        $http.get('customers/users/all').success(function (data) {
            $scope.users = data;

            console.log("number of users found : " + $scope.users.length);
            $scope.loading = false;

        });
    }

    $scope.sort = {
        column: 'last_name',
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

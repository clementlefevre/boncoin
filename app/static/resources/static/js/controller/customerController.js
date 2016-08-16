/**
 * Created by lefevre on 07.09.2015.
 */

hermesApp.controller('customerController', function ($rootScope, $scope, GlobalSettings, $http, $route, $window, localStorageService) {
    console.log("Page Controller customers reporting for duty.");

    $scope.displayCustomerDetailClick = function (customer, pathToGo) {

        localStorageService.set("customer", customer);

        $scope.$emit('displayCustomerEmit', {customer: customer});
        console.log("customerData " + customer);
        GlobalSettings.setSelectedCustomer(customer);
        $rootScope.selectedCustomer = GlobalSettings.selectedCustomer.name;

        $window.location.href = '#/' + pathToGo;
        $route.reload();

    };


    function initData() {
        $scope.loading = true;
        $http.get('/customers/all').success(function (data) {
            $scope.customers = data;

            console.log("number of Customers found : " + $scope.customers.length);
            $scope.loading = false;

        }).error(function (data, status, headers, config) {
            console.log("Error fetching sites");
            GlobalSettings.closeLoading();
            $scope.editMode = false;
            bootbox.alert(data.exception);
            return;
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

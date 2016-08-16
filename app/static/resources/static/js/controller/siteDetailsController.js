/**
 * Created by lefevre on 07.09.2015.
 */

hermesApp.controller('siteDetailsController', function ($rootScope, GlobalSettings, $scope, $http, $route) {
    console.log(" Controller siteDetails reporting for duty.");

    initSiteDetailsData();

    function initSiteDetailsData() {
        $scope.loading = false;
        console.log("start function Init SiteDetails");
        $scope.site = GlobalSettings.selectedSite;

    }


    $scope.sort = {
        column: '',
        descending: false
    };

    $scope.changeSorting = function (column) {

        var sort = $scope.sort;

        if (sort.column === column) {
            sort.descending = !sort.descending;
        } else {
            sort.column = column;
            sort.descending = false;
        }
    };


})
;

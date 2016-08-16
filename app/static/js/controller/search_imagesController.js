/**
 * Created by lefevre on 07.09.2015.
 */

exampleApp.controller('search_imagesController', function ($rootScope, $scope, $http, $route) {
    console.log("search_imagesController reporting for duty.");


    $scope.search = {
        'caption': '', 'date_from': '', 'date_to': ''
    };

    var loadingDatas = function () {
        bootbox.dialog({
                message: '<span class="fa fa-cog fa-spin fa-4x"></span>',
                title: '<div ng-show="loading"> Retrieving Data... </div > '
            }
        );
    };
    var closeLoading = function () {
        bootbox.hideAll();
    };


    $scope.search_images = function (search) {

        loadingDatas();
        $scope.rowCollection = [];

        $http.post('images/', search).success(function (data) {
            closeLoading();

            $scope.rowCollection = data.result;
            $scope.itemsByPage = 10;

        }).error(function (data, status) {
            alert("Search error. Please try again or contact administrator.");
            return status;
        });


    };

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

    $scope.today = function () {
        $scope.dt = new Date();
    };
    $scope.today();


    $scope.inlineOptions = {
        customClass: getDayClass,
        minDate: new Date(),
        showWeeks: true
    };

    $scope.dateOptions = {
        dateDisabled: disabled,
        formatYear: 'yy',
        maxDate: new Date(2020, 5, 22),
        minDate: new Date(2010, 1, 1),
        startingDay: 1
    };

    // Disable weekend selection
    function disabled(data) {
        var date = data.date,
            mode = data.mode;
        return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.toggleMin = function () {
        $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
        $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    };

    $scope.toggleMin();

    $scope.open_from = function () {
        $scope.open_from.opened = true;
    };

    $scope.open_to = function () {
        $scope.open_to.opened = true;
    };

    $scope.setDate = function (year, month, day) {
        $scope.dt = new Date(year, month, day);
    };

    $scope.format = 'dd-MMMM-yyyy';
    $scope.altInputFormats = ['M!/d!/yyyy'];

    $scope.popup_from = {
        opened: false
    };

    $scope.popup_to = {
        opened: false
    };

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 1);
    $scope.events = [
        {
            date: tomorrow,
            status: 'full'
        },
        {
            date: afterTomorrow,
            status: 'partially'
        }
    ];

    function getDayClass(data) {
        var date = data.date,
            mode = data.mode;
        if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

            for (var i = 0; i < $scope.events.length; i++) {
                var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

                if (dayToCheck === currentDay) {
                    return $scope.events[i].status;
                }
            }
        }

        return '';
    }

});

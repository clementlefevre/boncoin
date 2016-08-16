hermesApp.controller('openingHoursController', function ($rootScope, $scope, $modalInstance, newOpeningHours, $filter, GlobalSettings, siteToEdit) {
    $scope.siteToEdit = siteToEdit;
    $scope.minDate = newOpeningHours.minDate;
    $scope.newOpeningHours = newOpeningHours.openingHours;
    $scope.newOpeningHours.from = GlobalSettings.convertDateToUTC($scope.minDate)
    $scope.isValid = false;
    $scope.openingHoursList = ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24'];
    $scope.openingMinutesList = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
    $rootScope.openingHours = null;
    
    $scope.setAllDaySameOpeningHours = function () {
        for (var i = 1; i < $scope.newOpeningHours.openingHours.length; i++) {
            $scope.newOpeningHours.openingHours[i].fromHours = newOpeningHours.openingHours.openingHours[0].fromHours;
            $scope.newOpeningHours.openingHours[i].fromMinutes = newOpeningHours.openingHours.openingHours[0].fromMinutes;
            $scope.newOpeningHours.openingHours[i].toHours = newOpeningHours.openingHours.openingHours[0].toHours;
            $scope.newOpeningHours.openingHours[i].toMinutes = newOpeningHours.openingHours.openingHours[0].toMinutes;
            $scope.newOpeningHours.openingHours[i].overMidnight = newOpeningHours.openingHours.openingHours[0].overMidnight;
            $scope.newOpeningHours.openingHours[i].closed = newOpeningHours.openingHours.openingHours[0].closed;

        }
        $scope.validate();

    }

    $scope.saveNewOpeningTimes = function () {
        $scope.newOpeningHours.isNew = true;
        $scope.newOpeningHours.from = $filter('date')($scope.newOpeningHours.from, 'medium');
        $scope.siteToEdit.openingHoursWrapper[0] = $scope.newOpeningHours;
        $modalInstance.close($scope.newOpeningHours);
        $rootScope.openingHours = "changed";
    };

    $scope.cancelOpeningTimes = function () {

        $modalInstance.dismiss('cancel');
    };


    $scope.validate = function () {
        for (var i = 0; i < $scope.newOpeningHours.openingHours.length; i++) {
            if (!GlobalSettings.isOpeningHoursValid($scope.newOpeningHours.openingHours[i].fromHours, $scope.newOpeningHours.openingHours[i].fromMinutes, $scope.newOpeningHours.openingHours[i].toHours, $scope.newOpeningHours.openingHours[i].toMinutes)) {
                $scope.isValid = false;
                return;
            }
        }
        if ($scope.newOpeningHours.from < $scope.siteToEdit.openingHoursWrapper[0].from) {
            $scope.isValid = false;
            return;
        }
        $scope.isValid = true;
    }
});

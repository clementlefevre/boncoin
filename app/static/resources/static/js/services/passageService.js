/**
 * Created by kukuljac on 22.02.2016.
 */


hermesApp.factory('PassageService', function ($http, GlobalSettings) {

    function saveNewPassage(customerIdentifier, siteToEditId, newPassage) {
        GlobalSettings.loadingDatas();
        return $http.post('customers/' + customerIdentifier + '/' + siteToEditId + '/passages/create_passage', newPassage).then(
            function (response) {
                GlobalSettings.closeLoading();
                return response;

            });
    }

    function editPassage(customerIdentifier, siteToEditId, passage) {
        GlobalSettings.loadingDatas();
        return $http.post('customers/' + customerIdentifier + '/' + siteToEditId + '/passages/edit_passage', passage).then(
            function (response) {
                GlobalSettings.closeLoading();
                return response;
            });
    }

    function getChannelsList(customerIdentifier, passageId) {
        return $http.get('/customers/' + customerIdentifier + '/passages/' + passageId + '/channels')
            .success(function (data) {
                return data;
            });
    }

    function getConnectorWrappersList(customerIdentifier, passageId) {
        return $http.get('/customers/' + customerIdentifier + '/passages/' + passageId + '/connectorWrappers')
            .success(function (data) {
                return data;
            });
    }

    function getAvailablesEntrances(customerIdentifier, siteId, all_passages) {

        return $http.get('/customers/' + customerIdentifier + '/' + siteId + '/not_connected_entrances')
            .success(function (data) {
                return data;
            });

    }

    function saveNewCaptureRate(customerIdentifier, siteToEditId, captureRateWrapper) {
        GlobalSettings.loadingDatas();
        return $http.post('customers/' + customerIdentifier + '/' + siteToEditId + '/passages/add_capture_rate', captureRateWrapper).success(
            function (response) {
                GlobalSettings.closeLoading();
                bootbox.alert("Sidewalk successfully created!");
                return response;
            }).error(function (data, status, headers, config) {
            bootbox.alert("Sidewalk is not created. Please try again or contact administrator.");
        });
    }

    return {
        saveNewPassage: saveNewPassage,
        editPassage: editPassage,
        getChannelsList: getChannelsList,
        getConnectorWrappersList: getConnectorWrappersList,
        getAvailablesEntrances: getAvailablesEntrances,
        saveNewCaptureRate: saveNewCaptureRate
    }

});



/**
 * Created by lefevre on 07.09.2015.
 */

hermesApp.controller('siteController', function ($rootScope, GlobalSettings, RestServices, PassageService, SiteService, $scope, $window, $http, $route, $modal, $log, $filter, localStorageService, uiGmapIsReady) {

        var dilaxCoordinates = {latitude: 52.523954, longitude: 13.345434};
        $scope.test = {};
        $scope.countryValid = false;
        $scope.languages = ['de', 'en', 'fr', 'ru'];
        $scope.time = new Date();
        $scope.passages = [];
        $scope.passages.newPassage = "";
        GlobalSettings.loadingDatas();
        initSiteData();

        $scope.editMode = false;
        $scope.createMode = false;

        $scope.bbbSensorTypeId = 7;


        function initSiteData(messageText) {

            if (GlobalSettings.selectedCustomer == null) {
                GlobalSettings.selectedCustomer = angular.fromJson(localStorageService.get("customer"));
            }

            getTimeZones();
            getCountries();
            getTags();


            RestServices.getSitesList(GlobalSettings.selectedCustomer.identifier).success(function (data) {
                $scope.sites = data;
                GlobalSettings.convertUTCToDate($scope.sites);
                $scope.currentCustomer = GlobalSettings.selectedCustomer.name;
                GlobalSettings.closeLoading();
                if (typeof  messageText !== 'undefined') {
                    bootbox.alert(messageText);
                }
            });
        }

        $scope.editSite = function (site) {
            $rootScope.openingHours = null;
            initData();
            localStorageService.set("site", site);
            if (typeof site.id === 'undefined') {
                initializeSiteCreation(site)
            } else {
                initializeSiteEdition(site);
            }
            $scope.editMode = true;
            $scope.siteToEdit = site;
            $scope.siteToEdit.devices = [];
            $scope.siteToEdit.connectors = [];
            $scope.info_text = undefined

            if (typeof site.id === 'undefined' || typeof  site.coordinates === 'undefined') {
                var latitude = dilaxCoordinates.latitude;
                var longitude = dilaxCoordinates.longitude;

            } else {
                var latitude = site.coordinates.latitude;
                var longitude = site.coordinates.longitude;
            }

            $scope.map = {center: {latitude: latitude, longitude: longitude}, zoom: 10};

            $scope.marker = {
                id: 0,
                coords: {
                    latitude: latitude,
                    longitude: longitude
                },
                options: {draggable: true}
            };

        };

        function initializeSiteCreation(site) {
            delete  site.site;
            $scope.minCalibrationDate = GlobalSettings.convertDateToUTC(new Date());
            $scope.createMode = true;
            $scope.siteToEdit = [];
            site.openingHoursWrapper = [2];
            site.openingHoursWrapper[0] = GlobalSettings.createBlankOpeningHours();
            site.openingHoursWrapper[1] = site.openingHoursWrapper[0];
            site.tagsWrapper = $scope.tags;
            site.calibrationEnd = $scope.minCalibrationDate;
            $scope.selectedCountry = "select a country";
            site.addressWrapper = {};
            $scope.countryValid = false;

        }

        function initializeSiteEdition(site) {

            GlobalSettings.loadingDatas();

            RestServices.getSiteDetails(GlobalSettings.selectedCustomer.identifier, site.id).then(function (result) {

                if (result.data[0] != undefined)
                    $scope.siteToEdit = result.data[0];
                if (site.calibrationEnd.getFullYear() < 2010) {
                    $scope.minCalibrationDate = new Date();
                    $scope.siteToEdit.calibrationEnd = $scope.minCalibrationDate;
                } else {
                    $scope.minCalibrationDate = $scope.siteToEdit.calibrationEnd;
                }


                $scope.countryValid = true;

                if ($scope.siteToEdit.addressWrapper != undefined) {
                    $scope.siteToEdit.addressWrapper.country = findCountryById($scope.siteToEdit)
                    $scope.selectedCountry = $scope.siteToEdit.addressWrapper.country.name;
                } else {
                    $scope.siteToEdit.addressWrapper = {};
                }

                RestServices.notConnectedChannels(GlobalSettings.selectedCustomer.identifier).then(function (result) {

                    $scope.notConnectedChannels = result.data

                    $scope.notConnectedChannels.sort(compareByNames)

                    $scope.filteredChannels = [];

                    updatePassageList();

                    GlobalSettings.closeLoading();
                })

            });

        }

        function compare(a, b) {
            if (a.sensor.device.identifier.serialNumber < b.sensor.device.identifier.serialNumber)
                return -1;
            else if (a.sensor.device.identifier.serialNumber > b.sensor.device.identifier.serialNumber)
                return 1;
            else
                return 0;
        }

        function compareByNames(a, b) {
            if (a.name < b.name)
                return -1;
            else if (a.name > b.name)
                return 1;
            else
                return 0;
        }


        $scope.updateSite = function (site) {
            customer = GlobalSettings.selectedCustomer;
            GlobalSettings.loadingDatas();


            if (validateInput(siteForm) && validateCountry()) {
                site.calibrationEnd = GlobalSettings.convertDateToUTC(site.calibrationEnd);

                $http.post('customers/' + customer.identifier + '/sites/update_site', site).success(function (data) {
                    $scope.info_text = site.newSiteName + " has been successfully updated.";
                    GlobalSettings.closeLoading();
                    $scope.editMode = false;
                    bootbox.alert(site.newSiteName + " has been successfully updated.", function () {
                        initSiteData();
                    });
                }).error(function (data, status, headers, config) {
                    console.log("site update ERROR");
                    GlobalSettings.closeLoading();

                    $scope.editMode = false;
                    bootbox.alert(data.exception);

                    return status;

                });

            }
        };

        $scope.createSite = function (site) {
            if (validateInput(siteForm)) {
                site.calibrationEnd = GlobalSettings.convertDateToUTC(site.calibrationEnd);
                customer = GlobalSettings.selectedCustomer;
                $http.post('customers/' + customer.identifier + '/sites/create_site', site).success(function (data) {
                    bootbox.alert("Site successfully created.");
                }).error(function (data, status, headers, config) {
                    bootbox.alert("Site not created. Please try again or contact administrator.");
                    return status;
                });
                $scope.editMode = false;
                $scope.createMode = false;


            }
        }

        $scope.createSiteInMasterDevice = function (site) {
            siteObject = {
                "id": site.id
            };
            $http.post('customers/' + customer.identifier + '/sites/master_devices/', siteObject).success(function (data) {

                bootbox.alert(site.newSiteName + "  successfully created in Master Devices DB", function () {
                    initSiteData();
                });
            }).error(function (data, status, headers, config) {
                bootbox.alert("Site not created in Master Devices DB. Please try again or contact administrator.");
                return status;
            });

        }


        $scope

        $scope.cancel = function () {
            $scope.editMode = false;
            $scope.createMode = false;
            $scope.selectedCountry = "select a country";

            $scope.siteToEdit = null;
            $scope.notConnectedPassages = null;
            $scope.filteredChannels = null;
            $scope.notConnectedSensors = null;
            $scope.notConnectedBBB = null;
            $scope.notConnectedChannels = [];
            $scope.selectedOrder = {}
            $scope.selectedPCUs = [];
            $scope.selectedSensors = [];
            $scope.selectedBBB = [];
            $scope.pcu = {};
            $scope.sensor = {};
            $scope.hideOrderSelection = false;
        }

        function validateInput(siteForm) {
            return ($scope.siteForm.$valid);
        }

        function validateCountry() {
            if (typeof $scope.siteToEdit.addressWrapper !== 'undefined') {
                $scope.countryValid = $scope.siteToEdit.addressWrapper.country.isoCode != 'undefined' && $scope.selectedCountry !== "select a country";
                return $scope.countryValid;
            } else {
                $scope.countryValid = false;
            }
            return $scope.countryValid;
        }

        function getTimeZones() {
            $http.get('/customers/sites/timezones').success(function (data) {
                $scope.timeZones = data;
            });
        };

        function getTags() {
            $http.get('/customers/' + customer.identifier + '/tags').success(function (data) {
                $scope.tags = data;
            });
        };

        function getCountries() {
            customer = GlobalSettings.selectedCustomer

            if (customer == null) {
                customer = angular.fromJson(localStorageService.get("customer"));

            }
            $http.get('/customers/' + customer.identifier + '/sites/countries').success(function (data) {
                $scope.countries = data;
            });

            $http.get('/customers/countriesISO').success(function (data) {
                $scope.countriesISO = data;
                $scope.countriesISO.sort(compareByNames)
            });


            if (typeof $scope.siteToEdit === 'undefined' || typeof $scope.siteToEdit.addressWrapper === 'undefined') {
                $scope.selectedCountry = "select a country";
            } else {
                var countryObj = findCountryById($scope.siteToEdit);
                $scope.siteToEdit.addressWrapper.country = countryObj;
            }
        };

        function findCountryById(site) {
            if (typeof site.addressWrapper === 'undefined') {
                return "no Country";
            }
            for (var i = 0; i < $scope.countries.length; i++) {
                if (site.addressWrapper.country.id == $scope.countries[i].id) {
                    countryISO = convertToISOCountry($scope.countries[i]);
                    return countryISO;
                }
            }
        }

        function convertToISOCountry(country) {
            var countryISOCodes = $scope.countriesISO;
            countryISO = {};

            countryISOCodes.forEach(function (oneCountry) {
                if (oneCountry.isoCode == country.isoCode) {
                    countryISO = oneCountry;
                }
            })
            return countryISO;
        }

        $scope.selectCountry = function (country) {
            $scope.siteToEdit.addressWrapper.country = country;
            $scope.selectedCountry = country.name;

        }


        $scope.refreshMap = function () {
            uiGmapIsReady.promise(1).then(function (instances) {
                instances.forEach(function (inst) {
                    var map = inst.map;
                    google.maps.event.trigger(map, 'resize');
                    if (map.getZoom() == 21)
                        map.setZoom(7);
                });
            });
        }

        $scope.setCoordinates = function () {

            if ($scope.createMode || typeof $scope.siteToEdit.coordinates === 'undefined') {
                $scope.siteToEdit.coordinates = {};
                $scope.siteToEdit.coordinates.latitude = 0;
                $scope.siteToEdit.coordinates.longitude = 0;
            }
            $scope.siteToEdit.coordinates.latitude = $scope.marker.coords.latitude;
            $scope.siteToEdit.coordinates.longitude = $scope.marker.coords.longitude;
        }

        $scope.sort_name = {
            column: 'newSiteName',
            descending: false
        };

        $scope.sort_order = {
            column: 'order',
            descending: false
        };

        $scope.changeSorting = function (column, sorter) {

            if (sorter.column === column) {
                sorter.descending = !sorter.descending;
            } else {
                sorter.column = column;
                sorter.descending = false;
            }
        };

        $scope.createNewOpeningTimes = function () {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'createOpeningTimes.html',
                controller: 'openingHoursController',
                size: 'lg',
                resolve: {
                    newOpeningHours: function () {
                        var newOpeningHours = $scope.siteToEdit.openingHoursWrapper[1];
                        var minOpeningHoursDate = new Date();
                        minOpeningHoursDate.setDate(minOpeningHoursDate.getDate())
                        return {openingHours: newOpeningHours, minDate: minOpeningHoursDate};
                    },
                    siteToEdit: function () {
                        return $scope.siteToEdit
                    }
                }

            });
            modalInstance.result.then(function (newOpeningHours) {

            }, function () {
                $log.info('Modal dismissed at: ' + new Date());
            });
        }


        function updatePassageList() {

            $http.get('/customers/' + GlobalSettings.selectedCustomer.identifier + '/' + $scope.siteToEdit.id + '/passages/all').success(function (data) {
                $scope.siteToEdit.passages = data;
                $scope.siteToEdit.passages.sort(compareByNames)
            });


        }

        $scope.removePassage = function (passage) {
            for (var i = $scope.passages.length - 1; i >= 0; i--) {
                if ($scope.passages[i] === passage) {
                    $scope.passages.splice(i, 1);
                }
            }
            deletePassage(passage);
        }

        $scope.selectPassageType = function (passageType) {

            $scope.passageToEdit.passageType = passageType;
            $scope.passageToEdit.type = passageType.id;


        }

        function deletePassage(passage) {
            $http.post('customers/' + GlobalSettings.selectedCustomer.identifier + '/' + $scope.siteToEdit.id + '/passages/delete_passage', passage).success(function (data) {
                updatePassageList();
            }).error(function (data, status, headers, config) {
                console.log("passage deletion ERROR");

                return status;
            });
        }

        $scope.getPassageTypes = function () {
            return SiteService.getPassageTypes().then(function (data) {
                var types = [];
                Object.keys(data.data).forEach(function (key, index) {
                    var type = {
                        "name": key,
                        "id": data.data[key]
                    };
                    types.push(type);
                });
                return types;
            });
        };

        $scope.convertPassageIdToName = function (passageId) {
            typeOfPassage = {};
            $scope.passageTypes.forEach(function (type) {
                if (type.id == passageId) {
                    typeOfPassage = type;
                }
            });
            return typeOfPassage;
        }


        $scope.editPassage = function (passage) {
            $scope.displayPassageDetails = true;
            $scope.displayPassageDetails = true;
            $scope.createPassageMode = false;
            $scope.displayNewCaptureRate = false;
            $scope.passageToEdit = passage;
            $scope.passageToEdit.passageType = $scope.convertPassageIdToName($scope.passageToEdit.type)
            GlobalSettings.loadingDatas();
            PassageService.getConnectorWrappersList(GlobalSettings.selectedCustomer.identifier, passage.id).then(function (result) {


                $scope.passageToEdit.connectors = result.data
                GlobalSettings.closeLoading();
            });

        };

        $scope.addNewPassage = function () {
            $scope.displayPassageDetails = true;
            $scope.createPassageMode = true;
            $scope.passageToEdit = {};
            $scope.passageToEdit.passageType = $scope.convertPassageIdToName(0)

        };

        $scope.addNewCaptureRate = function () {
            PassageService.getAvailablesEntrances(GlobalSettings.selectedCustomer.identifier, $scope.siteToEdit.id, $scope.siteToEdit.passages).then(function (result) {
                if (result.data.length == 0) {
                    bootbox.alert("No available entrances to connect Sidewalk. Please add entrance first.");
                    return;
                }
                $scope.available_entrances = result.data;
                $scope.displayPassageDetails = false;
                $scope.displayNewCaptureRate = true;
                $scope.createMode = false;
                $scope.createPassageMode = true;
                $scope.passageToEdit = {};
                $scope.captureRateWrapper = {};
            })
        };

        $scope.cancelNewCaptureRate = function () {
            $scope.displayPassageDetails = false;
            $scope.displayNewCaptureRate = false;
            $scope.createMode = false;
            $scope.createPassageMode = true;
            $scope.passageToEdit = {};
            $scope.captureRateWrapper = {};
        }

        $scope.selectEntrance = function (entrance) {
            $scope.captureRateWrapper.entrance = entrance;

        }

        $scope.saveNewCaptureRate = function (captureRateWrapper) {
            $scope.captureRateWrapper.sidewalk.type = 5;
            PassageService.saveNewCaptureRate(GlobalSettings.selectedCustomer.identifier, $scope.siteToEdit.id, captureRateWrapper);
            $scope.displayNewCaptureRate = false;
            $scope.createPassageMode = false;
            $scope.passageToEdit = {};
            $scope.captureRateWrapper = {};
            PassageService.updatePassageList();
        }

        $scope.cancelPassageEdition = function () {
            $scope.displayPassageDetails = false;
            $scope.passageToEdit = {};
            $scope.createPassageMode = false;
            $scope.passageToEdit = {};
            $scope.captureRateWrapper = {};

        }

        $scope.updatePassage = function (passageToUpdate) {
            PassageService.editPassage(GlobalSettings.selectedCustomer.identifier, $scope.siteToEdit.id, passageToUpdate).then(function (data) {
                updatePassageList();
                $scope.cancelPassageEdition();
            });
        }

        $scope.createPassage = function (passageToCreate) {
            PassageService.saveNewPassage(GlobalSettings.selectedCustomer.identifier, $scope.siteToEdit.id, passageToCreate).then(function (data) {
                updatePassageList();
                $scope.cancelPassageEdition();
            });
        }


        /*
         * site_orderController
         */
        var currentCustomer = GlobalSettings.selectedCustomer;

        function compareSerial(a, b) {
            if (a.serial < b.serial)
                return -1;
            else if (a.serial > b.serial)
                return 1;
            else
                return 0;
        }


        function getOrders(customerIdentifier) {
            $http.get('/orders/' + customerIdentifier).success(function (data) {
                $scope.orders = data;

            });
        };


        $scope.viewOrder = function (order) {

            var sensors = [];
            var bbb = [];

            order.sensors.forEach(function (entry) {
                if (entry.sensorType.id == $scope.bbbSensorTypeId) {
                    bbb.push(entry);
                } else {
                    sensors.push(entry);
                }
            });

            order.nonBbbSensors = sensors;
            order.bbb = bbb;

            $scope.selectedOrder = order;
            $scope.selectedOrder.PCUs.sort(compareSerial);
            $scope.selectedOrder.sensors.sort(compareSerial);


        }

        function findInArray(item, array) {
            for (var i = array.length - 1; i >= 0; i--) {
                if (array[i].serial == item.serial) {
                    return true;
                }
            }
            return false;
        }

        function returnIndex(item, array) {
            for (var i = array.length - 1; i >= 0; i--) {
                if (array[i].serial == item.serial) {
                    return i;
                }
            }
            return -1;
        }

        function findInFilteredChannels(serial) {
            for (var i = $scope.filteredChannels.length - 1; i >= 0; i--) {
                if ($scope.filteredChannels[i].sensor.device.identifier.serialNumber == serial) {
                    return true;
                }
            }
            return false;
        }

        $scope.addPCU = function (pcu) {
            if (!findInArray(pcu, $scope.selectedPCUs)) {
                $scope.selectedPCUs.push(pcu);
            }
            $scope.pcu.selected = null;
        }

        $scope.removePCU = function (pcu) {
            var index = returnIndex(pcu, $scope.selectedPCUs);
            if (index != -1) {
                $scope.selectedPCUs.splice(index, 1);
            }
            $scope.filteredChannels = [];
            filterChannelsOnSelectedPCUs();

        }

        $scope.addSensor = function (sensor) {
            if (!findInArray(sensor, $scope.selectedSensors)) {
                $scope.selectedSensors.push(sensor);
            }
            $scope.sensor.selected = null;
        }

        $scope.removeSensor = function (sensor) {
            var index = returnIndex(sensor, $scope.selectedSensors);
            if (index != -1) {
                $scope.selectedSensors.splice(index, 1);
            }
            $scope.notConnectedSensors = $scope.selectedSensors;

        }

        $scope.addBBB = function (sensor) {
            if (!findInArray(sensor, $scope.selectedBBB)) {
                $scope.selectedBBB.push(sensor);
            }
            $scope.sensor.selected = null;
        }

        $scope.removeBBB = function (sensor) {
            var index = returnIndex(sensor, $scope.selectedBBB);
            if (index != -1) {
                $scope.selectedBBB.splice(index, 1);
            }
            $scope.notConnectedBBB = $scope.selectedBBB;

        }

        $scope.gotoConnection = function () {
            if (typeof $scope.siteToEdit.connectors == 'undefined') {
                $scope.siteToEdit.connectors = [];
            }

            filterChannelsOnSelectedPCUs();
            $scope.notConnectedSensors = $scope.selectedSensors;
            $scope.notConnectedBBB = $scope.selectedBBB;
            $scope.hideOrderSelection = true;
            $scope.hideBBB = false;
            if ($scope.selectedBBB.length == 0) {
                $scope.hideBBB = true;
            }

        }

        $scope.resetOrdersSelections = function () {
            $scope.notConnectedSensors = [];
            $scope.notConnectedBBB = [];
            initData();
        }

        $scope.gotoOrders = function () {
            $scope.hideOrderSelection = false;
            $scope.siteToEdit.connectors = [];
        }

        $scope.disabled = undefined;
        $scope.sensor = {}

        $scope.enable = function () {
            $scope.disabled = false;
        };

        $scope.disable = function () {
            $scope.disabled = true;
        };


        initData();

        function initData() {
            getOrders(currentCustomer.identifier);
            $scope.selectedOrder = {}
            $scope.selectedPCUs = [];
            $scope.selectedSensors = [];
            $scope.selectedBBB = [];
            $scope.pcu = {};
            $scope.sensor = {};
            $scope.filteredChannels = [];
        }


        $scope.selectChannel = function (channel) {
            $scope.siteToEdit.selectedChannel = channel;
        }


        $scope.selectPassage = function (passage) {
            $scope.siteToEdit.selectedPassage = passage;
        }


        $scope.selectSensor = function (sensor) {

            if (sensor.sensorType.id != 1) {
                angular.element(document.getElementById("bbb-button")).prop("disabled", true);
                $scope.siteToEdit.selectedBBB = null;
            } else {
                angular.element(document.getElementById("bbb-button")).prop("disabled", false);
            }
            $scope.siteToEdit.selectedSensor = sensor;
        }

        $scope.selectBBB = function (sensor) {
            $scope.siteToEdit.selectedBBB = sensor;
        }

        $scope.connectPassageToChannelToSensor = function () {
            var newPassageConnector = {
                channel: $scope.siteToEdit.selectedChannel, passage: $scope.siteToEdit.selectedPassage
            };
            var newSensorConnector = {
                sensor: $scope.siteToEdit.selectedSensor
            };

            var IP = "no IP";
            if (typeof $scope.siteToEdit.selectedChannel.sensor.networkAddress !== 'undefined') {
                IP: $scope.siteToEdit.selectedChannel.sensor.networkAddress.ipAddress
            }
            var newConnectorWrapper = {
                passageConnector: {
                    channel: $scope.siteToEdit.selectedChannel, passage: $scope.siteToEdit.selectedPassage
                },
                sensorMD: $scope.siteToEdit.selectedSensor,
                sensorIP: IP,
                bbb: $scope.siteToEdit.selectedBBB
            }

            $scope.siteToEdit.connectors.push(newConnectorWrapper);

            removeItemFromSelectionList($scope.siteToEdit.selectedChannel, $scope.filteredChannels);
            removeItemFromSelectionList($scope.siteToEdit.selectedSensor, $scope.notConnectedSensors);
            removeItemFromSelectionList($scope.siteToEdit.selectedBBB, $scope.notConnectedBBB);

            $scope.siteToEdit.selectedPassage = null;
            $scope.siteToEdit.selectedChannel = null;
            $scope.siteToEdit.selectedSensor = null;
            $scope.siteToEdit.selectedBBB = null;

        }

        function removeItemFromSelectionList(item, list) {
            var indexItem = list.indexOf(item);
            if (indexItem > -1) {
                list.splice(indexItem, 1);
            }
        }


        $scope.removeConnector = function (connector) {
            for (var i = 0; i < $scope.siteToEdit.connectors.length; i++) {
                if ($scope.siteToEdit.connectors[i] === connector) {
                    $scope.siteToEdit.connectors.splice(i, 1);
                }
            }

            $scope.filteredChannels.push(connector.passageConnector.channel);
            $scope.notConnectedSensors.push(connector.sensorMD);
            if (connector.bbb != undefined)
                $scope.notConnectedBBB.push(connector.bbb);

        }


        function filterChannelsOnSelectedPCUs() {
            if ($scope.selectedPCUs && $scope.notConnectedChannels) {
                for (var i = 0; i < $scope.selectedPCUs.length; i++) {
                    for (var j = 0; j < $scope.notConnectedChannels.length; j++) {
                        console.log($scope.notConnectedChannels[j].sensor.device.identifier.serialNumber + "- " + $scope.notConnectedChannels[j].name)


                        if ($scope.selectedPCUs[i].serial == $scope.notConnectedChannels[j].sensor.device.identifier.serialNumber) {
                            //if (!findInFilteredChannels($scope.selectedPCUs[i].serial)) {
                            //    $scope.filteredChannels.push($scope.notConnectedChannels[j])
                            //}
                            if ($scope.filteredChannels.indexOf($scope.notConnectedChannels[j]) < 0) {
                                $scope.filteredChannels.push($scope.notConnectedChannels[j]);
                            }
                        }
                    }
                }
                $scope.filteredChannels.sort(compare);
            }

        }

        function removeConnectedChannels(filteredChannels, connectors) {
            for (var i = 0; i < filteredChannels.length; i++) {
                for (var j = 0; j < connectors.length; j++) {
                    if (filteredChannels[i] === connectors[j].passageConnector.channel) {
                        filteredChannels.splice(i, 1);
                    }

                }
            }
        }


        function removeConnectedSensors(notConnectedSensors, connectors) {
            for (var i = 0; i < notConnectedSensors.length; i++) {
                for (var j = 0; i < connectors.length; j++) {
                    if (notConnectedSensors[i] === connectors[j].sensorMD) {
                        notConnectedSensors.splice(i, 1);
                    }
                }
            }
        }

        $scope.getPassageTypes().then(function (result) {
            $scope.passageTypes = result;

        });


    }
)


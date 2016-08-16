/**
 * Created by kukuljac on 22.02.2016.
 */

hermesApp.factory('OrderService', function ($http, GlobalSettings, ConstantsService) {

    function getPCUsFromOrder(orders) {
        PCUs = []
        orders.forEach(function (order) {
            order.PCUs.forEach(function (pcu) {
                PCUs.push(pcu);
            })
        })

        return PCUs;
    }

    function getNonBBBSensorsFromOrders(orders) {
        nonBBBSensors = [];
        orders.forEach(function (order) {
            order.sensors.forEach(function (sensor) {
                if (sensor.sensorType != ConstantsService.getConstant("BBB_SENSOR_100")) {
                    nonBBBSensors.push(sensor);
                }
            })
        })
        return nonBBBSensors;
    }

    function getBBBSensorsFromOrders(orders) {
        BBBSensors = [];
        orders.forEach(function (order) {
            order.sensors.forEach(function (sensor) {
                if (sensor.sensorType == ConstantsService.getConstant("BBB_SENSOR_100")) {
                    BBBSensors.push(sensor);
                }
            })
        })
        return BBBSensors;
    }

    return {
        getPCUsFromOrder: getPCUsFromOrder,
        getNonBBBSensorsFromOrders: getNonBBBSensorsFromOrders,
        getBBBSensorsFromOrders: getBBBSensorsFromOrders
    }

});



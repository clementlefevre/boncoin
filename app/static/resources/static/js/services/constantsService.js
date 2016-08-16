/**
 * Created by kukuljac on 22.02.2016.
 */

hermesApp.factory('ConstantsService', function ($http, GlobalSettings) {


    var constants = {
        BBB_SENSOR_100: 7,
        SIDEWALK: 5
    }

    function getConstant(name) {
        return constants[name];
    }

    return {
        getConstant: getConstant
    }

});



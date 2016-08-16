/**
 * Created by kukuljac on 22.02.2016.
 */

hermesApp.factory('SiteService', function ($http) {

    var getPassageTypes = function () {
        return $http.get('/passage/types').then(function (data) {
            return data;
        });
    };


    var filterOnActiveSites = function (sites, isAdmin) {
        if (!isAdmin) {
            activeSites = [];

            sites.forEach(function (site) {
                if (site.deactivated == false) {
                    activeSites.push(site);
                }

            })
            return activeSites;
        }
        return sites;
    };

    return {
        getPassageTypes: getPassageTypes,
        filterOnActiveSites: filterOnActiveSites
    }


});
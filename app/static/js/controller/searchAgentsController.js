bonCoinApp.controller('searchAgentsController', function ($rootScope, $scope, $http, $route) {
    console.log("searchAgentsController reporting for duty.");


    var search_agents = function () {

        loadingDatas();

        $scope.search_agents = [];

        $http.get('search_agents/').success(function (data) {
            closeLoading();
            $scope.search_agents = data.result;


        }).error(function (data, status) {
            closeLoading();
            alert("Search error. Please try again or contact administrator.");
            return status;
        });

    };

    var get_scheduler_status = function(){
        loadingDatas();
        $scope.scheduler_status = 0;
        $http.get('scheduler_status/').success(function (data) {
            closeLoading();
            $scope.scheduler_status = data.status;
           

        }).error(function (data, status) {
            closeLoading();
            alert("Search error. Please try again or contact administrator.");
            return status;
        });

    }

    $scope.start_scheduler = function(){
        $http.get('start_scheduler/').success(function (data) {
            get_scheduler_status();
        }).error(function (data, status) {
            alert("Search error. Please try again or contact administrator.");
            return status;
        });

    }

        $scope.stop_scheduler = function(){
        $http.get('stop_scheduler/').success(function (data) {
            get_scheduler_status()
        }).error(function (data, status) {
            alert("Search error. Please try again or contact administrator.");
            return status;
        });

    }


    $scope.new_search_agent = {
        'keywords': '', 'min_price': '', 'is_active': 'true', 'email': ''
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


    $scope.addSearchAgent = function () {

        loadingDatas();
        new_search_agent = $scope.new_search_agent;

        $http.post('search_agents/', new_search_agent).success(function (data) {
            closeLoading();
            search_agents();

        }).error(function (data, status) {
            closeLoading();
            alert("Search error. Please try again or contact administrator.");
            return status;
        });


    };

    $scope.removeSearchAgent = function (search_agent_to_remove) {

        loadingDatas();


        $http.post('delete_search_agent/', search_agent_to_remove).success(function (data) {
            closeLoading();
            search_agents();

        }).error(function (data, status) {
            closeLoading();
            alert("Search error. Please try again or contact administrator.");
            return status;
        });
    };

    $scope.activateSearchAgent = function (search_agent_to_activate) {
        loadingDatas();
        $http.post('activate_search_agent/', search_agent_to_activate).success(function (data) {
            closeLoading();
            search_agents();

        }).error(function (data, status) {
            closeLoading();
            alert("Search error. Please try again or contact administrator.");
            return status;
        });
    };

    var get_scheduler_period = function () {
        loadingDatas();
        $http.get('scheduler_period/').success(function (data) {

            $scope.scheduler_period = data.period;
            closeLoading();


        }).error(function (data, status) {
            closeLoading();
            alert("Search error. Please try again or contact administrator.");
            return status;
        });
    };


    $scope.set_scheduler_period = function () {
        loadingDatas();
        period_to_set = {'period': $scope.scheduler_period};
        $http.post('scheduler_period/', period_to_set).success(function (data) {
            closeLoading();

            $scope.scheduler_period = get_scheduler_period();
            get_scheduler_status();

        }).error(function (data, status) {
            closeLoading();
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


    search_agents();

    get_scheduler_period();

    get_scheduler_status();
});

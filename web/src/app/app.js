var app = angular
  .module("app", ["ngCookies", "ngSanitize", "ngFileUpload", "angularUtils.directives.dirPagination", "ngRoute", "chart.js", "ngResource", "ngTagsInput", "jsonFormatter", "angularModalService", "ngStorage"])
  .run(function ($rootScope, $http, $sessionStorage, appConfig) {

    // keep user logged in after page refresh
    if ($sessionStorage.jwt) {
      $rootScope.authenticated = true;
      $http.defaults.headers.common.Authorization = "Bearer " + $sessionStorage.jwt;
    } else {
      //show login page
      $rootScope.authenticated = false;
      $rootScope.$broadcast("INVALID_JWT_TOKEN");
    }

    $rootScope.$on("USER_AUTHENTICATED", function (event) {
      $rootScope.authenticated = true;
      $http.defaults.headers.common.Authorization =
        "Bearer " + $sessionStorage.jwt;
    });

    $rootScope.$on("INVALID_JWT_TOKEN", function (event) {
      $rootScope.authenticated = false;
      $sessionStorage.$reset();
    });
  });

angular
  .module("app")
  .controller("appCtrl", function ($rootScope, $scope, $route, $routeParams, $location, $timeout, $http, $sessionStorage, $cookies, appConfig, Auth) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;

    $scope.go = function (path) {
      $location.path(path);
    };

    $scope.formData = {};

    $scope.$on("setAlertText", function (event, alert_text) {
      $("#alertTextDiv").addClass("show");
      $scope.alert_text = alert_text;
      $timeout(function () {
        $("#alertTextDiv").removeClass("show");
      }, 2000);
    });

    $scope.loginUser = function (user) {

      Auth.save(JSON.stringify(user)).$promise.then(function (response) {
        $sessionStorage.jwt = response.token;
        $cookies.put("loggedinjwt", $sessionStorage.jwt);
        $rootScope.$broadcast("USER_AUTHENTICATED");
      });
    }

  });
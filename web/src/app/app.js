var app = angular
  .module("app", [
    "ngCookies",
    "btford.socket-io",
    "ng-jsyaml",
    "ngSanitize",
    "ngFileUpload",
    "angularUtils.directives.dirPagination",
    "ngRoute",
    "chart.js",
    "ngResource",
    "ngStorage",
    "ngTagsInput",
    "jsonFormatter",
    "angularModalService",
    "AdalAngular"
  ])
  .factory("mySocket", function(socketFactory) {
    return socketFactory({
      ioSocket: window.io.connect()
    });
  })
  .run(function($rootScope, $http, $sessionStorage, appConfig, adalAuthenticationService) {
    $rootScope.adalauthentication = appConfig.adalauthentication;

    // keep user logged in after page refresh
    if ($sessionStorage.jwt) {
      $rootScope.authenticated = true;
      $http.defaults.headers.common.Authorization = "Bearer " + $sessionStorage.jwt;
    } else {
      //show login page
      $rootScope.authenticated = false;
      $rootScope.$broadcast("INVALID_JWT_TOKEN");
    }

    $rootScope.$on("USER_AUTHENTICATED", function(event) {
      $rootScope.authenticated = true;
      $http.defaults.headers.common.Authorization =
        "Bearer " + $sessionStorage.jwt;
    });

    $rootScope.$on("INVALID_JWT_TOKEN", function(event) {
      $rootScope.authenticated = false;
      $sessionStorage.$reset();

      if (appConfig.adalauthentication) {
          adalAuthenticationService.logOut();
      }
    });
  });

angular
  .module("app")
  .controller("appCtrl", function(
    $rootScope,
    $scope,
    $route,
    $routeParams,
    $location,
    $timeout,
    $http,
    $sessionStorage,
    $cookies,
    adalAuthenticationService,
    appConfig
  ) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;

    $scope.go = function(path) {
      $location.path(path);
    };

    $scope.formData = {};

    $scope.$on("setAlertText", function(event, alert_text) {
      $("#alertTextDiv").addClass("show");
      $scope.alert_text = alert_text;
      $timeout(function() {
        $("#alertTextDiv").removeClass("show");
      }, 2000);
    });

    $scope.loginUser = function(user) {
      $http
        .post(appConfig.api_endpoint_v2 + "/auth", JSON.stringify(user))
        .then(
          function(response) {
            // success callback
            $sessionStorage.jwt = response.data.token;
            $cookies.put("loggedinjwt", $sessionStorage.jwt);
            $rootScope.$broadcast("USER_AUTHENTICATED");
          },
          function(errorResponse) {
            // failure callback
            $("#alertTextDiv").addClass("show");
            $scope.alert_text =
              "Invalid Username and Password. Please try again.";
            $timeout(function() {
              $("#alertTextDiv").removeClass("show");
            }, 2000);
          }
        );
    };

    // ADAL
    if (appConfig.adalauthentication) {
      // this is referencing adal module to do login
      //userInfo is defined at the $rootscope with adalAngular module
      $scope.testMessage = "";
      $scope.init = function() {
        $scope.testMessage = "";
      };

      $scope.logout = function() {
        adalAuthenticationService.logOut();
        $rootScope.$broadcast("INVALID_JWT_TOKEN");
      };

      $scope.login = function() {
        adalAuthenticationService.login();
      };

      // optional
      $scope.$on("adal:loginSuccess", function() {
        $scope.testMessage = "loginSuccess";

        // Inject Azure Token_ID as JWT Token
        $sessionStorage.jwt = adalAuthenticationService.getCachedToken(appConfig.adalclientid);
        $cookies.put("loggedinjwt", $sessionStorage.jwt);
        $rootScope.$broadcast("USER_AUTHENTICATED");
      });

      // optional
      $scope.$on("adal:loginFailure", function() {
        $scope.testMessage = "loginFailure";
        $location.path("/login");
      });

      $scope.$on("adal:acquireTokenSuccess", function() {
        $scope.testMessage = "acquireTokenSuccess";

        // When ADAL.js refreshes token after expiration, $sessionStorage.jwt is desynchronized
        $sessionStorage.jwt = adalAuthenticationService.getCachedToken(appConfig.adalclientid);
        $cookies.put("loggedinjwt", $sessionStorage.jwt);
        $rootScope.$broadcast("USER_AUTHENTICATED");
      });

      $scope.$on("adal:acquireTokenFailure", function() {
        $scope.testMessage = "acquireTokenFailure";
        adalAuthenticationService.logOut();
        $rootScope.$broadcast("INVALID_JWT_TOKEN");
      });

      // optional
      $scope.$on("adal:notAuthorized", function(event, rejection, forResource) {
        $scope.testMessage = "It is not Authorized for resource:" + forResource;
      });
    }
  });

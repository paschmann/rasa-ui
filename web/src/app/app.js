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
  .controller("appCtrl", function ($rootScope, $scope, $route, $routeParams, $location, $timeout, $http, $sessionStorage, $cookies, appConfig, Auth, Settings, Rasa_Status, $interval, Rasa_Version) {
    $scope.$route = $route;
    $scope.$location = $location;
    $scope.$routeParams = $routeParams;

    $scope.go = function (path) {
      $location.path(path);
    };

    executeRefreshSettings();

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

    $scope.cleanResponse = function (data) {
      return JSON.parse(angular.toJson(data));
    }
  
    $scope.objectFindByKey = function (array, key, value) {
      for (let i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
          return array[i];
        }
      }
      return null;
    }

    $scope.$on('refreshIntervelUpdate', function (event, expression_text) {
      $interval.cancel(configcheck);
      executeRefreshSettings();
    });

    function executeRefreshSettings() {
      Settings.query(function (data) {
        $rootScope.settings = data;
        for (let key in data) {
          $rootScope.settings[data[key]['setting_name']] = data[key]['setting_value'];
        }
        if ($rootScope.settings['refresh_time'] !== '-1' && $rootScope.settings['refresh_time'] !== undefined) {
          configcheck = $interval(getRasaStatus, Number($rootScope.settings['refresh_time']));
        }
        getRasaStatus();
      });
    }
  
    $scope.$on('$destroy', function () {
      $interval.cancel(configcheck);
    });
  
    function getRasaStatus() {
      Rasa_Status.get(function (statusdata) {
        $rootScope.config = statusdata.toJSON();
        $rootScope.config.isonline = 1;

        Rasa_Version.get(function (version_data) {
          $rootScope.config.version_data = version_data.toJSON();
        });
      }, function (error) {
        $rootScope.config.isonline = 0;
      });
    }

    $scope.timeConverter = function(UNIX_timestamp) {
      var a = new Date(UNIX_timestamp * 1000);
      var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      var year = a.getFullYear();
      var month = months[a.getMonth()];
      var date = a.getDate();
      var hour = a.getHours();
      var min = a.getMinutes();
      var sec = a.getSeconds();
      var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
      return time;
    }
    
    $scope.pastelColors = function() {
      const hue = Math.floor(Math.random() * 360);
      return 'hsl(' + hue + ', 100%, 87.5%)';
    }
    
    if (!String.prototype.splice) {
      /**
       * {JSDoc}
       *
       * The splice() method changes the content of a string by removing a range of
       * characters and/or adding new characters.
       *
       * @this {String}
       * @param {number} start Index at which to start changing the string.
       * @param {number} delCount An integer indicating the number of old chars to remove.
       * @param {string} newSubStr The String that is spliced in.
       * @return {string} A new string with the spliced substring.
       */
      String.prototype.splice = function(start, delCount, newSubStr) {
          return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
      };
    }
    



  });
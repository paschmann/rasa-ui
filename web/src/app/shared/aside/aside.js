angular.module('app').controller('AsideController', AsideController);

function AsideController(
  $scope,
  $rootScope,
  $interval,
  $http,
  Rasa_Config,
  Rasa_Version,
  Settings,
  Rasa_Status,
  appConfig
) {
  //$scope.test_text = 'I want italian food in new york';
  $scope.test_text_response = {};
  $rootScope.config = {}; //Initilize in case server is not online at startup
  let configcheck;

  Rasa_Version.get().$promise.then(function(data) {
    $rootScope.rasa_version = data.version;
  });
  executeRefreshSettings();

  function executeRefreshSettings() {
    Settings.query().$promise.then(function(data) {
      $rootScope.settings = data;
      for (let key in data) {
        $rootScope.settings[data[key]['setting_name']] =
          data[key]['setting_value'];
      }
      if (
        $rootScope.settings['refresh_time'] !== '-1' &&
        $rootScope.settings['refresh_time'] !== undefined
      ) {
        configcheck = $interval(
          getRasaConfig,
          Number($rootScope.settings['refresh_time'])
        );
      }
      getRasaConfig();
    });
  }

  $scope.$on('executeTestRequest', function(event, expression_text) {
    $scope.test_text = expression_text;
    $scope.executeTestRequest();
  });

  $scope.$on('refreshIntervelUpdate', function(event, expression_text) {
    $interval.cancel(configcheck);
    executeRefreshSettings();
  });

  $scope.$on('$destroy', function() {
    $interval.cancel(configcheck);
  });

  function getRasaConfig() {
    Rasa_Status.get(function(statusdata) {

          $rootScope.config.server_model_dirs_array = window.getAvailableModels(
            statusdata
          );
          if ($rootScope.config.server_model_dirs_array.length > 0) {
            $rootScope.modelname =
              $rootScope.config.server_model_dirs_array[0].name;
          }
    });
  }
  $scope.restartConversation = function() {
    $scope.test_text_response = {};
    $http.post(appConfig.api_endpoint_v2 + '/rasa/restart');
    $scope.response_text = [];
    $scope.test_text_response = {};
    $scope.test_text = '';
    $rootScope.$broadcast('setAlertText', 'Conversation restarted!!');
  };

  function addOverlay() {
    $('.aside-menu').addClass('dimmed');
  }

  function removeOverlay() {
    $('.aside-menu').removeClass('dimmed');
  }

  $scope.executeTestRequest = function() {
    $scope.response_text = [];
    $scope.test_text_response = {};
    let reqMessage = {};
    if ($scope.modelname === 'default*fallback') {
      reqMessage = { q: $scope.test_text };
    } else {
      reqMessage = {
        q: $scope.test_text,
        project: $scope.modelname.split('*')[0],
        model: $scope.modelname.split('*')[1]
      };
    }

    if ($scope.test_text) {
      //make a httpcall
      addOverlay();
      $http
        .post(
          appConfig.api_endpoint_v2 + '/rasa/parse',
          JSON.stringify(reqMessage)
        )
        .then(
          function(response) {
            // success callback
            removeOverlay();
            $scope.test_text_response = response.data;
            if (!$scope.wsEnabled) {
              if ($scope.test_text_response > 0) {
                $scope.test_text_response.forEach(function(response) {
                  $scope.response_text.push(response.response_text);
                });
              }
            }
            //$scope.test_text='';
          },
          function(errorResponse) {
            // failure callback
            removeOverlay();
          }
        );
    }
  };
}

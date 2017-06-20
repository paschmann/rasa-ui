angular
.module('app')
.controller('AsideController', AsideController)

function AsideController($scope, $rootScope, $interval, Rasa_Parse, Rasa_Config, Rasa_Version, Settings, Rasa_Status) {
  console.log("aside");
  $scope.test_text = 'I want italian food in new york';
  $scope.test_text_response = {};
  $rootScope.config = {}; //Initilize in case server is not online at startup
  var configcheck;

  Rasa_Version.get().$promise.then(function(data) {
    $rootScope.rasa_version = data.version;
  });

  Settings.query(function(data) {
      $rootScope.settings = data;

      for(var key in data) {
        $rootScope.settings[data[key]['setting_name']] = data[key]['setting_value'];
      }

      if ($rootScope.settings['refresh_time'] !== "-1" && $rootScope.settings['refresh_time'] !== undefined) {
        configcheck = $interval(getRasaConfig, parseInt($rootScope.settings['refresh_time']));
      }

      getRasaConfig();
  });

  $scope.$on('executeTestRequest', function(event, expression_text) {
    $scope.test_text = expression_text;
    $scope.executeTestRequest();
  });

  $scope.$on("$destroy", function(){
    $interval.cancel(configcheck);
  });

  function getRasaConfig() {
    // Add a status param to config and set to 0 if server is offline
    Rasa_Status.get(function(statusdata) {
      Rasa_Config.get().$promise.then(function(data) {
        $rootScope.config = data.toJSON();
        $rootScope.config.isonline = 1;
        $rootScope.config.server_model_dirs_array = getAvailableModels(statusdata.available_models);
        $scope.modelname = $rootScope.config.server_model_dirs_array[0].name;
      }, function(error) {
        // error handler
        $rootScope.config.isonline = 0;
      });
    });
  }



  $scope.executeTestRequest = function() {
    var options = {};
    var model = '';
    if ($scope.modelname !== 'Default') {
      model = $scope.modelname;
    }
    options = {query: $scope.test_text, model: model};
    Rasa_Parse.get(options, function(data) {
        $scope.test_text_response = data.toJSON();
    });
  }
}

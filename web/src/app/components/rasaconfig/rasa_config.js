angular
.module('app')
.controller('RasaConfigController', RasaConfigController);

function RasaConfigController($scope, $rootScope) {
  loadConfig();

  function loadConfig() {
    /*
    Rasa_Config.get().$promise.then(function(data) {
      $scope.config = data.toJSON();
    });
    */
  }
  /* TODO: Future feature
  $scope.updateConfigParam = function(param_name) {
    var param_value = $('#' + param_name).val();
    Set_Rasa_Config.get( {key: param_name, value: param_value} ).$promise.then(function(data) {
      loadConfig();
    });
  }
  */
}

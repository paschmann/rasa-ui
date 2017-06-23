angular
.module('app')
.controller('SettingsController', SettingsController)

function SettingsController($scope, Settings) {
  console.log('Settings controller loaded');

  $scope.updateSettings = function(setting_name, setting_value) {
    Settings.update({setting_name: setting_name}, {setting_name: setting_name, setting_value: setting_value}).$promise.then(function() {
      console.log('saved');
    });
  }
}

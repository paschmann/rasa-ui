/* TODO: Import feature */

angular
  .module('app')
  .controller('ImportBotController', ImportBotController);

function ImportBotController($scope, $rootScope, Bot, $route, $location) {
  $scope.show_preview = false;
  $scope.fileInvalid = true;
  $scope.show_progress = false;

  $scope.importBot = function() {
    let postRequest = {
      bot_name: $scope.formData.bot_name,
      data: $scope.botImportData
    };
    Bot.save({ bot_id: 'upload' }, postRequest).$promise.then(function() {
      $rootScope.$broadcast('setAlertText', 'Bot uploaded successfully');
      if ($location.path().endsWith('bots')) {
        $route.reload();
      }
    });
    $rootScope.$broadcast(
      'setAlertText',
      'Bot upload in progress.. Notification will be sent when done!!'
    );
    $scope.formData.bot_name = '';
    $scope.go('/bots');
  };

  $scope.validateAndPreviewBot = function(file) {
    $scope.filesize = file.size + ' bytes';
    $scope.show_preview = true;
    $scope.show_progress = true;
    $scope.botImportData = 'Loading ...';
    let reader = new FileReader();
    reader.onload = function() {
      $scope.show_progress = false;
      try {
        $scope.botImportData = JSON.parse(reader.result);
        $scope.fileInvalid = false;
      } catch (e) {
        $scope.botImportData = 'Invalid JSON';
        return false;
      }
    };
    reader.onerror = function() {
      $scope.botImportData = 'Error Occurred while uploading the file';
    };
    reader.readAsText(file);
  };
}

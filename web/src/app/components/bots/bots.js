angular
.module('app')
.controller('BotsController', BotsController);

function BotsController($scope, $rootScope, Bot, $http, appConfig, $window, ErrorHandler) {
  $scope.isLoading = true;

  Bot.query(
    function(data) {
      $scope.botList = data;
      $scope.isLoading = false;
    },
    function(error) {
      $scope.isLoading = false;
      ErrorHandler.handleError(error, 'loading bots');
    }
  );
}

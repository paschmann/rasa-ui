angular
.module('app')
.controller('AddBotController', AddBotController)

function AddBotController($scope, Bot, ErrorHandler) {
  $scope.isLoading = false;

  $scope.addBot = function(params) {
    $scope.isLoading = true;

    Bot.save(this.formData).$promise.then(
      function(response) {
        $scope.formData.bot_name = "";
        $scope.isLoading = false;
        $scope.go('/bots');
      },
      function(error) {
        $scope.isLoading = false;
        ErrorHandler.handleError(error, 'saving bot');
      }
    );
  };
}

angular
.module('app')
.controller('AddBotController', AddBotController)

function AddBotController($scope, Bot) {
  $scope.addBot = function(params) {
    Bot.save(this.formData).$promise.then(function() {
      $scope.formData.bot_name = "";
      $scope.go('/bots')
    });
  };
}

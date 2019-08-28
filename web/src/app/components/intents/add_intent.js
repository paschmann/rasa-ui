angular
.module('app')
.controller('AddIntentController', AddIntentController);

function AddIntentController($scope, Bot, Intent) {
  Bot.get({bot_id: $scope.$routeParams.bot_id}, function(data) {
      $scope.bot = data;
  });

  $scope.addIntent = function(params) {
    this.formData.bot_id = $scope.$routeParams.bot_id;
    Intent.save(this.formData).$promise.then(function(resp) {
      $scope.formData.intent_name = '';
      $scope.go('/bot/' + $scope.bot.bot_id)
    });
  };
}

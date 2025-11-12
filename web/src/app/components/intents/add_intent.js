angular
.module('app')
.controller('AddIntentController', AddIntentController);

function AddIntentController($scope, Bot, Intent, ErrorHandler) {
  $scope.isLoadingBot = true;
  $scope.isSaving = false;

  Bot.get({ bot_id: $scope.$routeParams.bot_id },
    function(data) {
      $scope.bot = data;
      $scope.isLoadingBot = false;
    },
    function(error) {
      $scope.isLoadingBot = false;
      ErrorHandler.handleError(error, 'loading bot');
    }
  );

  $scope.addIntent = function(params) {
    this.formData.bot_id = $scope.$routeParams.bot_id;
    $scope.isSaving = true;

    Intent.save(this.formData).$promise.then(
      function(resp) {
        $scope.formData.intent_name = '';
        $scope.isSaving = false;
        $scope.go('/bot/' + $scope.bot.bot_id)
      },
      function(error) {
        $scope.isSaving = false;
        ErrorHandler.handleError(error, 'adding intent');
      }
    );
  };
}

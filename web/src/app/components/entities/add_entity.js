angular
.module('app')
.controller('AddEntityController', AddEntityController);

function AddEntityController($scope, Entity, Bot, $rootScope, ErrorHandler) {
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

  $scope.addEntity = function(params) {
    this.formData.bot_id = $scope.$routeParams.bot_id;
    $scope.isSaving = true;

    Entity.save(this.formData).$promise.then(
      function() {
        $scope.formData.entity_name = "";
        $scope.isSaving = false;
        $rootScope.$broadcast('setAlertText', "Entity added for " + $scope.bot.bot_name + " successfully!");
        $scope.go('/bot/' + $scope.$routeParams.bot_id)
      },
      function(error) {
        $scope.isSaving = false;
        ErrorHandler.handleError(error, 'adding entity');
      }
    );
  };
}

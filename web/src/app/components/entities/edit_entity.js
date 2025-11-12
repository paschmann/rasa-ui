angular.module('app').controller('EntityController', EntityController);

function EntityController($rootScope, $scope, Bot, Entity, ErrorHandler) {
  $scope.tags = [{}];
  $scope.isLoadingEntity = true;
  $scope.isLoadingBots = true;
  $scope.isLoadingBot = true;
  $scope.isSaving = false;
  $scope.isDeleting = false;

  Entity.get({ entity_id: $scope.$routeParams.entity_id },
    function(data) {
      $scope.entity = data;
      $scope.isLoadingEntity = false;
    },
    function(error) {
      $scope.isLoadingEntity = false;
      ErrorHandler.handleError(error, 'loading entity');
    }
  );

  Bot.query(
    function(data) {
      $scope.botsList = data;
      $scope.isLoadingBots = false;
    },
    function(error) {
      $scope.isLoadingBots = false;
      ErrorHandler.handleError(error, 'loading bots');
    }
  );

  Bot.get({ bot_id: $scope.$routeParams.bot_id },
    function(data) {
      $scope.entity.bot = data;
      $scope.isLoadingBot = false;
    },
    function(error) {
      $scope.isLoadingBot = false;
      ErrorHandler.handleError(error, 'loading bot');
    }
  );

  $scope.deleteEntity = function() {
    $scope.isDeleting = true;

    Entity.remove({ entity_id: $scope.$routeParams.entity_id },
      function(data) {
        $scope.isDeleting = false;
        $scope.go('/bot/' + $scope.entity.bot.bot_id);
      },
      function(error) {
        $scope.isDeleting = false;
        ErrorHandler.handleError(error, 'deleting entity');
      }
    );
  };

  $scope.updateEntity = function(entity) {
    $scope.isSaving = true;

    Entity.update({ entity_id: entity.entity_id }, entity).$promise.then(
      function() {
        $scope.isSaving = false;
        $rootScope.$broadcast('setAlertText', 'Entity information updated successfully');
      },
      function(error) {
        $scope.isSaving = false;
        ErrorHandler.handleError(error, 'updating entity');
      }
    );
  };
}

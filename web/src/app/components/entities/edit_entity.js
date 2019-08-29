angular.module('app').controller('EntityController', EntityController);

function EntityController($rootScope, $scope, Bot, Entity) {
  $scope.tags = [{}];

  Entity.get({ entity_id: $scope.$routeParams.entity_id }, function(data) {
    $scope.entity = data;
  });

  Bot.query(function(data) {
    $scope.botsList = data;
  });

  Bot.get({ bot_id: $scope.$routeParams.bot_id }, function(data) {
    $scope.entity.bot = data;
  });

  $scope.deleteEntity = function() {
    Entity.remove({ entity_id: $scope.$routeParams.entity_id }, function(data) {
      $scope.go('/bot/' + $scope.entity.bot.bot_id);
    });
  };

  $scope.updateEntity = function(entity) {
    Entity.update({ entity_id: entity.entity_id }, entity).$promise.then(
      function() {
        $rootScope.$broadcast('setAlertText', 'Entity information updated sucessfully');
      }
    );
  };
}

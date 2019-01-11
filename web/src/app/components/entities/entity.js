angular.module("app").controller("EntityController", EntityController);

function EntityController($rootScope, $scope, Agent, Entity) {
  $scope.tags = [{}];

  Entity.get({ entity_id: $scope.$routeParams.entity_id }, function(data) {
    $scope.entity = data;
  });

  Agent.query(function(data) {
    $scope.agentsList = data;
  });

  Agent.get({ agent_id: $scope.$routeParams.agent_id }, function(data) {
    $scope.entity.agent = data;
  });

  $scope.deleteEntity = function() {
    Entity.remove({ entity_id: $scope.$routeParams.entity_id }, function(data) {
      $scope.go("/agent/" + $scope.entity.agent.agent_id);
    });
  };

  $scope.updateEntity = function(entity) {
    Entity.update({ entity_id: entity.entity_id }, entity).$promise.then(
      function() {
        $rootScope.$broadcast(
          "setAlertText",
          "Entity information updated Sucessfully!!"
        );
      }
    );
  };
}

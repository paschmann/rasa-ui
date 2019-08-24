angular
.module('app')
.controller('AddEntityController', AddEntityController);

function AddEntityController($scope, Entity,Agent, $rootScope) {

  Agent.get({agent_id: $scope.$routeParams.agent_id}, function(data) {
    $scope.agent = data;
  });

  $scope.addEntity = function(params) {
    this.formData.agent_id = $scope.$routeParams.agent_id;
    Entity.save(this.formData).$promise.then(function() {
      $scope.formData.entity_name = "";
      $rootScope.$broadcast('setAlertText', "Entity Added for " + $scope.agent.agent_name + " Sucessfully !!");
      $scope.go('/agent/' + $scope.$routeParams.agent_id)
    });
  };
}

angular
.module('app')
.controller('AddAgentController', AddAgentController)

function AddAgentController($scope, Agent) {
  $scope.addAgent = function(params) {
    Agent.save(this.formData).$promise.then(function() {
      $scope.formData.agent_name = "";
      $scope.go('/agents')
    });
  };
}

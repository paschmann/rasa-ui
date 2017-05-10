angular
.module('app')
.controller('AddAgentController', AddAgentController)

function AddAgentController($scope, Agents) {
  console.log('Add Agent controller loaded');

  $scope.addAgent = function(params) {
    Agents.save(this.formData).$promise.then(function(resp) {
      $scope.formData.agent_name = "";
      $scope.go('/agents')
    });
  };
}

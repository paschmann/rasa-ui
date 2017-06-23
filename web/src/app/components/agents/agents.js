angular
.module('app')
.controller('AgentsController', AgentsController)

function AgentsController($scope, Agent) {
  console.log('Agents controller loaded');

  Agent.query(function(data) {
      $scope.agentList = data;
  });

}

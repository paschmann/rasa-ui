angular
.module('app')
.controller('AgentsController', AgentsController)

function AgentsController($scope, Agents, Agent) {
  console.log('Agents controller loaded');

  Agents.query(function(data) {
      $scope.agentList = data;
  });

}

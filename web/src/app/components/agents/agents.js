angular
.module('app')
.controller('AgentsController', AgentsController)

function AgentsController($scope, Agent) {
  Agent.query(function(data) {
      $scope.agentList = data;
  });

}

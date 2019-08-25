angular
.module('app')
.controller('AgentsController', AgentsController);

function AgentsController($scope, $rootScope, Agent,$http,appConfig,$window) {
  Agent.query(function(data) {
      $scope.agentList = data; 
  });

  $scope.editAgentInfo = function(agent) {
    Agent.update({ agent_id: agent.agent_id }, agent).$promise.then(function() {
      $('#' + agent.agent_id).collapse('hide');
      $rootScope.$broadcast('setAlertText', "Agent information updated Sucessfully!!");
    });
  };
}

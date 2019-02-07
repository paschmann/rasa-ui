angular
.module('app')
.controller('AgentsController', AgentsController);

function AgentsController($scope, $rootScope, Agent) {
  Agent.query(function(data) {
      $scope.agentList = data;
  });

  $scope.agentEncoded = function(agent) {
    return btoa(JSON.stringify({agent_id:agent.agent_id, agent_name:agent.agent_name, client_secret: agent.client_secret_key, nlu_endpoint:"http://rasa-nlu-sandbox-bots-ai-sandbox-v2.origin-ctc-core.optum.com/"}));
  }

  $scope.editAgentInfo = function(agent) {
    Agent.update({ agent_id:agent.agent_id }, agent).$promise.then(function() {
      $('#'+agent.agent_id).collapse('hide');
      $rootScope.$broadcast('setAlertText', "Agent information updated Sucessfully!!");
    });
  };
}

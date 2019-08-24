angular
.module('app')
.controller('AgentsController', AgentsController);

function AgentsController($scope, $rootScope, Agent,$http,appConfig,$window) {
  Agent.query(function(data) {
      $scope.agentList = data; 
  });

  /*
  $scope.botDemoClick = function(agent){
    $http({method: 'GET', url: appConfig.api_endpoint_v2 + '/rasa/url'}).then(
      function(response){
        $window.open('/bot-demo?id='+btoa(JSON.stringify({agent_id:agent.agent_id, agent_name:agent.agent_name, client_secret: agent.client_secret_key,nlu_endpoint:response.data.url})));
      },
      function(errorResponse){
        console.log("Error Message while Getting Messages." + errorResponse);
      });  
  }
  */
  $scope.editAgentInfo = function(agent) {
    Agent.update({ agent_id: agent.agent_id }, agent).$promise.then(function() {
      $('#' + agent.agent_id).collapse('hide');
      $rootScope.$broadcast('setAlertText', "Agent information updated Sucessfully!!");
    });
  };
}

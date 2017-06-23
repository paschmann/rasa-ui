angular
.module('app')
.controller('EditAgentController', EditAgentController)

function EditAgentController($scope, Agent, Intents) {
  console.log('Edit Agent controller loaded');

  Agent.get({agent_id: $scope.$routeParams.agent_id}, function(data) {
      $scope.agent = data;
  });

  Intents.query({agent_id: $scope.$routeParams.agent_id}, function(data) {
      $scope.intentList = data;
  });

  $scope.deleteAgent = function() {
    Agent.remove({agent_id: $scope.$routeParams.agent_id}).$promise.then(function(resp) {
      $scope.go('/agents');
    });
  };
}

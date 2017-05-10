angular
.module('app')
.controller('EditAgentController', EditAgentController)

function EditAgentController($scope, Agent, Intents) {
  console.log('Edit Agent controller loaded');

  Agent.query({agent_id: $scope.$routeParams.agent_id}, function(data) {
      $scope.agent = data[0];
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

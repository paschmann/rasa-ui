angular
.module('app')
.controller('AgentsController', AgentsController);

function AgentsController($scope, $rootScope, Agent,$http,appConfig,$window) {
  Agent.query(function(data) {
      $scope.agentList = data; 
  });
}

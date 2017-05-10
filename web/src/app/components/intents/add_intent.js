angular
.module('app')
.controller('AddIntentController', AddIntentController)

function AddIntentController($scope, Agent, Intent) {
  console.log('Add Intent controller loaded');

  Agent.query({agent_id: $scope.$routeParams.agent_id}, function(data) {
      $scope.agent = data[0];
  });

  $scope.addIntent = function(params) {
    this.formData.agent_id = $scope.$routeParams.agent_id;
    Intent.save(this.formData).$promise.then(function(resp) {
      $scope.formData.intent_name = "";
      $scope.go('/agent/' + $scope.$routeParams.agent_id);
    });
  };
}

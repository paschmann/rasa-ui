angular
.module('app')
.controller('AddModelController', AddModelController)

function AddModelController($scope, Model) {
  $scope.addModel = function(params) {
    this.formData.agent_id = $scope.$routeParams.agent_id;
    Model.save(this.formData).$promise.then(function() {
      $scope.go('/models/' + $scope.$routeParams.agent_id)
    });
  };
}

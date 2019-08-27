angular
.module('app')
.controller('AddModelController', AddModelController)

function AddModelController($scope, Model) {
  $scope.addModel = function(params) {
    this.formData.bot_id = $scope.$routeParams.bot_id;
    Model.save(this.formData).$promise.then(function() {
      $scope.go('/models/' + $scope.$routeParams.bot_id)
    });
  };
}

angular
.module('app')
.controller('AddEntityController', AddEntityController)

function AddEntityController($scope, Entity) {
  $scope.addEntity = function(params) {
    Entity.save(this.formData).$promise.then(function(resp) {
      $scope.formData.entity_name = "";
      $scope.go('/entities');
    });
  };
}

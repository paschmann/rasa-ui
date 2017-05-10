angular
.module('app')
.controller('AddEntityController', AddEntityController)

function AddEntityController($scope, Entity) {
  console.log('Add Entity controller loaded');

  $scope.addEntity = function(params) {
    Entity.save(this.formData).$promise.then(function(resp) {
      $scope.formData.entity_name = "";
      $scope.go('/entities');
    });
  };
}

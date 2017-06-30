angular
.module('app')
.controller('EntitiesController', EntitiesController)

function EntitiesController($scope, Entities, Entity) {
  loadEntities();

  function loadEntities() {
    Entities.query(function(data) {
        $scope.entitiesList = data;
    });
  }

  $scope.deleteEntity = function(entity_id) {
    Entity.remove({entity_id: entity_id}).$promise.then(function(resp) {
      loadEntities();
    });
  }
}

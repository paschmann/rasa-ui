angular
.module('app')
.controller('AddEntityController', AddEntityController);

function AddEntityController($scope, Entity,Bot, $rootScope) {

  Bot.get({bot_id: $scope.$routeParams.bot_id}, function(data) {
    $scope.bot = data;
  });

  $scope.addEntity = function(params) {
    this.formData.bot_id = $scope.$routeParams.bot_id;
    Entity.save(this.formData).$promise.then(function() {
      $scope.formData.entity_name = "";
      $rootScope.$broadcast('setAlertText', "Entity Added for " + $scope.bot.bot_name + " Sucessfully !!");
      $scope.go('/bot/' + $scope.$routeParams.bot_id)
    });
  };
}

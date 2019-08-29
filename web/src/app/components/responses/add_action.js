angular
.module('app')
.controller('AddActionController', AddActionController)

function AddActionController($scope, Actions) {
  $scope.bot_id = $scope.$routeParams.bot_id;
  $scope.addAction = function(params) {
    this.formData.bot_id = $scope.bot_id
    Actions.save(this.formData).$promise.then(function() {
      $scope.go('/responses/' +  $scope.bot_id);
    });
  };
}

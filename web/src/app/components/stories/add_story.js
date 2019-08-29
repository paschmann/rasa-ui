angular
.module('app')
.controller('AddStoryController', AddStoryController)

function AddStoryController($scope, Stories) {
  $scope.addStory = function(params) {
    this.formData.bot_id = $scope.$routeParams.bot_id;
    Stories.save(this.formData).$promise.then(function() {
      $scope.go('/stories/' + $scope.$routeParams.bot_id)
    });
  };
}

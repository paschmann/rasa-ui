angular
.module('app')
.controller('AddRegexController', AddRegexController)

function AddRegexController($scope, Regex) {
  $scope.addRegex = function(params) {
    Regex.save(this.formData).$promise.then(function(resp) {
      $scope.formData.regex_name = "";
      $scope.formData.regex_pattern = "";
      $scope.go('/regex');
    });
  };
}

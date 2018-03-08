angular
.module('app')
.controller('EditRegexController', EditRegexController)

function EditRegexController($scope, Regex) {
  $scope.message = "";

  Regex.get({regex_id: $scope.$routeParams.regex_id}, function(data) {
      $scope.regex = data;
  });

  $scope.deleteRegex = function() {
    Regex.remove({regex_id: $scope.$routeParams.regex_id}).$promise.then(function(resp) {
      $scope.go('/regex');
    });
  };

  $scope.editRegex = function(agent) {
    Regex.update({ regex_id: $scope.regex.regex_id }, $scope.regex).$promise.then(function() {
      $scope.go('/regex/' + $scope.regex.regex_id);
      $scope.message = "Regex updated successfully";
    });
  };
}

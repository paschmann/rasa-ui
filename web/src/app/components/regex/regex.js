angular
.module('app')
.controller('RegexController', RegexController)

function RegexController($scope, Regex) {
  loadRegex();

  function loadRegex() {
    Regex.query(function(data) {
        $scope.regexList = data;
    });
  }

  $scope.deleteRegex = function(regex_id) {
    Regex.remove({regex_id: regex_id}).$promise.then(function(resp) {
      loadRegex();
    });
  }
}

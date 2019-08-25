angular.module('app').controller('EditRegexController', EditRegexController);

function EditRegexController($rootScope, $scope, Regex, Agent) {
  $scope.message = '';

  Agent.get({ agent_id: $scope.$routeParams.agent_id }, function (data) {
    $scope.agent = data;
  });

  Regex.get({ regex_id: $scope.$routeParams.regex_id }, function (data) {
    $scope.regex = data;
  });

  $scope.deleteRegex = function () {
    Regex.remove({ regex_id: $scope.$routeParams.regex_id }).$promise.then(
      function () {
        $scope.go(`/agent/${$scope.$routeParams.agent_id}`);
      }
    );
  };

  $scope.editRegex = function (agent) {
    Regex.update(
      { regex_id: $scope.regex.regex_id },
      $scope.regex
    ).$promise.then(function () {
      $rootScope.$broadcast('setAlertText', "Regex updated Sucessfully!!");
      $scope.go(`/agent/${$scope.$routeParams.agent_id}`);
    });
  };
}

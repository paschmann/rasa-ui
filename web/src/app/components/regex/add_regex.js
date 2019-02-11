angular.module('app').controller('AddRegexController', AddRegexController);

function AddRegexController($rootScope,$scope, Regex, Agent, $location) {
  Agent.get({ agent_id: $scope.$routeParams.agent_id }, function(data) {
    $scope.agent = data;
  });

  $scope.addRegex = function() {
    this.formData.agent_id = $scope.$routeParams.agent_id;
    Regex.save(this.formData).$promise.then(function(resp) {
      $scope.formData.regex_name = '';
      $scope.formData.regex_pattern = '';
      if (resp.regex_id) {
        $rootScope.$broadcast('setAlertText', "Regex added Sucessfully!!");
        $location.path(
          `/agent/${$scope.$routeParams.agent_id}`
        );
      }
    });
  };
}

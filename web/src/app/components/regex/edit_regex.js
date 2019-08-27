angular.module('app').controller('EditRegexController', EditRegexController);

function EditRegexController($rootScope, $scope, Regex, Bot) {
  $scope.message = '';

  Bot.get({ bot_id: $scope.$routeParams.bot_id }, function (data) {
    $scope.bot = data;
  });

  Regex.get({ regex_id: $scope.$routeParams.regex_id }, function (data) {
    $scope.regex = data;
  });

  $scope.deleteRegex = function () {
    Regex.remove({ regex_id: $scope.$routeParams.regex_id }).$promise.then(
      function () {
        $scope.go(`/bot/${$scope.$routeParams.bot_id}`);
      }
    );
  };

  $scope.editRegex = function (bot) {
    Regex.update(
      { regex_id: $scope.regex.regex_id },
      $scope.regex
    ).$promise.then(function () {
      $rootScope.$broadcast('setAlertText', "Regex updated Sucessfully!!");
      $scope.go(`/bot/${$scope.$routeParams.bot_id}`);
    });
  };
}

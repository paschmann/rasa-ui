angular.module('app').controller('AddRegexController', AddRegexController);

function AddRegexController($rootScope, $scope, Regex, Bot, $location) {
  Bot.get({ bot_id: $scope.$routeParams.bot_id }, function (data) {
    $scope.bot = data;
  });

  $scope.addRegex = function () {
    this.formData.bot_id = $scope.$routeParams.bot_id;
    Regex.save(this.formData).$promise.then(function (resp) {
      $scope.formData.regex_name = '';
      $scope.formData.regex_pattern = '';
      $rootScope.$broadcast('setAlertText', "Regex added sucessfully!");
      $scope.go('/bot/' + $scope.bot.bot_id);
    });
  };
}

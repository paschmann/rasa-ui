angular.module('app').controller('AddSynonymController', AddSynonymController);

function AddSynonymController($scope, Synonym, EntitySynonymVariants, Bot, SynonymVariant, $location) {
  Bot.get({ bot_id: $scope.$routeParams.bot_id }, function (data) {
    $scope.bot = data;
  });

  $scope.addSynonym = function (params) {
    const obNew = { bot_id: $scope.$routeParams.bot_id, synonym_reference: $("#synonym_reference").val() };
    $('#synonym_reference').val('');
    Synonym.save(obNew).$promise.then(function (resp) {
      $scope.go('/bot/' + $scope.bot.bot_id + '/synonym/' + resp.synonym_id)
    });
  };
}
angular.module('app').controller('AddSynonymController', AddSynonymController);

function AddSynonymController($scope, Synonym, EntitySynonymVariants, Agent, SynonymVariant, $location) {
  Agent.get({ agent_id: $scope.$routeParams.agent_id }, function (data) {
    $scope.agent = data;
  });

  $scope.addSynonym = function (params) {
    //First save the synonym into the synonym table - WTF is this mess?
    const obNew = {
      agent_id: $scope.$routeParams.agent_id,
      synonym_reference: $("#synonym_reference").val()
    };
    $('#synonym_reference').val('');
    Synonym.save(obNew).$promise.then(function (resp) {
      $scope.go('/agent/' + $scope.agent.agent_id + '/synonym/' + resp.synonym_id)
    });
  };
}
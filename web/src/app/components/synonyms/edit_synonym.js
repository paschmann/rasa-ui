angular.module('app').controller('SynonymController', SynonymController);

function SynonymController($scope, Synonym, EntitySynonymVariants, Agent, SynonymVariant, $location) {
  $scope.tags = [{}];

  Agent.get({ agent_id: $scope.$routeParams.agent_id }, function (data) {
    $scope.agent = data;
  });

  if ($scope.$routeParams.synonym_id) {
    Synonym.query({ synonym_id: $scope.$routeParams.synonym_id }, function (data) {
      $scope.synonym = data;
      getEntitySynonymVariants($scope.synonym.synonym_id);
    });
  }

  $scope.synonymRemoved = function (tag) {
    SynonymVariant.remove({ synonym_variant_id: tag.synonym_variant_id });
  };

  $scope.synonymAdded = function (tag, synonym_id) {
    var objNew = {};
    objNew.synonym_value = tag.text;
    objNew.synonym_id = synonym_id;
    SynonymVariant.save(objNew, function (data) {
      //Set the tag id once we have it from the DB
      tag.synonym_variant_id = data.synonym_variant_id
    });
  };

  function getEntitySynonymVariants(synonym_id) {
    EntitySynonymVariants.query({ synonym_id: synonym_id }).$promise.then(function (data) {
      var tags = [];
      for (var i = 0; i <= data.length - 1; i++) {
        tags.push({
          text: data[i].synonym_value,
          synonym_variant_id: data[i].synonym_variant_id
        });
      }
      $scope.tags[synonym_id] = tags;
    }
    );
  }

  $scope.deleteSynonym = function (synonym_id) {
    //First delete all synonym variants, then the synonym
    EntitySynonymVariants.remove({ synonym_id: synonym_id }, function (data) {
      Synonym.remove({ synonym_id: synonym_id }, function (data) {
        $location.path(`/agent/${$scope.$routeParams.agent_id}`);
      });
    });
  };
}

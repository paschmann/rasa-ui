angular
.module('app')
.controller('SynonymController', SynonymController)

function SynonymController($scope, Synonym, EntitySynonymVariants, EntitySynonyms, Entity, Entities, SynonymVariant, EntitySynonymVariants) {
  console.log('Synonym controller loaded');

  $scope.tags = [{}];

  loadSynonyms();

  Entity.get({entity_id: $scope.$routeParams.entity_id}, function(data) {
      $scope.entity = data;
  });

  function loadSynonyms() {
    EntitySynonyms.query({entity_id: $scope.$routeParams.entity_id}, function(data) {
        $scope.synonymsList = data;
    });
  }

  $scope.deleteEntity = function() {
    //delete all synonyms and variants, and then the entity
    var data = $scope.synonymsList;
    for (var i = 0; i <= data.length - 1; i++) {
      Synonym.remove({synonym_id: data[i].synonym_id});
      EntitySynonymVariants.remove({synonym_id: data[i].synonym_id});
    }
    Entity.remove({entity_id: $scope.$routeParams.entity_id}, function(data) {
        $scope.go('/entities');
    });
  }

  $scope.synonymRemoved = function(tag, synonym_id) {
    SynonymVariant.remove({synonym_variant_id: tag.synonym_variant_id});
  }

  $scope.synonymAdded = function(tag, synonym_id) {
    var objNew = {};
    objNew.synonym_value = tag.text;
    objNew.synonym_id = synonym_id;
    SynonymVariant.save(objNew);
  }

  $scope.getEntitySynonymVariants = function(synonym_id) {
    EntitySynonymVariants.query({synonym_id: synonym_id}).$promise.then(function(data) {
      var tags = [];
      for (var i = 0; i <= data.length - 1; i++) {
        tags.push({text: data[i].synonym_value, synonym_variant_id: data[i].synonym_variant_id});
      }
      $scope.tags[synonym_id] = tags;
    });
  }

  $scope.saveNewSynonym = function() {
    //First save the synonym into the synonym table
    var obNew = {entity_id: $scope.$routeParams.entity_id, synonym_reference: $('#synonym_reference').val()};
    $('#synonym_reference').val('');
    Synonym.save(obNew).$promise.then(function(resp) {
      loadSynonyms();
    });
  }

  $scope.saveSynonyms = function(synonym_id) {
    if ($('#synonym_values_' + synonym_id).val() !== undefined) {
      //Split up the comma seperated values
      var arrSynonyms = $('#synonym_values_' + synonym_id).val().split(',');

      for (var i = 0; i <= arrSynonyms.length - 1; i++) {
        var objNew = {};
        objNew.synonym_value = arrSynonyms[i];
        objNew.synonym_id = synonym_id;
        SynonymVariant.save(objNew).$promise.then(function(resp) {
          console.log(resp);
        });
      }
    }
  }

  $scope.deleteSynonym = function(synonym_id) {
    //First delete all synonym variants, then the synonym
    EntitySynonymVariants.remove({synonym_id: synonym_id}, function(data) {
        Synonym.remove({synonym_id: synonym_id}, function(data) {
            loadSynonyms();
        });
    });

  }

}

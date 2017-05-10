

app.factory('Agents', function($resource) {
  return $resource(api_endpoint + '/agents');
});

app.factory('Agent', function($resource) {
  return $resource(api_endpoint + '/agents?agent_id=eq.:agent_id', {agent_id:'@id'});
});


app.factory('Intents', function($resource) {
  return $resource(api_endpoint + '/intents?agent_id=eq.:agent_id', {agent_id:'@id'});
});

app.factory('Intent', function($resource) {
  return $resource(api_endpoint + '/intents?intent_id=eq.:intent_id', {intent_id:'@id'});
});

app.factory('Expressions', function($resource) {
  return $resource(api_endpoint + '/expressions?intent_id=eq.:intent_id', {intent_id:'@id'});
});

app.factory('Expression', function($resource) {
  return $resource(api_endpoint + '/expressions?expression_id=eq.:expression_id', {expression_id:'@id'});
});

app.factory('UniqueIntentEntities', function($resource) {
  return $resource(api_endpoint + '/unique_intent_entities?intent_id=eq.:intent_id', {intent_id:'@id'});
});

app.factory('Entities', function($resource) {
  return $resource(api_endpoint + '/entities');
});

app.factory('Parameters', function($resource) {
  return $resource(api_endpoint + '/expression_parameters?intent_id=eq.:intent_id', {intent_id:'@id'});
});

app.factory('ExpressionParameters', function($resource) {
  return $resource(api_endpoint + '/expression_parameters?expression_id=eq.:expression_id', {expression_id:'@id'});
});

app.factory('Parameter', function($resource) {
  return $resource(api_endpoint + '/parameters?parameter_id=eq.:parameter_id', {parameter_id:'@id'});
});

app.factory('Parameter', ['$resource', function($resource) {
return $resource(api_endpoint + '/parameters?parameter_id=eq.:parameter_id', {parameter_id:'@id'},
    {
        'update': { method:'PATCH' }
    });
}]);

app.factory('Entity', function($resource) {
  return $resource(api_endpoint + '/entities?entity_id=eq.:entity_id', {entity_id:'@id'});
});

app.factory('Synonyms', function($resource) {
  return $resource(api_endpoint + '/synonyms?entity_id=eq.:entity_id', {entity_id:'@id'});
});

app.factory('Synonym', function($resource) {
  return $resource(api_endpoint + '/synonyms?synonym_id=eq.:synonym_id', {synonym_id:'@id'});
});

app.factory('EntitySynonymVariants', function($resource) {
  return $resource(api_endpoint + '/entity_synonym_variants?synonym_id=eq.:synonym_id', {synonym_id:'@id'});
});

app.factory('SynonymVariant', function($resource) {
  return $resource(api_endpoint + '/synonym_variant?synonym_variant_id=eq.:synonym_variant_id', {synonym_variant_id:'@id'});
});

app.factory('DeleteSynonymVariants', function($resource) {
  return $resource(api_endpoint + '/synonym_variant?synonym_id=eq.:synonym_id', {synonym_id:'@id'});
});

app.factory('Settings', function($resource) {
  return $resource(api_endpoint + '/settings');
});

app.factory('Setting', function($resource) {
  return $resource(api_endpoint + '/settings?setting_name=eq.:setting_name', {setting_id:'@id'});
});

app.factory('Setting', ['$resource', function($resource) {
return $resource(api_endpoint + '/settings?setting_name=eq.:setting_name', {setting_id:'@id'},
    {
        'update': { method:'PATCH' }
    });
}]);

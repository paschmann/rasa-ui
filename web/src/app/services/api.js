

app.factory('Agent', function($resource) {
  return $resource(api_endpoint_v2 + '/agents/:agent_id/:path', {agent_id: '@id', path: '@path'},
      {
          'update': { method:'PUT' }
      });
});

app.factory('Actions', function($resource) {
  return $resource(api_endpoint_v2 + '/actions/:action_id', {action_id: '@id'},
      {
          'update': { method:'PUT' }
      });
});

app.factory('AgentActions', function($resource) {
  return $resource(api_endpoint_v2 + '/agents/:agent_id/actions', {agent_id:'@id'});
});

app.factory('AgentStories', function($resource) {
  return $resource(api_endpoint_v2 + '/agentStory');
});


app.factory('Intent', function($resource) {
  return $resource(api_endpoint_v2 + '/intents/:intent_id', {intent_id: '@id'},
      {
          'update': { method:'PUT' }
      });
});

app.factory('Intents', function($resource) {
  return $resource(api_endpoint_v2 + '/agents/:agent_id/intents', {agent_id:'@id'});
});

app.factory('Expressions', function($resource) {
  return $resource(api_endpoint_v2 + '/intents/:intent_id/expressions', {intent_id:'@id'});
});

app.factory('IntentExpressions', function($resource) {
  return $resource(api_endpoint_v2 + '/intent_expressions');
});

app.factory('Expression', function($resource) {
  return $resource(api_endpoint_v2 + '/expressions/:expression_id');
});

app.factory('UniqueIntentEntities', function($resource) {
  return $resource(api_endpoint_v2 + '/intents/:intent_id/unique_intent_entities', {intent_id:'@id'});
});

app.factory('Parameters', function($resource) {
  return $resource(api_endpoint_v2 + '/intent/:intent_id/parameters');
});

app.factory('ExpressionParameters', function($resource) {
  return $resource(api_endpoint_v2 + '/expression_parameters/:expression_id');
});

app.factory('Parameter', ['$resource', function($resource) {
return $resource(api_endpoint_v2 + '/parameters/:parameter_id', {parameter_id: '@id'},
    {
        'update': { method:'PUT' }
    });
}]);

app.factory('Entity', ['$resource', function($resource) {
return $resource(api_endpoint_v2 + '/entities/:entity_id', {entity_id: '@id'},
    {
        'update': { method:'PUT' }
    });
}]);

app.factory('Entities', function($resource) {
  return $resource(api_endpoint_v2 + '/entities');
});

app.factory('Regex', ['$resource', function($resource) {
  return $resource(api_endpoint_v2 + '/regex/:regex_id', {regex_id:'@id'},
  {
      'update': { method:'PUT' }
  });
}]);

app.factory('EntitySynonyms', function($resource) {
  return $resource(api_endpoint_v2 + '/entity/:entity_id/synonyms', {entity_id:'@id'});
});

app.factory('AgentEntities', function($resource) {
  return $resource(api_endpoint_v2 + '/entities/agent/:agent_id', {agent_id:'@id'});
});


app.factory('Synonym', function($resource) {
  return $resource(api_endpoint_v2 + '/synonyms/:synonym_id', {synonym_id:'@id'});
});

app.factory('EntitySynonymVariants', function($resource) {
  return $resource(api_endpoint_v2 + '/synonyms/:synonym_id/variants', {synonym_id:'@id'});
});

app.factory('EntitySynonymVariantsByEntity', function($resource) {
  return $resource(api_endpoint_v2 + '/entity_synonym_variants');
});

app.factory('SynonymVariant', function($resource) {
  return $resource(api_endpoint_v2 + '/variants/:synonym_variant_id', {synonym_variant_id:'@id'});
});

app.factory('AllSynonymVariants', function($resource) {
  return $resource(api_endpoint_v2 + '/synonymvariants');
});

app.factory('Settings', ['$resource', function($resource) {
return $resource(api_endpoint_v2 + '/settings/:setting_name', {setting_name:'@setting_name'},
    {
        'update': { method:'PUT' }
    });
}]);

app.factory('ActionResponses', function($resource) {
  return $resource(api_endpoint_v2 + '/actionresponse/:action_id', {action_id:'@id'});
});
//All responses for an intent
app.factory('Responses', function($resource) {
  return $resource(api_endpoint_v2 + '/response/:intent_id', {intent_id:'@id'});
});
//Reponse actions: create and delete
app.factory('Response', function($resource) {
  return $resource(api_endpoint_v2 + '/response/:response_id', {response_id:'@id'});
});
app.factory('IntentResponse', function($resource) {
  return $resource(api_endpoint_v2 + '/rndmresponse');
});

app.factory('NLU_log', function($resource) {
  return $resource(api_endpoint + '/nlu_log?:query', {query:'@id'});
});

app.factory('NLU_log_intent_usage_by_day', function($resource) {
  return $resource(api_endpoint + '/intent_usage_by_day');
});

app.factory('NLU_log_intent_usage_total', function($resource) {
  return $resource(api_endpoint + '/intent_usage_total');
});

app.factory('NLU_log_request_usage_total', function($resource) {
  return $resource(api_endpoint + '/request_usage_total');
});

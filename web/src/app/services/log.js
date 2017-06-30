app.factory('NLU_log', function($resource) {
  return $resource(api_endpoint_v2 + '/nlu_log/:query', {query:'@id'});
});

app.factory('NLU_log_intent_usage_by_day', function($resource) {
  return $resource(api_endpoint_v2 + '/intent_usage_by_day');
});

app.factory('NLU_log_avg_intent_usage_by_day', function($resource) {
  return $resource(api_endpoint_v2 + '/avg_intent_usage_by_day');
});

app.factory('NLU_log_intent_usage_total', function($resource) {
  return $resource(api_endpoint_v2 + '/intent_usage_total');
});

app.factory('NLU_log_request_usage_total', function($resource) {
  return $resource(api_endpoint_v2 + '/request_usage_total');
});

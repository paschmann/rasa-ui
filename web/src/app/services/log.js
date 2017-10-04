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

app.factory('NLU_Parse_log_request_agentsByIntentConfidencePct', function($resource) {
  return $resource(api_endpoint_v2 + '/agentsByIntentConfidencePct');
});
app.factory('NLU_Parse_log_request_intentsMostUsed', function($resource) {
  return $resource(api_endpoint_v2 + '/intentsMostUsed');
});
app.factory('NLU_Parse_log_request_avgNluResponseTimesLast30Days', function($resource) {
  return $resource(api_endpoint_v2 + '/avgNluResponseTimesLast30Days');
});
app.factory('NLU_Parse_log_request_avgUserResponseTimesLast30Days', function($resource) {
  return $resource(api_endpoint_v2 + '/avgUserResponseTimesLast30Days');
});
app.factory('NLU_Parse_log_request_activeUserCountLast12Months', function($resource) {
  return $resource(api_endpoint_v2 + '/activeUserCountLast12Months');
});
app.factory('NLU_Parse_log_request_activeUserCountLast30Days', function($resource) {
  return $resource(api_endpoint_v2 + '/activeUserCountLast30Days');
});

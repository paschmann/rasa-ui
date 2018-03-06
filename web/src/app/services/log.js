app.factory('NLU_log', function($resource) {
  return $resource(api_endpoint_v2 + '/nlu_log/:query', {query:'@id'});
});

app.factory('NLU_log_stats', function($resource) {
  return $resource(api_endpoint_v2 + '/:path', {path:'@path'});
});

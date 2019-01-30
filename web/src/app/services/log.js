var app = angular.module('app');

app.factory('NLU_log', function($resource, appConfig) {
  return $resource(appConfig.api_endpoint_v2 + '/nlu_log/:query', {
    query: '@id'
  });
});

app.factory('NLU_log_stats', function($resource, appConfig) {
  return $resource(appConfig.api_endpoint_v2 + '/:path', { path: '@path' });
});

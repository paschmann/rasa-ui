var app = angular.module('app');

app.factory('Rasa_Parse', function($resource, appConfig) {
  return $resource(
    appConfig.api_endpoint_v2 + '/rasa/parse?q=:query&model=:model',
    { query: '@id', model: '@id' }
  );
});

app.factory('Rasa_Status', function($resource, appConfig) {
  return $resource(appConfig.api_endpoint_v2 + '/rasa/status');
});

app.factory('Rasa_Config', function($resource, appConfig) {
  return $resource(appConfig.api_endpoint_v2 + '/rasa/config');
});

app.factory('Rasa_Version', function($resource, appConfig) {
  return $resource(appConfig.api_endpoint_v2 + '/rasa/version');
});

app.factory('Rasa_Story', function($resource, appConfig) {
  return $resource(appConfig.api_endpoint_v2 + '/rasa/story');
});
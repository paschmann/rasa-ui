app.factory('Rasa_Parse', function($resource) {
  return $resource(api_endpoint_v2 + '/rasa/parse?q=:query&model=:model', {query:'@id', model: '@id'});
});

app.factory('Rasa_Status', function($resource) {
  return $resource(api_endpoint_v2 + '/rasa/status');
});

app.factory('Rasa_Config', function($resource) {
  return $resource(api_endpoint_v2 + '/rasa/config');
});

app.factory('Rasa_Version', function($resource) {
  return $resource(api_endpoint_v2 + '/rasa/version');
});

/* TODO: future feature
app.factory('Set_Rasa_Config', function($resource) {
  return $resource(rasa_api_endpoint + '/setconfig?:key=:value', {key: '@id', value: '@id'});
});
*/

app.factory('Rasa_Parse', function($resource) {
  return $resource(rasa_api_endpoint + '/parse?q=:query&model=:model', {query:'@id', model: '@id'});
});

app.factory('Rasa_Status', function($resource) {
  return $resource(rasa_api_endpoint + '/status');
});

app.factory('Rasa_Config', function($resource) {
  return $resource(rasa_api_endpoint + '/config');
});

app.factory('Rasa_Version', function($resource) {
  return $resource(rasa_api_endpoint + '/version');
});

/* TODO: future feature
app.factory('Set_Rasa_Config', function($resource) {
  return $resource(rasa_api_endpoint + '/setconfig?:key=:value', {key: '@id', value: '@id'});
});
*/

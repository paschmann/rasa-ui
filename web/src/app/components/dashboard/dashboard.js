angular.module('app').controller('DashboardController', DashboardController);

function DashboardController($scope, $http, Rasa_Status, NLU_log_stats, appConfig) {
  $scope.showLoadedModels = false;
  getRasaStatus();
  getIntentUsageTotalStatus();
  getRequestUsageTotalStatus();

  function getRasaStatus() {
    Rasa_Status.get(function(data) {
      $scope.trainings_under_this_process = window.getNoOfTrainingJobs(data);
      $scope.available_models = window.getAvailableModels(data);
      $scope.loaded_models = window.getLoadedModels(data);
    });
  }

  function getRequestUsageTotalStatus() {
    NLU_log_stats.query({ path: 'request_usage_total' }, function(data) {
      $scope.request_processed = data[0].count;
    });
  }

  function getIntentUsageTotalStatus() {
    NLU_log_stats.query({ path: 'intent_usage_total' }, function(data) {
      $scope.intents_processed = data[0].count;
    });
  }

  $scope.unloadLoadedModel = function(model) {
    const project = model.name;
    const id = model.id;

    $http({method: 'DELETE', url: appConfig.api_endpoint_v2 + '/rasa/models?project='+ project + '&model=' + id}).then(
      function(response){
        getRasaStatus();
      },
      function(errorResponse){
        $scope.generateError = JSON.stringify(errorResponse.data.errorBody);
      }
    );
  }
}

angular
.module('app')
.controller('DashboardController', DashboardController)

function DashboardController($scope, Rasa_Status, NLU_log_intent_usage_total, NLU_log_request_usage_total) {
  getRasaStatus();
  getIntentUsageTotalStatus();
  getRequestUsageTotalStatus();

  function getRasaStatus() {
    Rasa_Status.get(function(data) {
        //$scope.trainings_under_this_process = data.trainings_queued;
        $scope.trainings_under_this_process = getNoOfTrainingJobs(data);
        debugger;
        $scope.available_models = getAvailableModels(data);
        //$scope.available_models = data.available_models;
    });
  }

  function getRequestUsageTotalStatus() {
    NLU_log_request_usage_total.query(function(data) {
        $scope.request_processed = data[0].count;
    });
  }

  function getIntentUsageTotalStatus() {
    NLU_log_intent_usage_total.query(function(data) {
        $scope.intents_processed = data[0].count;
    });
  }
}

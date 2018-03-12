angular
.module('app')
.controller('DashboardController', DashboardController)

function DashboardController($scope, Rasa_Status, NLU_log_stats) {
  getRasaStatus();
  getIntentUsageTotalStatus();
  getRequestUsageTotalStatus();

  function getRasaStatus() {
    Rasa_Status.get(function(data) {
        $scope.trainings_under_this_process = getNoOfTrainingJobs(data);
        $scope.available_models = getAvailableModels(data);
    });
  }

  function getRequestUsageTotalStatus() {
    NLU_log_stats.query({path: "request_usage_total"}, function(data) {
        $scope.request_processed = data[0].count;
    });
  }

  function getIntentUsageTotalStatus() {
    NLU_log_stats.query({path: "intent_usage_total"}, function(data) {
        $scope.intents_processed = data[0].count;
    });
  }
}

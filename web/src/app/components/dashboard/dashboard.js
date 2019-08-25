angular.module('app').controller('DashboardController', DashboardController);

function DashboardController($scope, $http, Rasa_Status, NLU_log_stats, appConfig) {
  getRasaStatus();
  getTotalLogEntries();
  getRequestUsageTotalStatus();

  function getRequestUsageTotalStatus() {
    NLU_log_stats.get({ path: 'request_usage_total' }, function(data) {
      $scope.request_processed = data.total_request_usage;
    });
  }

  function getTotalLogEntries() {
    NLU_log_stats.get({ path: 'total_log_entries' }, function(data) {
      $scope.total_log_entries = data.total_log_entries;
    });
  }

  function getRasaStatus() {
    Rasa_Status.get(function(data) {
      $scope.model_file = data.model_file;
      if (data.fingerprint) {
        $scope.trained_at = window.timeConverter(data.fingerprint.trained_at);
      } else {
        $scope.model_file = "No model loaded";
        $scope.trained_at = "Unavailable";
      }
    });
  }
}

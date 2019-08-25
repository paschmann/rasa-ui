angular
.module('app')
.controller('LogsController', LogsController);

function LogsController($scope, $http, $sce, NLU_log) {

  $scope.loadLogs = function(type) {
    const query = type;
    NLU_log.query({query}, function(data) {
        $scope.logData = data;
    });
  }
}

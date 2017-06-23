angular
.module('app')
.controller('LogsController', LogsController)

function LogsController($scope, $http, $sce, NLU_log) {

  $scope.loadLogs = function(type) {
    var query = type;
    /*
    if (type === 'parse' || type === 'train') {
      query = 'event_type=eq.' + type
    } else {
      query = 'event_type=neq.parse&event_type=neq.train'
    }
    query += '&limit=100&order=timestamp.desc'
    */
    
    NLU_log.query({query: query}, function(data) {
        $scope.logData = data;
    });
  }
}

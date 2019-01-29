angular.module('app').controller('HistoryController', HistoryController);

function HistoryController($scope, $http, $location, Agent, appConfig) {
  $scope.conversations = [];
  $scope.selectedAgentId = '';
  $scope.itemsPerPage = 20;
  $scope.currentPage = 1;

  Agent.query(function(data) {
    $scope.agentList = data;
    if ($scope.agentList.length > 0) {
      $scope.selectedAgentId = data[0].agent_id;
      $scope.loadAgentConversations();
    }
  });

  $scope.loadAgentConversations = function() {
    $http({
      method: 'GET',
      url: `${appConfig.api_endpoint_v2}/agent/${
        $scope.selectedAgentId
      }/messages?itemsPerPage=${$scope.itemsPerPage}&page=${$scope.currentPage}`}).then(
      function(response) {
        $scope.totalItems = response.data.meta.total;
        $scope.conversations = response.data.conversations;
      },
      function(errorResponse) {}
    );
  };

  $scope.onPageChange = function(newPageNumber, oldPageNumber) {
    $scope.currentPage = newPageNumber;
    if (newPageNumber !== oldPageNumber) {
      $scope.loadAgentConversations();
    }
  };

  $scope.goToConversation = function(userId) {
    $location.path(`/conversation/${$scope.selectedAgentId}/${userId}`);
  };
}

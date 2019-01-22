angular.module("app").controller("HistoryController", HistoryController);

function HistoryController($scope, $http, $location, Agent, appConfig) {
  $scope.users = [];
  $scope.selectedAgentId = "";
  Agent.query(function(data) {
    $scope.agentList = data;
    if ($scope.agentList.length > 0) {
      $scope.selectedAgentId = data[0].agent_id;
      $scope.loadAgentHistory();
    }
  });

  //get recent 9 users
  $scope.loadAgentHistory = function() {
    $http({
      method: "GET",
      url:
        appConfig.api_endpoint_v2 +
        "/agent/" +
        $scope.selectedAgentId +
        "/messages?limit=20"
    }).then(
      function(response) {
        $scope.users = response.data;

        //load chat history for them
        for (var i = 0; i < $scope.users.length; i++) {
          //closure to update the chat logs
          var userChatlog = (function(i) {
            $http
              .post(
                appConfig.api_endpoint_v2 + "/messages/list",
                JSON.stringify({
                  user_id: $scope.users[i].user_id,
                  agent_id: $scope.selectedAgentId
                })
              )
              .then(
                function(response) {
                  $scope.users[i].chatlog = getFormattedChatlog(response.data);
                },
                function(errorResponse) {}
              );
          })(i);
        }
      },
      function(errorResponse) {}
    );
  };

  $scope.goToConversation = function(userId) {
    $location.path(`/conversation/${$scope.selectedAgentId}/${userId}`);
  };

  function getFormattedChatlog(chatlog) {
    chatlog.timestamp = window.getConversationTimestamp(chatlog);
    var intentsAndNoMatch = window.getConversationIntentsAndNoMatch(chatlog);
    chatlog.intentsNumber = intentsAndNoMatch.intents;
    chatlog.noMatchNumber = intentsAndNoMatch.noMatch;
    return chatlog;
  }
}

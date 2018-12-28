angular.module("app").controller("HistoryController", HistoryController);

function HistoryController($scope, $http, Agent) {
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
    console.log("Loading agent history:" + $scope.selectedAgentId);
    $http({
      method: "GET",
      url: api_endpoint_v2 + "/agent/" + $scope.selectedAgentId + "/messages"
    }).then(
      // $http({method: 'GET', url: api_endpoint_v2 + '/agent/'+$scope.selectedAgentId+'/recent9UniqueUsersList'}).then(
      function(response) {
        $scope.users = response.data;
        console.log("$scope.users", $scope.users);

        //load chat history for them
        for (var i = 0; i < $scope.users.length; i++) {
          //closure to update the chat logs
          var userChatlog = (function(i) {
            $http
              .post(
                api_endpoint_v2 + "/messages/list",
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

  getFormattedChatlog = function(chatlog) {
    chatlog.timestamp = getConversationTimestamp(chatlog);
    var intentsAndNoMatch = getConversationIntentsAndNoMatch(chatlog);
    chatlog.intentsNumber = intentsAndNoMatch.intents;
    chatlog.noMatchNumber = intentsAndNoMatch.noMatch;
    return chatlog;
  };

  function getConversationIntentsAndNoMatch(chatlog) {
    var noMatch = 0;
    var intents = 0;
    if (chatlog) {
      for (let index = 0; index < chatlog.length; index++) {
        const message = chatlog[index];
        if (message.user_name === "user") {
          if (
            message &&
            message.intent_name &&
            message.intent_name.length > 0
          ) {
            intents++;
          } else {
            noMatch++;
          }
        }
      }
    }
    return { intents, noMatch };
  }

  getConversationTimestamp = function(chatlog) {
    return chatlog && chatlog[0] && chatlog[0].timestamp
      ? chatlog[0].timestamp
      : null;
  };
}

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
                  console.log("loading for " + $scope.users[i].user_id);
                  $scope.users[i].chatlog = response.data;
                },
                function(errorResponse) {}
              );
          })(i);
        }
      },
      function(errorResponse) {}
    );
  };

  $scope.updateModalInfo = function(message) {
    $http({
      method: "GET",
      url: api_endpoint_v2 + "/messages/" + message.messages_id
    }).then(
      function(response) {
        $scope.messageDetails = response.data[0];
      },
      function(errorResponse) {
        console.log("Error Message while Getting Messages." + errorResponse);
      }
    );
  };

  $scope.getConversationNomatch = function(chatlog) {
    var noMatch = 0;
    if (chatlog) {
      for (let index = 0; index < chatlog.length; index++) {
        const message = chatlog[index];
        if (message && message.message_rich && message.message_rich.intent) {
          if (message.message_rich.intent.confidence === 0) {
            noMatch++;
          }
        }
      }
    }

    return noMatch;
  };

  $scope.getConversationIntents = function(chatlog) {
    var noMatch = 0;
    if (chatlog) {
      for (let index = 0; index < chatlog.length; index++) {
        const message = chatlog[index];
        if (message && message.message_rich && message.message_rich.intent) {
          if (message.message_rich.intent.confidence > 0) {
            noMatch++;
          }
        }
      }
    }

    return noMatch;
  };
  $scope.getConversationTimestamp = function(chatlog) {
    var timestamp = "";
    if (chatlog) {
      for (let index = 0; index < chatlog.length; index++) {
        const message = chatlog[index];
        if (message) {
          return message.timestamp;
        }
      }
    }

    return timestamp;
  };
}

angular.module('app').controller('HistoryController', HistoryController)

function HistoryController($scope, $http, Agent) {
  $scope.top9users=[];
  $scope.selectedAgentId='';
  Agent.query(function(data) {
      $scope.agentList = data;
      if($scope.agentList.length>0){
        $scope.selectedAgentId= data[0].agent_id;
        $scope.loadAgentHistory();
      }
  });

    //get recent 9 users
  $scope.loadAgentHistory = function() {
      console.log("Loading agent history:"+ $scope.selectedAgentId);
      $http({method: 'GET', url: api_endpoint_v2 + '/agent/'+$scope.selectedAgentId+'/recent9UniqueUsersList'}).then(
          function(response){
            $scope.top9users=response.data;
            //load chat history for them
            for (var i=0;i<$scope.top9users.length;i++) {
              //closure to update the chat logs
              var userChatlog = (function(i) {
                 $http.post(api_endpoint_v2 + "/messages/list", JSON.stringify({user_id:$scope.top9users[i].user_id,agent_id:$scope.selectedAgentId})).then(
                   function(response){
                     console.log("loading for "+ $scope.top9users[i].user_id);
                     $scope.top9users[i].chatlog=response.data;
                   },
                   function(errorResponse){
                   }
                 );
               })(i);
              }
          },
          function(errorResponse){
          }
        );
    }

    $scope.updateModalInfo= function(message) {
      $http({method: 'GET', url: api_endpoint_v2 + '/messages/'+message.messages_id}).then(
          function(response){
            $scope.messageDetails = response.data[0]
          },
          function(errorResponse){
            console.log("Error Message while Getting Messages." + errorResponse);
          });

    }

  $scope.updateModalFeedbackInfo= function(mesage) {
      console.log("Add Expression to an Intent. TODO.");
    }

}

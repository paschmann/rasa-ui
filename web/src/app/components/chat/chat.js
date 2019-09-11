angular.module('app').controller('ChatController', ChatController);

function ChatController($scope, $rootScope, $interval, $http, Rasa_Version, Settings, Rasa_Status, appConfig, Rasa_Parse, $timeout) {
  $scope.test_text = "Hello";
  $scope.test_text_response = {};
  $scope.transactions = [];
  $rootScope.config = {}; //Initilize in case server is not online at startup

  $scope.resetConversation = function() {
    $scope.test_text_response = {};
    $http.post(appConfig.api_endpoint_v2 + '/rasa/restart');
    $scope.response_text = [];
    $scope.test_text_response = {};
    $scope.test_text = '';
    $rootScope.$broadcast('setAlertText', 'Conversation restarted!!');
  };
  
  function getTransactionID() {
    return Math.floor(Date.now() / 1000);
  }

  function addTransaction(text, source, response) {
    var transaction = {};
    transaction.id = getTransactionID();
    transaction.source = source
    transaction.response = response;
    transaction.text = text;
    transaction.transaction_date = new Date();
    //lets add a small simulation that the server is typing a message
    if (text != "" && source == "server") {
      //add a temporary typing transaction
      var typing = {};
      typing.id = getTransactionID();
      typing.source = source
      typing.text = " .... ";
      typing.transaction_date = "";
      $scope.transactions.push(typing);
      $timeout( function(){
        $scope.transactions.pop();
        $scope.transactions.push(transaction);
        scrollToMessage();
      }, 1000 );
    } else {
      $scope.transactions.push(transaction);
    }
    scrollToMessage();
  }

  function scrollToMessage() {
    $("#container").scrollTop($("#container")[0].scrollHeight);
  }

  function updateMessageWindows() {

  }

  /*
  $scope.executeNLURequest = function () {
    let reqMessage = {};
    reqMessage = { text: $scope.test_text };
    //TODO: We should use a factory method for this
    if ($scope.test_text) {
      //make a httpcall
      $http.post(appConfig.api_endpoint_v2 + '/rasa/model/parse', JSON.stringify(reqMessage)).then(function (response) {
        
      },
        function (errorResponse) {
          //
        }
      );
    }
  };
  */

  $scope.executeCoreRequest = function () {
    let reqMessage = {};
    reqMessage = { text: $scope.test_text, sender: "user" };
    addTransaction($scope.test_text, "user");
    //TODO: We should use a factory method for this
    if ($scope.test_text) {
      //make a httpcall
      $http.post(appConfig.api_endpoint_v2 + '/rasa/webhooks/rest/webhook', JSON.stringify(reqMessage)).then(function (response) {
        $scope.test_text = "";
        $('.write_msg').focus();
        addTransaction(response.data[0] ? response.data[0].text : '', "server", response);
      },
        function (errorResponse) {
          //
        }
      );
    }
  };
}

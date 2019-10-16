angular.module('app').controller('ChatController', ChatController);

function ChatController($scope, $rootScope, $interval, $http, Rasa_Version, Settings, Rasa_Status, appConfig, Rasa_Parse, $timeout, Conversations, Bot, Rasa_Story) {
  $scope.test_text = "";
  $scope.test_text_response = {};
  $scope.transactions = [];
  $scope.selected_conversation = {};
  $scope.conversationsList = [];
  $scope.bot = {};
  $scope.selectedBot = {};
  $scope.selected_message = {};
  $scope.message = {};
  $scope.message.text = "";

  Bot.query(function (data) {
    $scope.botList = data;
  });

  //Download all conversations
  $scope.loadBotConversations = function (bot_id) {
    $scope.selectedBot = $scope.objectFindByKey($scope.botList, 'bot_id', bot_id);
    Conversations.query({ bot_id: bot_id }, data => {
      $scope.conversationsList = data;
    });
  }

  $scope.loadConversationStory = function (conversation_id) {
    $http.get(appConfig.api_endpoint_v2 + '/rasa/story?conversation_id=' + conversation_id).then(function (response) {
      $scope.selected_conversation.story = response.data;
    });
  }

  $scope.resendMessage = function () {
    $scope.test_text = $scope.selected_message.text;
    $scope.executeCoreRequest();
  }

  $scope.addBotConversation = function () {
    this.formData.bot_id = $scope.selectedBot.bot_id;
    Conversations.save(this.formData).$promise.then(function () {
      $scope.loadBotConversations($scope.selectedBot.bot_id);
    });
  }

  $scope.deleteConversation = function (conversation_id) {
    Conversations.delete({ conversation_id: conversation_id }, data => {
      clearScreen();
      $scope.loadBotConversations($scope.selectedBot.bot_id);
    });
  }

  $scope.loadConversation = function (selected_conversation) {
    try {
      clearScreen();
      $scope.selected_conversation = selected_conversation;
      if (selected_conversation.conversation) {
        var conversation = JSON.parse(selected_conversation.conversation);
        if (conversation && conversation.tracker && conversation.tracker.events) {
          $scope.transactions = conversation.tracker.events;
        }
        $scope.loadConversationStory(selected_conversation.conversation_id);
      }
      scrollToMessage();
    } catch (err) {
      console.log(err);
    }
  }

  $scope.loadConversationDetail = function (selected_message) {
    $scope.selected_message = selected_message;
    $('#tabs li:eq(1) a').tab('show')
  }

  $scope.resetConversation = function (conversation_id) {
    $scope.test_text_response = {};
    var body = JSON.stringify({ conversation_id: conversation_id })
    $http.post(appConfig.api_endpoint_v2 + '/rasa/restart', body).then(function (response) {
      clearScreen();
      $scope.loadBotConversations($scope.selectedBot.bot_id);
    });
  };


  $scope.executeCoreRequest = function () {
    let reqMessage = {};
    reqMessage = { text: $scope.test_text, sender: "user", conversation_id: $scope.selected_conversation.conversation_id };
    //TODO: We should use a factory method for this
    if ($scope.test_text) {
      //make a httpcall
      $scope.test_text = "";
      $('.write_msg').focus();
      $http.post(appConfig.api_endpoint_v2 + '/rasa/conversations/messages', JSON.stringify(reqMessage)).then(function (response) {
        if (response.data && response.data.tracker) {
          $scope.selected_conversation.conversation = JSON.stringify(response.data);
          $scope.transactions = response.data.tracker.events;
          checkForActions(response.data);
          $scope.loadConversationStory($scope.selected_conversation.conversation_id);
          scrollToMessage();
        }
      },
        function (errorResponse) {
          //
        }
      );
    }
  };

  function checkForActions(messages_response) {
    if (messages_response.confidence && messages_response.confidence >= 1) {
      var body = { 'conversation_id': $scope.selected_conversation.conversation_id, action: { 'name': messages_response.scores[0].action } };
      $http.post(appConfig.api_endpoint_v2 + '/rasa/conversations/execute', JSON.stringify(body)).then(function (response) {
        if (response.data && response.data.tracker) {
            var typing = {};
            typing.event = "bot"
            typing.text = " .... ";
            $scope.transactions.push(typing);
            
            $timeout(function () {
              $scope.transactions.pop();
              $scope.selected_conversation.conversation = JSON.stringify(response.data);
              $scope.transactions = response.data.tracker.events;
              $scope.loadConversationStory($scope.selected_conversation.conversation_id);
              scrollToMessage();
            }, 1000);
        }
      },
        function (errorResponse) {
          //
        }
      );
    }
  }

  function clearScreen() {
    $scope.transactions = [];
    $scope.selected_conversation = {};
    $scope.selected_message = {};
    $scope.message = {};
    $scope.message.text = "";
  }

  function getTransactionID() {
    return Math.floor(Date.now() / 1000);
  }

  function scrollToMessage() {
    $timeout(function () {
      $("#container").scrollTop($("#container")[0].scrollHeight);
    }, 100);
  }




  /*
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
  */


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
}

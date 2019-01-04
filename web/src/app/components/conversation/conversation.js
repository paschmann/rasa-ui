angular
  .module("app")
  .controller("ConversationController", ConversationController);

function ConversationController(
  $scope,
  $http,
  AgentEntities,
  Agent,
  Intents,
  ModalService,
  Parameter,
  Expression
) {
  $scope.chatlog;
  $scope.selectedAgentId = $scope.$routeParams.agent_id;
  $scope.userId = $scope.$routeParams.user_id;
  $scope.intentList = [];
  $scope.entitiesList = [];
  $scope.highlightedMessage;
  $scope.selectedMessage;
  $scope.selectedEntity;
  $scope.selectedText;
  $scope.selectedMessageId;
  $scope.conversationEntities = [];

  Intents.query({ agent_id: $scope.$routeParams.agent_id }, function(data) {
    $scope.intentList = data;
  });

  Agent.get({ agent_id: $scope.$routeParams.agent_id }, function(data) {
    $scope.agent = data;
  });

  AgentEntities.query({ agent_id: $scope.$routeParams.agent_id }, function(
    data
  ) {
    $scope.entitiesList = data;
  });

  getMessagesList();

  $scope.$on("entitySelected", function(evt, data) {
    $scope.selectedText = data.selectedText;
    $scope.selectedMessageId = parseInt(data.messageId.replace("message-", ""));
  });

  function getMessagesList() {
    $http
      .post(
        api_endpoint_v2 + "/messages/list",
        JSON.stringify({
          user_id: $scope.userId,
          agent_id: $scope.selectedAgentId
        })
      )
      .then(
        function(response) {
          $scope.chatlog = getFormattedChatlog(response.data);
          $scope.conversationEntities = getConversationEntities($scope.chatlog);
          highlightMessagesEntities($scope.chatlog);
        },
        function(errorResponse) {}
      );
  }

  $scope.editIntent = function(message) {
    console.log("editIntent", message);
    ModalService.showModal({
      templateUrl: "/app/components/conversation/modal/edit_intent.html",
      controller: "EditIntentModalController",
      inputs: {
        message: message,
        agent: $scope.agent,
        intentList: $scope.intentList
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(result) {
        if (result.intent_id && result.intent_name) {
          message.intent_id = result.intent_id;
          message.intent_name = result.intent_name;
        }
      });
    });
  };

  $scope.editEntity = function(entity) {
    ModalService.showModal({
      templateUrl: "/app/components/conversation/modal/edit_entity.html",
      controller: "EditEntityModalController",
      inputs: {
        entity,
        selectedText: undefined,
        message: $scope.selectedMessage,
        agent: $scope.agent,
        entitiesList: $scope.entitiesList
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(result) {
        if (result) {
          getMessagesList();
        }
      });
    });
  };

  $scope.addEntity = function() {
    const message = $scope.chatlog.find(
      message => message.messages_id === $scope.selectedMessageId
    );
    ModalService.showModal({
      templateUrl: "/app/components/conversation/modal/edit_entity.html",
      controller: "EditEntityModalController",
      inputs: {
        entity: undefined,
        selectedText: $scope.selectedText,
        message: message,
        agent: $scope.agent,
        entitiesList: $scope.entitiesList
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(result) {
        if (result) {
          getMessagesList();
        }
      });
    });
  };

  $scope.selectEntity = function(message, index) {
    if (message && index > -1) {
      $scope.selectedMessage = message;
      if (message.entities && message.entities.length > 0) {
        $scope.selectedEntity = message.entities[index];
      }
    } else {
      $scope.selectedMessage = undefined;
      $scope.selectedEntity = undefined;
    }
  };

  $scope.deleteEntity = async function(entity, conversationEntityIndex) {
    conversationEntityIndex = conversationEntityIndex || undefined;

    if (!$scope.selectedMessage) {
      for (let index = 0; index < $scope.chatlog.length; index++) {
        const message = $scope.chatlog[index];
        if (message.messages_id === entity.messages_id) {
          $scope.selectedMessage = message;
          break;
        }
      }
    }

    if (!$scope.selectedMessage.expression_id) {
      var expression = {};
      if ($scope.selectedMessage.intent_id) {
        expression.intent_id = $scope.selectedMessage.intent_id;
      }
      expression.expression_text = $scope.selectedMessage.message_text;
      await Expression.save(expression).$promise;
    }

    await Parameter.delete({ parameter_id: entity.parameter_id }, entity)
      .$promise;

    $http
      .delete(`${api_endpoint_v2}/messages/${entity.messages_id}/entities`, {
        data: entity,
        headers: { "Content-Type": "application/json;charset=utf-8" }
      })
      .then(() => {
        getMessagesList();
      });
  };

  $scope.highlightMessageEntites = function(message) {
    if (message && message.user_name === "user") {
      $scope.highlightedMessage = message;
    } else {
      $scope.highlightedMessage = undefined;
    }
  };

  $scope.isMessageEntityHighlighted = function(entity) {
    return $scope.highlightedMessage
      ? $scope.highlightedMessage.messages_id === entity.messages_id
      : false;
  };

  $scope.isEntitySelected = function(entity) {
    return $scope.selectedEntity ? $scope.selectedEntity === entity : false;
  };

  getFormattedChatlog = function(chatlog) {
    chatlog.timestamp = getConversationTimestamp(chatlog);
    var intentsAndNoMatch = getConversationIntentsAndNoMatch(chatlog);
    chatlog.intentsNumber = intentsAndNoMatch.intents;
    chatlog.noMatchNumber = intentsAndNoMatch.noMatch;
    return chatlog;
  };

  function getConversationEntities(chatlog) {
    let conversationEntities = [];
    for (let i = 0; i < chatlog.length; i++) {
      const message = chatlog[i];

      if (message.entities) {
        for (let i = 0; i < message.entities.length; i++) {
          const entity = message.entities[i];
          conversationEntities = conversationEntities.concat(entity);
        }
      }
    }
    return conversationEntities;
  }

  function highlightMessagesEntities(chatlog) {
    for (let i = 0; i < chatlog.length; i++) {
      const message = chatlog[i];
      if (message.entities) {
        replaceMessageEntities(message);
      }
    }
  }

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

  function getConversationTimestamp(chatlog) {
    return chatlog && chatlog[0] && chatlog[0].timestamp
      ? chatlog[0].timestamp
      : null;
  }

  function replaceMessageEntities(message) {
    if (message) {
      if (message.entities.length > 0) {
        for (let i = 0; i < message.entities.length; i++) {
          const entity = message.entities[i];
          message.message_text_highlight = message.message_text.replace(
            entity.parameter_value,
            `<span class="entity"
            edit-entity
            ensure-element-in-view
            element-id="entity-${entity.messages_id}-${entity.parameter_id}"
            container-id="entities"
            ng-click="selectEntity(message, ${i})">${
              entity.parameter_value
            }</span>`
          );
        }
      } else {
        message.message_text_highlight = message.message_text;
      }
    }
  }
}

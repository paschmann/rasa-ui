angular
  .module("app")
  .controller("ConversationController", ConversationController);

function ConversationController(
  $scope,
  $http,
  AgentEntities,
  Agent,
  Intents,
  ModalService
) {
  $scope.chatlog;
  $scope.selectedAgentId = $scope.$routeParams.agent_id;
  $scope.userId = $scope.$routeParams.user_id;
  $scope.intentList = [];
  $scope.entitiesList = [];
  $scope.highlightedMessage;
  $scope.selectedMessage;
  $scope.selectedEntity;
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

  $scope.$on("entitySelected", function(evt, data) {
    console.log("entitySelected", data);
    $scope.selectedEntity = data;
  });

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
        console.log("modal close result", result);
        if (result.intent_id && result.intent_name) {
          message.intent_id = result.intent_id;
          message.intent_name = result.intent_name;
        }
      });
    });
  };
  $scope.addEntity = function() {
    console.log("addEntity", $scope.selectedEntity);
    ModalService.showModal({
      templateUrl: "/app/components/conversation/modal/edit_entity.html",
      controller: "EditEntityModalController",
      inputs: {
        entity: $scope.selectedEntity,
        agent: $scope.agent,
        entitiesList: $scope.entitiesList
      }
    }).then(function(modal) {
      modal.element.modal();
      modal.close.then(function(result) {
        // $scope.message = result ? "You said Yes" : "You said No";
      });
    });
  };
  $scope.selectEntity = function(message, index) {
    if (message && index > -1) {
      $scope.selectedMessage = message;
      if (message.entities && message.entities.length > 0) {
        $scope.selectedEntity = message.entities[index];

        // ensureEntityInView($scope.selectedEntity);
      }
    } else {
      $scope.selectedMessage = undefined;
      $scope.selectedEntity = undefined;
    }
  };

  $scope.deleteEntity = function(entity, index) {
    $http
      .delete(`${api_endpoint_v2}/messages/${entity.messages_id}/entities`, {
        data: entity,
        headers: { "Content-Type": "application/json;charset=utf-8" }
      })
      .then(function(resp) {
        $scope.conversationEntities.splice(index, 1);
        for (let index = 0; index < $scope.chatlog.length; index++) {
          const message = $scope.chatlog[index];
          if (message.messages_id === entity.messages_id) {
            const messageEntityIndex = message.entities.findIndex(
              messageEntity =>
                messageEntity.parameter_id === entity.parameter_id
            );

            message.entities.splice(messageEntityIndex, 1);
            replaceMessageEntities(message);
          }
        }

        console.log("deleteEntity", resp);
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
    console.log("chatlog", chatlog);
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
            ng-mouseover="selectEntity(message, ${i})"
            ng-mouseleave="selectEntity(undefined, undefined)"
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

angular.module("app").directive("selection", [
  "$rootScope",
  function($rootScope) {
    return {
      restrict: "A",
      link: function(scope, element) {
        element = element[0];
        elementHeight = element.offsetHeight;
        element.style.display = "none";

        document.addEventListener("selectionchange", function(event) {
          const selection = window.getSelection();
          if (
            selection.baseNode &&
            selection.baseNode.parentElement.classList.contains("message")
          ) {
            selectionRange = selection.getRangeAt(0); //get the text range
            selectionRect = selectionRange.getBoundingClientRect();
            element.style.top = selectionRect.y - elementHeight - 20 + "px";
            element.style.left =
              selectionRect.x +
              selectionRect.width / 2 -
              element.offsetWidth / 2 +
              "px";
            var selectedText = selection.toString();
            element.style.display = selectedText.length > 0 ? "block" : "none";

            $rootScope.$broadcast("entitySelected", {
              selectedText,
              messageText: selection.baseNode.data
            });
          } else {
            // element.style.display = "none";
          }
        });

        document
          .querySelector("#chatlog")
          .addEventListener("scroll", function() {
            if (element.style.display === "block") {
              element.style.display = "none";
            }
          });
      }
    };
  }
]);

angular.module("app").directive("editEntity", [
  function() {
    return {
      restrict: "A",
      link: function(scope, element) {
        const entityEditElem = document.getElementById("entityEdit");
        const entityEditElemHeight = entityEditElem.offsetHeight;
        const entity = element[0];
        entity.addEventListener("click", function() {
          console.log("entity click");

          entityRect = entity.getBoundingClientRect();
          entityEditElem.style.top =
            entity.offsetTop - entityEditElemHeight + "px";
          entityEditElem.style.left =
            entity.offsetLeft +
            entityRect.width / 2 -
            entityEditElem.offsetWidth / 2 +
            "px";
          entityEditElem.style.visibility = "visible";
        });
      }
    };
  }
]);
angular.module("app").directive("ensureElementInView", [
  function() {
    return {
      restrict: "A",
      scope: {
        elementId: "@elementId",
        containerId: "@containerId"
      },
      link: function(scope, element, attrs) {
        function ensureElementInView(element, container) {
          let cTop = container.scrollTop;
          let cBottom = cTop + container.clientHeight;

          //Get element properties
          let eTop = element.offsetTop;
          let eBottom = eTop + element.clientHeight;

          //Check if in view
          let isInView = eTop >= cTop && eBottom <= cBottom;

          if (!isInView) {
            scrollElementToView(container, element);
          }
        }

        function scrollElementToView(container, element) {
          let cTop = container.scrollTop;
          let cBottom = cTop + container.clientHeight;

          let eTop = element.offsetTop;
          let eBottom = eTop + element.clientHeight;
          //Check if out of view
          if (eTop < cTop) {
            container.scrollTop -= cTop - eTop;
          } else if (eBottom > cBottom) {
            container.scrollTop += eBottom - cBottom + 50;
          }
        }

        element[0].addEventListener("mouseover", function() {
          const element = document.getElementById(scope.elementId);
          const container = document.getElementById(scope.containerId);
          ensureElementInView(element, container);
          element.classList.add("active");
        });
        element[0].addEventListener("mouseout", function() {
          const element = document.getElementById(scope.elementId);
          element.classList.remove("active");
        });
      }
    };
  }
]);

angular.module("app").directive("compile", [
  "$compile",
  function($compile) {
    return function(scope, element, attrs) {
      scope.$watch(
        function(scope) {
          // watch the 'compile' expression for changes
          return scope.$eval(attrs.compile);
        },
        function(value) {
          // when the 'compile' expression changes
          // assign it into the current DOM
          element.html(value);

          // compile the new DOM and link it to the current
          // scope.
          // NOTE: we only compile .childNodes so that
          // we don't get into infinite loop compiling ourselves
          $compile(element.contents())(scope);
        }
      );
    };
  }
]);

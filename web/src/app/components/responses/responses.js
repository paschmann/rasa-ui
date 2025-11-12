angular.module('app').controller('ResponseController', ResponseController);

function ResponseController($rootScope, $scope, $sce, Bot, Response, Actions, ErrorHandler) {
  $scope.message = {};
  $scope.message.text = "";
  $scope.bot = {};
  $scope.selectedBot = {};
  $scope.isLoadingBots = true;
  $scope.isLoadingActions = false;
  $scope.isSaving = false;
  $scope.isDeleting = false;

  $scope.graphData = '';
  $scope.responseTypeList = [{id: "text", type: "text"}, {id: "button", type: "buttons"}];
  $scope.responseList = [];

  Bot.query(
    function (data) {
      $scope.botList = data;
      $scope.isLoadingBots = false;

      if ($scope.$routeParams.bot_id) {
        $scope.selectedBot = $scope.objectFindByKey($scope.botList, 'bot_id', Number($scope.$routeParams.bot_id));
        $scope.bot.bot_id = $scope.selectedBot.bot_id;
        $scope.loadBotActionsAndResponses($scope.selectedBot.bot_id);
      }
    },
    function (error) {
      $scope.isLoadingBots = false;
      ErrorHandler.handleError(error, 'loading bots');
    }
  );

  $scope.saveResponse = function(action, action_id) {
    action.new_response.action_id = action_id;
    $scope.isSaving = true;

    Response.save(action.new_response).$promise.then(
      function() {
        $scope.isSaving = false;
        $scope.loadBotActionsAndResponses($scope.selectedBot.bot_id);
      },
      function(error) {
        $scope.isSaving = false;
        ErrorHandler.handleError(error, 'saving response');
      }
    );
  }

  $scope.updateResponse = function(response_id, response_type, response_text) {
    $scope.isSaving = true;

    Response.update({ response_id: response_id, response_type: response_type, response_text: response_text}).$promise.then(
      function() {
        $scope.isSaving = false;
        $scope.go('/responses/' +  $scope.selectedBot.bot_id);
        $rootScope.$broadcast('setAlertText', 'Response updated');
      },
      function(error) {
        $scope.isSaving = false;
        ErrorHandler.handleError(error, 'updating response');
      }
    );
  }

  $scope.loadBotActionsAndResponses = function(bot_id) {
    $scope.selectedBot = $scope.objectFindByKey($scope.botList, 'bot_id', bot_id);
    $scope.isLoadingActions = true;

    Actions.query({ bot_id: bot_id },
      data => {
        $scope.actionsList = data[0].actions;
        $scope.responseList = data[0].responses;
        $scope.isLoadingActions = false;
      },
      error => {
        $scope.isLoadingActions = false;
        ErrorHandler.handleError(error, 'loading actions and responses');
      }
    );
  }

  $scope.deleteResponse = function(response_id) {
    $scope.isDeleting = true;

    Response.delete({ response_id: response_id },
      data => {
        $scope.isDeleting = false;
        $scope.loadBotActionsAndResponses($scope.selectedBot.bot_id);
      },
      error => {
        $scope.isDeleting = false;
        ErrorHandler.handleError(error, 'deleting response');
      }
    );
  }

  $scope.deleteAction = function(action_id) {
    $scope.isDeleting = true;

    Actions.delete({ action_id: action_id },
      data => {
        $scope.isDeleting = false;
        $scope.loadBotActionsAndResponses($scope.selectedBot.bot_id);
      },
      error => {
        $scope.isDeleting = false;
        ErrorHandler.handleError(error, 'deleting action');
      }
    );
  }
}

angular.module('app').controller('ResponseController', ResponseController);

function ResponseController($rootScope, $scope, $sce, Bot, Response, Actions ) {
  $scope.message = {};
  $scope.message.text = "";
  $scope.bot = {};
  $scope.selectedBot = {};

  $scope.graphData = '';
  $scope.responseTypeList = [{id: "text", type: "text"}, {id: "button", type: "buttons"}];
  $scope.responseList = [];

  Bot.query(function (data) {
    $scope.botList = data;

    if ($scope.$routeParams.bot_id) {
      $scope.selectedBot = $scope.objectFindByKey($scope.botList, 'bot_id', Number($scope.$routeParams.bot_id));
      $scope.bot.bot_id = $scope.selectedBot.bot_id;
      $scope.loadBotActionsAndResponses($scope.selectedBot.bot_id);
    }
  });

  $scope.saveResponse = function(action, action_id) {
    action.new_response.action_id = action_id;
    Response.save(action.new_response).$promise.then(function() {
      $scope.loadBotActionsAndResponses($scope.selectedBot.bot_id);
    });
  }

  $scope.updateResponse = function(response_id, response_type, response_text) {
    Response.update({ response_id: response_id, response_type: response_type, response_text: response_text}).$promise.then(function() {
      $scope.go('/responses/' +  $scope.selectedBot.bot_id);
      $rootScope.$broadcast('setAlertText', 'Response updated');
    });
  }

  $scope.loadBotActionsAndResponses = function(bot_id) {
    $scope.selectedBot = $scope.objectFindByKey($scope.botList, 'bot_id', bot_id);
    Actions.query({bot_id: bot_id }, data => {
      $scope.actionsList = data[0].actions;
      $scope.responseList = data[0].responses;
    });
  }

  $scope.deleteResponse = function(response_id) {
    Response.delete({response_id: response_id }, data => {
      $scope.loadBotActionsAndResponses($scope.selectedBot.bot_id);
    });
  }

  $scope.deleteAction = function(action_id) {
    Actions.delete({action_id: action_id }, data => {
      $scope.loadBotActionsAndResponses($scope.selectedBot.bot_id);
    });
  }
}

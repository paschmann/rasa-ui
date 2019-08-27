angular.module('app').controller('EditBotController', EditBotController);

function EditBotController($scope, Bot, Intents, BotEntities, Actions, BotActions, BotSynonyms, BotRegex, $rootScope) {
  Bot.get({ bot_id: $scope.$routeParams.bot_id }, function(data) {
    $scope.bot = data;
    /* Core feature
    $scope.storiesList = [];
    parseStories(data.story_details);
    */
  });

  Intents.query({ bot_id: $scope.$routeParams.bot_id }, function(data) {
    $scope.intentList = data;
  });

  BotSynonyms.query({ bot_id: $scope.$routeParams.bot_id }, function(data) {
    $scope.synonymsList = data;
  });

  BotRegex.query({ bot_id: $scope.$routeParams.bot_id }, function(data) {
    $scope.regexList = data;
  });

  BotEntities.query({ bot_id: $scope.$routeParams.bot_id }, function(data) {
    $scope.entitiesList = data;
  });

  $scope.editBotInfo = function(bot) {
    Bot.update({ bot_id: bot.bot_id }, bot).$promise.then(function() {
      $rootScope.$broadcast('setAlertText', "Bot information updated Sucessfully!!");
    });
  };

  /* Core feature 
  BotActions.query({ bot_id: $scope.$routeParams.bot_id }, function(data) {
    $scope.actionsList = data;
  });
  */

  function parseStories(story_details) {
    if (angular.isUndefined(story_details) || story_details === null) return;
    const lines = story_details.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      if (currentLine.startsWith('##')) {
        $scope.storiesList.push(currentLine.substring(2, currentLine.length));
      }
    }
  }

  $scope.deleteBot = function() {
    Bot.remove({ bot_id: $scope.$routeParams.bot_id }).$promise.then(
      function() {
        $scope.go('/bots');
      }
    );
  };

  $scope.addAction = function(form, bot) {
    form.bot_id = bot.bot_id;
    Actions.save(form).$promise.then(function() {
      $('#modal-add-actions').modal('hide');
      $scope.form = {};
      BotActions.query({ bot_id: bot.bot_id }, function(data) {
        $scope.actionsList = data;
      });
    });
  };
}

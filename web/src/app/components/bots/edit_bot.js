angular.module('app').controller('EditBotController', EditBotController);

function EditBotController($scope, Bot, Intents, BotEntities, Actions, BotSynonyms, BotRegex, $rootScope, ErrorHandler) {
  $scope.isLoadingBot = true;
  $scope.isLoadingIntents = true;
  $scope.isLoadingSynonyms = true;
  $scope.isLoadingRegex = true;
  $scope.isLoadingEntities = true;
  $scope.isSaving = false;
  $scope.isDeleting = false;

  Bot.get({ bot_id: $scope.$routeParams.bot_id },
    function(data) {
      $scope.bot = data;
      $scope.isLoadingBot = false;
      /* Core feature
      $scope.storiesList = [];
      parseStories(data.story_details);
      */
    },
    function(error) {
      $scope.isLoadingBot = false;
      ErrorHandler.handleError(error, 'loading bot');
    }
  );

  Intents.query({ bot_id: $scope.$routeParams.bot_id },
    function(data) {
      $scope.intentList = data;
      $scope.isLoadingIntents = false;
    },
    function(error) {
      $scope.isLoadingIntents = false;
      ErrorHandler.handleError(error, 'loading intents');
    }
  );

  BotSynonyms.query({ bot_id: $scope.$routeParams.bot_id },
    function(data) {
      $scope.synonymsList = data;
      $scope.isLoadingSynonyms = false;
    },
    function(error) {
      $scope.isLoadingSynonyms = false;
      ErrorHandler.handleError(error, 'loading synonyms');
    }
  );

  BotRegex.query({ bot_id: $scope.$routeParams.bot_id },
    function(data) {
      $scope.regexList = data;
      $scope.isLoadingRegex = false;
    },
    function(error) {
      $scope.isLoadingRegex = false;
      ErrorHandler.handleError(error, 'loading regex patterns');
    }
  );

  BotEntities.query({ bot_id: $scope.$routeParams.bot_id },
    function(data) {
      $scope.entitiesList = data;
      $scope.isLoadingEntities = false;
    },
    function(error) {
      $scope.isLoadingEntities = false;
      ErrorHandler.handleError(error, 'loading entities');
    }
  );

  $scope.editBotInfo = function(bot) {
    $scope.isSaving = true;

    Bot.update({ bot_id: bot.bot_id }, bot).$promise.then(
      function() {
        $scope.isSaving = false;
        $rootScope.$broadcast('setAlertText', "Bot information updated successfully!");
      },
      function(error) {
        $scope.isSaving = false;
        ErrorHandler.handleError(error, 'updating bot');
      }
    );
  };

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
    $scope.isDeleting = true;

    Bot.remove({ bot_id: $scope.$routeParams.bot_id }).$promise.then(
      function() {
        $scope.isDeleting = false;
        $scope.go('/bots');
      },
      function(error) {
        $scope.isDeleting = false;
        ErrorHandler.handleError(error, 'deleting bot');
      }
    );
  };
}

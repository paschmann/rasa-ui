angular.module('app').controller('StoriesController', StoriesController);

function StoriesController($rootScope, $scope, $sce, Bot, Stories, Intents ) {
  $scope.message = {};
  $scope.message.text = "";
  $scope.bot = {};
  $scope.selectedBot = {};
  $scope.searchText = "";

  $scope.graphData = '';

  Bot.query(function (data) {
    $scope.botList = data;

    if ($scope.$routeParams.bot_id) {
      $scope.selectedBot = $scope.objectFindByKey($scope.botList, 'bot_id', Number($scope.$routeParams.bot_id));
      $scope.bot.bot_id = $scope.selectedBot.bot_id;
      $scope.loadBotStories(Number($scope.$routeParams.bot_id));
    }
  });

  $scope.search = function(story) {
    if (story.searchText.length > 3) {
      Stories.query({bot_id: $scope.bot.bot_id, path: "search", search_text: story.searchText}, function (data) {
        story.searchList = data;
      });
    } else {
      story.searchList = [];
    }
  }

  $scope.addToStory = function(item, story) {
    if (item.type == "intent") {
      story.story += "* " + item.text + "\n";
    } else if (item.type == "action") {
      story.story += " - " + item.text + "\n";
    } else if (item.type == "entity") {
      story.story += "{\"" + item.text + "\": \"___________\"}";
    }
  }

  $scope.addStory = function(params) {
    var newStory = {};
    newStory.bot_id = $scope.bot.bot_id
    newStory.story_name = "story_" + Math.floor(Date.now() / 1000);
    newStory.story = "## " + newStory.story_name + "\n";
    
    Stories.save(newStory).$promise.then(function() {
      $scope.loadBotStories(Number($scope.bot.bot_id));
    });
  };

  $scope.deleteStory = function(story_id) {
    Stories.delete({story_id: story_id }, data => {
      $scope.loadBotStories(Number($scope.bot.bot_id));
    });
  }

  $scope.updateStory = function(story_id) {
      var selectedStory = $scope.objectFindByKey($scope.storyList, 'story_id', Number(story_id));
      Stories.update({ story_id: story_id }, selectedStory).$promise.then(function() {
        $rootScope.$broadcast('setAlertText', "Story updated sucessfully");
      });
  }
  
  $scope.loadBotStories = function(bot_id) {
    $scope.selectedBot = $scope.objectFindByKey($scope.botList, 'bot_id', bot_id);
    Stories.query({bot_id: bot_id }, data => {
      $scope.storyList = data;
      //simplemde.value(data.story_details);
    });

    /*
    Intents.query({ bot_id: bot_id}, function (data) {
      $scope.intentList = data;
    });
  
    BotEntities.query({ bot_id: bot_id }, function (data) {
      $scope.entitiesList = data;
    });
  
    BotActions.query({ bot_id: bot_id }, function (data) {
      $scope.actionsList = data;
    });
    */
  }

  /*
  var simplemde = new window.SimpleMDE({
    element: $('#MyID')[0],
    toolbar: [
      {
        name: 'heading2',
        action: window.SimpleMDE.toggleHeading2,
        className: 'fa fa-header',
        title: 'Heading2'
      },
      {
        name: 'unorderedlist',
        action: window.SimpleMDE.toggleUnorderedList,
        className: 'fa fa-list-ul',
        title: 'Generic List'
      },
      '|',
      {
        name: 'preview',
        action: window.SimpleMDE.togglePreview,
        className: 'fa fa-eye no-disable',
        title: 'Toggle Preview'
      },
      //Story Visualization
      /*{
			name: 'flowchart',
			action: function customFunction(editor){
				processDataForVisual(simplemde.value());
			},
			className: 'fa fa-connectdevelop',
			title: 'Visualize (Flowchart view)',
}, '|', */ /*
      {
        name: 'save',
        action: function () {
          const formdata = {};
          formdata.story_details = simplemde.value();
          formdata.bot_id = $scope.bot.bot_id;
          BotStories.save(formdata).$promise.then(function (resp) {
            $rootScope.$broadcast(
              'setAlertText',
              'Stories Added to the Bot Sucessfully!!'
            );
            $scope.go('/bot/' + $scope.$routeParams.bot_id);
          });
        },
        className: 'fa fa-save',
        title: 'Save'
      }
    ]
  });
  */

  

  function processDataForVisual(mdData) {
    const lines = mdData.split('\n');
    const graphArr = [];
    let storyFlow = '';
    let story_line_count = 0;
    for (let i = 0; i < lines.length; i++) {
      const currentLine = lines[i];
      if (currentLine.startsWith('##')) {
        //got a new story.
        //push the old story if there is one.
        if (storyFlow.length > 0) {
          storyFlow = storyFlow.substring(0, storyFlow.lastIndexOf(';') + 1);
          graphArr.push(storyFlow);
          storyFlow = '';
          story_line_count = 0;
        }
        continue;
      } else if (currentLine.startsWith('*')) {
        //story:intent {entities}
        let currentIntent,
          entities = '';
        if (currentLine.indexOf('{') !== -1) {
          //contains entities
          currentIntent = currentLine.substring(2, currentLine.indexOf('{'));
          entities = currentLine.substring(
            currentLine.indexOf('{'),
            currentLine.indexOf('}')
          );
        } else {
          currentIntent = currentLine.substring(2, currentLine.length);
        }
        if (story_line_count !== 0) {
          //first action for the story
          storyFlow = storyFlow + currentIntent + ';';
        }
        storyFlow = storyFlow + currentIntent + '-->';
      } else if (
        currentLine.startsWith('\t-') ||
        currentLine.startsWith('  -')
      ) {
        //story:intent:action
        storyFlow =
          storyFlow +
          currentLine.substring(
            currentLine.indexOf('-') + 2,
            currentLine.length
          ) +
          '((' +
          currentLine.substring(
            currentLine.indexOf('-') + 2,
            currentLine.length
          ) +
          '));';
        storyFlow =
          storyFlow +
          currentLine.substring(
            currentLine.indexOf('-') + 2,
            currentLine.length
          ) +
          '-->';
      }
      story_line_count++;
    }
    //process last story
    storyFlow = storyFlow.substring(0, storyFlow.lastIndexOf(';') + 1);
    graphArr.push(storyFlow);

    $scope.graphData = 'graph TD;' + graphArr.join('');
  }

  /* Remove mermaid.min.js file from assets/libs
  $scope.getGraph = function () {
    if ($scope.graphData.length > 0) {
      setTimeout(function () {
        window.mermaid.init();
      }, 2000);
      return $sce.trustAsHtml($scope.graphData);
    } else {
      return '';
    }
  };
*/

}

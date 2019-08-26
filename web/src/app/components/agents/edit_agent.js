angular.module('app').controller('EditAgentController', EditAgentController);

function EditAgentController($scope, Agent, Intents, AgentEntities, Actions, AgentActions, AgentSynonyms, AgentRegex, $rootScope) {
  Agent.get({ agent_id: $scope.$routeParams.agent_id }, function(data) {
    $scope.agent = data;
    /* Core feature
    $scope.storiesList = [];
    parseStories(data.story_details);
    */
  });

  Intents.query({ agent_id: $scope.$routeParams.agent_id }, function(data) {
    $scope.intentList = data;
  });

  AgentSynonyms.query({ agent_id: $scope.$routeParams.agent_id }, function(data) {
    $scope.synonymsList = data;
  });

  AgentRegex.query({ agent_id: $scope.$routeParams.agent_id }, function(data) {
    $scope.regexList = data;
  });

  AgentEntities.query({ agent_id: $scope.$routeParams.agent_id }, function(data) {
    $scope.entitiesList = data;
  });

  $scope.editAgentInfo = function(agent) {
    Agent.update({ agent_id: agent.agent_id }, agent).$promise.then(function() {
      $rootScope.$broadcast('setAlertText', "Agent information updated Sucessfully!!");
    });
  };

  /* Core feature 
  AgentActions.query({ agent_id: $scope.$routeParams.agent_id }, function(data) {
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

  $scope.deleteAgent = function() {
    Agent.remove({ agent_id: $scope.$routeParams.agent_id }).$promise.then(
      function() {
        $scope.go('/agents');
      }
    );
  };

  $scope.addAction = function(form, agent) {
    form.agent_id = agent.agent_id;
    Actions.save(form).$promise.then(function() {
      $('#modal-add-actions').modal('hide');
      $scope.form = {};
      AgentActions.query({ agent_id: agent.agent_id }, function(data) {
        $scope.actionsList = data;
      });
    });
  };
}

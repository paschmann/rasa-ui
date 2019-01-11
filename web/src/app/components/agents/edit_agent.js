angular.module("app").controller("EditAgentController", EditAgentController);

function EditAgentController(
  $scope,
  Agent,
  Intents,
  AgentEntities,
  Actions,
  AgentActions,
  AgentSynonyms,
  AgentRegex
) {
  Agent.get({ agent_id: $scope.$routeParams.agent_id }, function(data) {
    $scope.agent = data;
    $scope.storiesList = [];
    parseStories(data.story_details);
  });

  Intents.query({ agent_id: $scope.$routeParams.agent_id }, function(data) {
    $scope.intentList = data;
  });

  AgentEntities.query({ agent_id: $scope.$routeParams.agent_id }, function(
    data
  ) {
    $scope.entitiesList = data;
  });

  AgentActions.query({ agent_id: $scope.$routeParams.agent_id }, function(
    data
  ) {
    $scope.actionsList = data;
  });

  AgentSynonyms.query({ agent_id: $scope.$routeParams.agent_id }, function(
    data
  ) {
    $scope.synonymsList = data;
  });

  AgentRegex.query({ agent_id: $scope.$routeParams.agent_id }, function(data) {
    $scope.regexList = data;
  });

  function parseStories(story_details) {
    if (angular.isUndefined(story_details) || story_details === null) return;
    var lines = story_details.split("\n");

    for (var i = 0; i < lines.length; i++) {
      var currentLine = lines[i];
      if (currentLine.startsWith("##")) {
        $scope.storiesList.push(currentLine.substring(2, currentLine.length));
      }
    }
  }

  $scope.deleteAgent = function() {
    Agent.remove({ agent_id: $scope.$routeParams.agent_id }).$promise.then(
      function(resp) {
        $scope.go("/agents");
      }
    );
  };

  $scope.addAction = function(form, agent) {
    form.agent_id = agent.agent_id;
    form.action_name = form.action_name_prefix + form.action_name;
    Actions.save(form).$promise.then(function(resp) {
      $("#modal-add-actions").modal("hide");
      $scope.form = {};
      AgentActions.query({ agent_id: agent.agent_id }, function(data) {
        $scope.actionsList = data;
      });
    });
  };
}

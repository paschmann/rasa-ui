angular.module('app').controller('ModelController', ModelController);

function ModelController($scope, $rootScope, appConfig, Model, Agent, Rasa_Status, $http) {
  $scope.message = "";
  $scope.loading_model = "";
  $scope.agentList = {};
  $scope.agent = {};
  
  checkRasaStatus();

  Agent.query(function (data) {
    $scope.agentList = data;

    if ($scope.$routeParams.agent_id) {
      $scope.selectedAgent = $scope.objectFindByKey($scope.agentList, 'agent_id', Number($scope.$routeParams.agent_id));
      $scope.agent.agent_id = $scope.selectedAgent.agent_id;
      loadAgentModels(Number($scope.$routeParams.agent_id));
    }
  });

  function checkRasaStatus() {
    Rasa_Status.get(function (statusdata) {
      $scope.config = JSON.parse(angular.toJson(statusdata));
    });
  }

  $scope.getData = function (agent_id) {
    if (agent_id) {
      $scope.selectedAgent = $scope.objectFindByKey($scope.agentList, 'agent_id', agent_id);
      loadAgentModels(agent_id);
    }
  }

  function loadAgentModels(agent_id) {
    Model.query({ agent_id: agent_id }, function (data) {
      $scope.modelList = data;
    });
    checkRasaStatus();
  }

  $scope.deleteModel = function (model_id) {
    let model = $scope.objectFindByKey($scope.modelList, 'model_id', model_id);
    Model.remove({ model_id: model_id, local_path: model.local_path }).$promise.then(function () {
      loadAgentModels($scope.selectedAgent.agent_id);
    });
  }

  $scope.loadRasaModel = function (server_model) {
    let agentToTrain = $scope.objectFindByKey($scope.agentList, 'agent_id', $scope.agent.agent_id);
    $scope.loading_model = "Loading model: " + server_model;
    /* TODO: Replace with factory methods */
    $http.put(appConfig.api_endpoint_v2 + "/rasa/model", { "model_file": agentToTrain.output_folder + "/" + server_model }).then(
      function (response) {
        $scope.message = "Loaded model " + server_model;
        loadAgentModels(agentToTrain.agent_id);
        $scope.loading_model = "";
      },
      function (err) {
        $scope.message = "Loading for " + agentToTrain.agent_name + " failed";
        $scope.generateError = JSON.stringify(err);
        $rootScope.trainings_under_this_process = 0;
        $scope.loading_model = "";
      }
    );
  }

  $scope.unloadRasaModel = function (server_model) {
    let agentToTrain = $scope.objectFindByKey($scope.agentList, 'agent_id', $scope.agent.agent_id);
    /* TODO: Replace with factory methods */
    $http.delete(appConfig.api_endpoint_v2 + "/rasa/model").then(
      function (response) {
        $scope.message = "Unloaded model";
        loadAgentModels(agentToTrain.agent_id);
      },
      function (err) {
        $scope.message = "Unloading failed";
        $scope.generateError = JSON.stringify(err);
      }
    );
  }
}
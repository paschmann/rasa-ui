angular.module('app').controller('ModelController', ModelController);

function ModelController($scope, $rootScope, appConfig, Model, Bot, Rasa_Status, $http) {
  $scope.message = {};
  $scope.message.text = "";
  $scope.botList = {};
  $scope.bot = {};
  
  checkRasaStatus();

  Bot.query(function (data) {
    $scope.botList = data;

    if ($scope.$routeParams.bot_id) {
      $scope.selectedBot = $scope.objectFindByKey($scope.botList, 'bot_id', Number($scope.$routeParams.bot_id));
      $scope.bot.bot_id = $scope.selectedBot.bot_id;
      loadBotModels(Number($scope.$routeParams.bot_id));
    }
  });

  function checkRasaStatus() {
    Rasa_Status.get(function (statusdata) {
      $scope.config = JSON.parse(angular.toJson(statusdata));
    });
  }

  $scope.getData = function (bot_id) {
    if (bot_id) {
      $scope.selectedBot = $scope.objectFindByKey($scope.botList, 'bot_id', bot_id);
      loadBotModels(bot_id);
    }
  }

  function loadBotModels(bot_id) {
    Model.query({ bot_id: bot_id }, function (data) {
      data = $scope.cleanResponse(data);
      for (var i = 0; i < data.length; i++) {
        if (data[i].local_path != "Manually added") {
          data[i].server_path = $scope.selectedBot.output_folder + "/" + data[i].server_path
        }
      }
      $scope.modelList = data;
    });
    checkRasaStatus();
  }

  $scope.deleteModel = function (model_id) {
    let model = $scope.objectFindByKey($scope.modelList, 'model_id', model_id);
    Model.remove({ model_id: model_id, local_path: model.local_path }).$promise.then(function () {
      loadBotModels($scope.selectedBot.bot_id);
    });
  }

  $scope.loadRasaModel = function (server_model) {
    let botToTrain = $scope.objectFindByKey($scope.botList, 'bot_id', $scope.bot.bot_id);
    $scope.message = {text: "Loading model: " + server_model, type: "info"};
    /* TODO: Replace with factory methods */
    $http.put(appConfig.api_endpoint_v2 + "/rasa/model", { "model_file": server_model }).then(
      function (response) {
        if (response.data.code && response.data.code == 400) {
          $scope.message = {text: "Error loading model: " +  JSON.stringify(response), type: "danger"};
        } else {
          $scope.message = {text: "Loaded model: " + server_model, type: "success"};
        }
        loadBotModels(botToTrain.bot_id);
      },
      function (err) {
        $scope.message = {text: "Loading for: " +  botToTrain.bot_name + " failed", type: "danger"};
        $rootScope.trainings_under_this_process = 0;
      }
    );
  }

  $scope.unloadRasaModel = function (server_model) {
    let botToTrain = $scope.objectFindByKey($scope.botList, 'bot_id', $scope.bot.bot_id);
    $scope.message = {text: "Unloading model: " + server_model, type: "info"};
    /* TODO: Replace with factory methods */
    $http.delete(appConfig.api_endpoint_v2 + "/rasa/model").then(
      function (response) {
        $scope.message = {text: "Unloaded the model", type: "success"};
        loadBotModels(botToTrain.bot_id);
      },
      function (err) {
        $scope.message = {text: "Unloading the model failed", type: "danger"};
      }
    );
  }
}
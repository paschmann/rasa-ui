angular.module('app').controller('ModelController', ModelController);

function ModelController($scope, $rootScope, appConfig, Model, Bot, Rasa_Status, $http) {
  $scope.message = "";
  $scope.loading_model = "";
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
    $scope.loading_model = "Loading model: " + server_model;
    /* TODO: Replace with factory methods */
    $http.put(appConfig.api_endpoint_v2 + "/rasa/model", { "model_file": botToTrain.output_folder + "/" + server_model }).then(
      function (response) {
        $scope.message = "Loaded model " + server_model;
        loadBotModels(botToTrain.bot_id);
        $scope.loading_model = "";
      },
      function (err) {
        $scope.message = "Loading for " + botToTrain.bot_name + " failed";
        $scope.generateError = JSON.stringify(err);
        $rootScope.trainings_under_this_process = 0;
        $scope.loading_model = "";
      }
    );
  }

  $scope.unloadRasaModel = function (server_model) {
    let botToTrain = $scope.objectFindByKey($scope.botList, 'bot_id', $scope.bot.bot_id);
    /* TODO: Replace with factory methods */
    $http.delete(appConfig.api_endpoint_v2 + "/rasa/model").then(
      function (response) {
        $scope.message = "Unloaded model";
        loadBotModels(botToTrain.bot_id);
      },
      function (err) {
        $scope.message = "Unloading failed";
        $scope.generateError = JSON.stringify(err);
      }
    );
  }
}
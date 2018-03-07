angular
.module('app')
.controller('TrainingController', TrainingController)

function TrainingController($scope, $rootScope, $interval, $http, Rasa_Status, Agent, Intents, Expressions, ExpressionParameters, Rasa_Config, EntitySynonymVariantsByEntity, IntentExpressions) {
  var exportData;
  var statuscheck = $interval(getRasaStatus, 5000);
  $scope.generateError = "";
  $scope.toLowercase = false;
  $scope.message = "";

  getRasaStatus();

  $scope.$on("$destroy", function(){
    $interval.cancel(statuscheck);
  });

  Agent.query(function(data) {
    $scope.agentList = data;
  });

  $scope.train = function() {
    var agentname = objectFindByKey($scope.agentList, 'agent_id', $scope.agent.agent_id).agent_name;
    var id = new XDate().toString('yyyyMMdd-HHmmss');
    reset();
    
    $http.post(api_endpoint_v2 + "/rasa/train?name=" + agentname + "_" + id + "&project=" + agentname, JSON.stringify(exportData)).then(
        function(response){
          $scope.message = "Training for " + agentname + " completed successfully";
        },
        function(errorResponse){
          $scope.generateError = JSON.stringify(errorResponse.data.errorBody);
        }
      );
  }

  $scope.savetofile = function() {
      var data = new Blob([JSON.stringify($scope.exportdata, null, 2)], {type: 'text/plain'});

      var a = document.getElementById("a");
      a.download = "trainingdata.txt";
      a.href = URL.createObjectURL(data);
      a.click();
  }

  $scope.convertToLowerCase = function() {
    $scope.exportdata = JSON.parse(JSON.stringify($scope.exportdata).toLowerCase());
  }

  function reset() {
    $scope.toLowercase = false;
    $scope.generateError = "";
    $scope.message = "";
  }

  $scope.getData = function(agent_id) {
    //Get Intents, Expressions, Parameters/Entities, Synonyms
    var intent_i;
    var expression_i;
    var parameter_i;
    var intents;
    var expressions;
    var params;
    var synonyms;

    reset();
    
    Agent.query({agent_id: agent_id, path: "intents"}, function(intents) {
      var intentIds = intents.map(function(item) { return item['intent_id']; }).toString();
      if (intentIds.length > 0) {
        IntentExpressions.query({intent_ids: intentIds}, function(expressions) {
          var expressionIds = expressions.map(function(item) { return item['expression_id']; }).toString();
          if (expressionIds.length > 0) {
            ExpressionParameters.query({expression_ids: expressionIds}, function(params) {
              var entityIds = params.map(function(item) { return item['entity_id']; }).toString();
              if (entityIds.length > 0) {
                EntitySynonymVariantsByEntity.query({entity_ids: entityIds}, function(synonyms) {
                  generateData(intents, expressions, params, synonyms)
                }, function(error) {
                  $scope.generateError = error;
                  $scope.exportdata = undefined;
                });
              } else {
                generateData(intents, expressions, params);
              }
            }, function(error) {
              $scope.generateError = error;
              $scope.exportdata = undefined;
            });
          } else {
            generateData(intents, expressions);
          }
        }, function(error) {
          $scope.generateError = error;
          $scope.exportdata = undefined;
        });
      } else {
        $scope.generateError = "At least one intent is required to train a model";
        $scope.exportdata = undefined;
      }
    }, function(error) {
      $scope.generateError = error;
      $scope.exportdata = undefined;
    });
  }

  function generateData(intents, expressions, params, synonyms) {
    var tmpData = {};
    var tmpIntent = {};
    var tmpExpression = {};
    var tmpParam = {};
    tmpData.rasa_nlu_data = {}
    tmpData.rasa_nlu_data.common_examples = [];

    for (intent_i = 0; intent_i <= intents.length - 1; intent_i++) {
      var expressionList = expressions.filter(expression => expression.intent_id === intents[intent_i].intent_id);
      if (expressionList !== undefined) {
        for (expression_i = 0; expression_i <= expressionList.length - 1; expression_i++) {
          tmpIntent = {};
          tmpExpression = {};


          tmpIntent.intent = intents[intent_i].intent_name;
          tmpIntent.text = expressionList[expression_i].expression_text;

          tmpIntent.entities = [];
          tmpIntent.expression_id = expressionList[expression_i].expression_id;

          var parameterList = params.filter(param => param.expression_id === expressionList[expression_i].expression_id);
          var entities = [];
          if (parameterList !== undefined) {
            for (parameter_i = 0; parameter_i <= parameterList.length - 1; parameter_i++) {
              tmpParam = {};
              tmpParam.start = parameterList[parameter_i].parameter_start;
              tmpParam.end = parameterList[parameter_i].parameter_end;
              tmpParam.value = parameterList[parameter_i].parameter_value;
              tmpParam.entity = parameterList[parameter_i].entity_name;
              tmpParam.entity_id = parameterList[parameter_i].entity_id;
              tmpIntent.entities.push(tmpParam);

              //Check for common errors
              if (tmpParam.entity === null) {
                $scope.generateError = "Entity is null";
              }

              //Check for synonyms for this entity, and if it exists, lets also clone our current intent and replace the entity with the synonym
              var synonymList = synonyms.filter(synonym => synonym.entity_id === parameterList[parameter_i].entity_id);
              if (synonymList !== undefined) {
                for (synonym_i = 0; synonym_i <= synonymList.length - 1; synonym_i++) {
                  if (synonymList[synonym_i].synonym_reference === tmpParam.value) {
                    var tmpSynonymIntent = {};
                    var tmpSynonym = {};

                    tmpSynonymIntent.intent = tmpIntent.intent;
                    tmpSynonymIntent.text = tmpIntent.text.replace(tmpParam.value, synonymList[synonym_i].synonym_value);
                    tmpSynonymIntent.entities = [];
                    tmpSynonymIntent.expression_id = tmpIntent.expression_id;

                    var start = tmpSynonymIntent.text.indexOf(synonymList[synonym_i].synonym_value);
                    var end = synonymList[synonym_i].synonym_value.length + start;
                    tmpSynonym.start = start;
                    tmpSynonym.end = end;
                    tmpSynonym.value = tmpParam.value;
                    tmpSynonym.entity = tmpParam.entity;
                    tmpSynonym.entity_id = tmpParam.entity_id;

                    tmpSynonymIntent.entities.push(tmpSynonym);
                    tmpData.rasa_nlu_data.common_examples.push(tmpSynonymIntent);
                  }
                }
              }
            }
            tmpData.rasa_nlu_data.common_examples.push(tmpIntent);
          }
        }
      }
    }

    for (var i = 0; i <= tmpData.rasa_nlu_data.common_examples.length - 1; i++) {
      var parameterList = params.filter(param => param.expression_id === tmpData.rasa_nlu_data.common_examples[i].expression_id);
      var entities = [];
      if (tmpData.rasa_nlu_data.common_examples[i].entities.length !== parameterList.length) {
          var missingEntities = parameterList.filter(param => param.entity_id != tmpData.rasa_nlu_data.common_examples[i].entities[0].entity_id);
          for (parameter_i = 0; parameter_i <= missingEntities.length - 1; parameter_i++) {
            tmpParam = {};
            var start = tmpData.rasa_nlu_data.common_examples[i].text.indexOf(missingEntities[parameter_i].parameter_value);
            var end = missingEntities[parameter_i].parameter_value.length + start;
            tmpParam.start = start;
            tmpParam.end = end;
            tmpParam.value = missingEntities[parameter_i].parameter_value;
            tmpParam.entity = missingEntities[parameter_i].entity_name;
            tmpData.rasa_nlu_data.common_examples[i].entities.push(tmpParam);
          }
      }
      delete tmpData.rasa_nlu_data.common_examples[i].expression_id;
    }

    exportData = tmpData;
    $scope.exportdata = tmpData;
    $scope.generateError = "";
  }

  function getRasaStatus() {
    Rasa_Status.get(function(statusdata) {
      Rasa_Config.get(function(configdata) {
        try {
          $rootScope.config = configdata.toJSON();
          $rootScope.config.isonline = 1;
          $rootScope.config.server_model_dirs_array = getAvailableModels(statusdata);
          if ($rootScope.config.server_model_dirs_array.length > 0) {
            $rootScope.modelname = $rootScope.config.server_model_dirs_array[0].name;
          } else {
            $rootScope.modelname = "Default";
          }

          if (statusdata !== undefined || statusdata.available_models !== undefined) {
            $rootScope.available_models = sortArrayByDate(getAvailableModels(statusdata), 'xdate');
            $rootScope.trainings_under_this_process = getNoOfTrainingJobs(statusdata);
          }
        } catch (err) {
          console.log(err);
        }
      });
    });
  }
}

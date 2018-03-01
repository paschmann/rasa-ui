angular
.module('app')
.controller('TrainingController', TrainingController)

function TrainingController($scope, $rootScope, $interval, $http, yaml, Rasa_Status, Agent, Intents, Expressions, ExpressionParameters, Rasa_Config, AgentEntities, AgentActions) {
  var exportData;
  var core_domain_yaml, core_stories_md;
  var statuscheck = $interval(getRasaStatus, 5000);
  $scope.generateError = "";
  $scope.trainings_under_this_process = 0;
  $scope.toLowercase=false;

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
    $http.post(api_endpoint_v2 + "/rasa/train?name=" + agentname + "_" + id +"&project="+agentname, JSON.stringify(exportData)).then(
        function(response){
          // success callback
          $rootScope.$broadcast('setAlertText', "Training for the Agent: " +agentname + " is successfully completed !!");
        },
        function(errorResponse){
          $rootScope.$broadcast('setAlertText', "Error occured while training agent: " +agentname + " Message: "+JSON.stringify(errorResponse.status)+"-"+ JSON.stringify(errorResponse.data.errorBody));
        }
      );
    //Minimize training data
    $scope.exportdata = {};
  }

  $scope.savetofile = function() {
      var data = new Blob([JSON.stringify($scope.exportdata, null, 2)], {type: 'text/plain'});
      var a = document.getElementById("a");
      a.download = "trainingdata.txt";
      a.href = URL.createObjectURL(data);
      a.click();
  }

  $scope.savecoretofiles= function() {
      var data = new Blob([$scope.domain_yml], {type: 'text/plain'});
      var core_domain = document.getElementById("core_domain");
      core_domain.download = "_domain.yml";
      core_domain.href = URL.createObjectURL(data);
      core_domain.click();

      var stories_data = new Blob([$scope.stories_md], {type: 'text/plain'});
      var core_stories = document.getElementById("core_stories");
      core_stories.download = "_stories.md";
      core_stories.href = URL.createObjectURL(stories_data);
      core_stories.click();
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

    $http({method: 'GET', url: api_endpoint_v2 + "/agents/" + agent_id + "/intents"}).
    then(function(data) {
      intents = data.data;
      var intentIds = intents.map(function(item) { return item['intent_id']; }).toString();
      $http({method: 'GET', url: api_endpoint_v2 + "/intent_expressions?intent_ids=" + intentIds }).
      then(function(data) {
        expressions = data.data;
        var expressionIds = expressions.map(function(item) { return item['expression_id']; }).toString();
        $http({method: 'GET', url: api_endpoint_v2 + "/expression_parameters?expression_ids=" + expressionIds}).
        then(function(data) {
          params = data.data;
          var entityIds = params.map(function(item) { return item['entity_id']; }).toString();
          if (entityIds.length > 0) {
            $http({method: 'GET', url: api_endpoint_v2 + '/entity_synonym_variants?entity_ids=' + entityIds}).
            then(function(data) {
              synonyms = data.data;
              generateData(intents, expressions, params, synonyms)
            }, function(error) {
              console.log(error);
            });
          } else {
            generateData(intents, expressions, params);
          }
        }, function(error) {
          console.log(error);
        });
      }, function(error) {
        console.log(error);
      });
    }, function(error) {
      console.log(error);
    });
  }

  function populateCoreDomainYaml(agent_id, intents, expressions, params, synonyms){
    //get entities by agentid
    var domain_yml_obj={};
    $scope.stories_md='';
    Agent.get({agent_id: agent_id}, function(data) {
        $scope.stories_md = data.story_details;
    });

    AgentEntities.query({agent_id: agent_id},function(allEntities) {
        var requiredSlots = allEntities.filter(entity => (entity.slot_data_type != 'NOT_USED' && entity.slot_data_type != '' ));
        if(requiredSlots.length>0){
          //build slots
          var slots_yml_str = requiredSlots.map(function(slot) {
            return "\""+slot['entity_name']+"\":{\"type\":\""+slot['slot_data_type']+"\"}";
          }).join(",");
          domain_yml_obj.slots=JSON.parse("{"+slots_yml_str+"}");
        }

        if(intents.length >0){
          //build intents
          domain_yml_obj.intents =intents.map(function(intent) {
            return intent['intent_name'];
          });
        }

        if(allEntities.length >0){
          //build entities
          domain_yml_obj.entities =allEntities.map(function(entity) {
            return entity['entity_name'];
          });
        }

        AgentActions.query({agent_id: agent_id},function(actionsList) {
            if(actionsList!=null && actionsList.length >0){
              //build actions
              domain_yml_obj.actions =actionsList.map(function(action) {
                return action['action_name'];
              });

              var action_ids = actionsList.map(function(action) {
                return action['action_id'];
              }).toString();

              $http({method: 'GET', url: api_endpoint_v2 + '/action_responses?action_ids=' + action_ids}).
                then(function(data) {
                  if(data.data.length >0){
                    var responsesArrObj ={};
                    data.data.map(function(response) {
                      var response_templete={};
                      if(!responsesArrObj.hasOwnProperty(response.action_name)){
                        responsesArrObj[response.action_name]=[];
                      }
                      //add response text if there is one
                      if(response.response_text!=null && response.response_text !=''){
                        response_templete.text=response.response_text;
                      }
                      //add buttons if there are any
                      if(response.buttons_info !=null && response.buttons_info!=''){
                        response_templete.buttons = response.buttons_info.map(function(button){
                          var buttonObj={};
                          buttonObj.title = button.title;
                          buttonObj.payload= button.payload;
                          return buttonObj;
                        });
                      }
                      //add image if it is available.
                      if(response.response_image_url !=null && response.response_image_url!=''){
                        response_templete.image =response.response_image_url;
                      }
                      responsesArrObj[response.action_name].push(response_templete);
                    });
                    domain_yml_obj.templates = responsesArrObj;
                  }
                  //build templetes
                  try {
                    console.log("YAML: "+JSON.stringify(domain_yml_obj));
                    if(!angular.equals(domain_yml_obj, {}))
                      $scope.domain_yml=yaml.stringify(domain_yml_obj);
                  } catch (e) {
                    console.log(e);
                  }
                }, function(error) {
                  console.log(error);
              });
            }
        });
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
          if($scope.toLowercase){
            tmpIntent.text = expressionList[expression_i].expression_text.toLowerCase();
          }else{
            tmpIntent.text = expressionList[expression_i].expression_text;
          }
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
            //tmpParam.entity_id = missingEntities[parameter_i].entity_id;
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
            $rootScope.trainings_under_this_process = statusdata.trainings_queued;
          }
        } catch (err) {
          console.log(err);
        }
      });
    });
  }
}

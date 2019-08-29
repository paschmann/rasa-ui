angular.module('app').controller('TrainingController', TrainingController);

function TrainingController($scope, $rootScope, $interval, $http, Rasa_Status, Bot, BotRegex, ExpressionParameters, IntentExpressions, BotEntities, BotActions, BotSynonyms, SynonymsVariants, appConfig, Stories, Response, Actions) {
  $scope.generateError = '';
  $scope.message = '';
  $scope.comment = '';

  $scope.raw_data = {}; //this is the formatted data for each compoennt
  $scope.bot_data = {}; //Save all bot details in a data object so we can reuse it in various places

  $scope.bool_force_model_update = false;
  
  Bot.query(function (data) {
    $scope.botList = data;
  });

  $scope.updateData = function() {
    if ($scope.bot_data.stories != "") {
      $scope.raw_data.stories = $scope.bot_data.stories;
    }
    if ($scope.bot_data.domain) {
      $scope.raw_data.domain = $scope.bot_data.domain;
    }
    $scope.raw_data.config = $scope.selectedBot.bot_config;
    $scope.raw_data.out = $scope.selectedBot.output_folder;
    $scope.raw_data.force = $scope.bool_force_model_update ? "true" : "false";

    $scope.stringifyData();
  }

  $scope.stringifyData = function() {
    $scope.raw_data_stringified = JSON.stringify($scope.raw_data);
  }

  $scope.trainUsingRawData = function () {
    let botToTrain = $scope.objectFindByKey($scope.botList, 'bot_id', $scope.bot.bot_id);
    $rootScope.trainings_under_this_process = 1;
    //TODO: Replace with API Factory method
    $http.post(appConfig.api_endpoint_v2 + "/rasa/model/train?bot_name=" + botToTrain.bot_name + "&bot_id=" + botToTrain.bot_id + "&comment=" + $scope.comment, $scope.raw_data_stringified).then(
      function (response) {
        $scope.message = "Training for " + botToTrain.bot_name + " completed successfully, open models to view and load the bots models";
        $rootScope.trainings_under_this_process = 0;
      },
      function (err) {
        $scope.generateError = JSON.stringify(err);
        $rootScope.trainings_under_this_process = 0;
      }
    );
  }

  $scope.saveRawDataToFile = function () {
    let data = new Blob([$scope.raw_data_stringified], {
      type: 'text/plain'
    });
    let a = document.getElementById('a');
    a.download = 'raw_data.json';
    a.href = URL.createObjectURL(data);
    a.click();
  };

  $scope.getCoreData = function() {
    //Need to create domain (slots, entities, intents, templates, actions) and stories
    Stories.query({ bot_id: $scope.selectedBot.bot_id }, function (stories) {
      $scope.bot_data.stories = "";
      for (var i = 0; i < stories.length; i++) {
        if (stories[i].story) {
          $scope.bot_data.stories += stories[i].story;
        }
      }
      Actions.query({ bot_id: $scope.selectedBot.bot_id }, function(data) {
        $scope.bot_data.actions = data[0].actions;
        $scope.bot_data.responses = data[0].responses;
        BotEntities.query({ bot_id: $scope.selectedBot.bot_id }, function(bot_entities) {
          $scope.bot_data.entities = bot_entities;
          $scope.generateCoreData();
        });
      });
    });
  }

  $scope.getData = function (bot_id) {
    $scope.selectedBot = $scope.objectFindByKey($scope.botList, 'bot_id', bot_id);

    reset();

    Bot.query({ bot_id: bot_id, path: 'intents' }, function (intents) {
      //$scope.updateData();
      $scope.bot_data.intents = intents;

      BotRegex.query({ bot_id: bot_id }, function (regex) {
        $scope.bot_data.regex = regex;
        BotSynonyms.query({ bot_id: bot_id }, function (synonyms) {
          synonyms = $scope.cleanResponse(synonyms);
          $scope.bot_data.synonyms = synonyms;
          let intentIds = intents
            .map(function (item) {
              return item['intent_id'];
            })
            .toString();
          if (intentIds.length > 0) {
            IntentExpressions.query({ intent_ids: intentIds }, function (expressions) {
              expressions = $scope.cleanResponse(expressions);
              $scope.bot_data.expressions = expressions;
              let expressionIds = expressions
                .map(function (item) {
                  return item['expression_id'];
                }).toString();
              if (expressionIds.length > 0) {
                ExpressionParameters.query({ expression_ids: expressionIds }, function (params) {
                  $scope.bot_data.parameters = params;
                  let synonymsIds = synonyms.map(function (item) {
                    return item['synonym_id'];
                  });
                  if (synonymsIds.length > 0) {
                    SynonymsVariants.query({ synonyms_id: synonymsIds },
                      function (variants) {
                        $scope.bot_data.variants = variants;
                        variants = $scope.cleanResponse(variants);
                        generateNLUData(regex, intents, expressions, params, synonyms, variants);
                      },
                      function (error) {
                        $scope.generateError = error;
                        $scope.exportdata = undefined;
                      }
                    );
                  } else {
                    generateNLUData(regex, intents, expressions, params);
                  }
                },
                  function (error) {
                    $scope.generateError = error;
                    $scope.exportdata = undefined;
                  }
                );
              } else {
                generateNLUData(regex, intents, expressions);
              }
            },
              function (error) {
                $scope.generateError = error;
                $scope.exportdata = undefined;
              }
            );
          } else {
            $scope.generateError = 'At least one intent is required to train a model';
            $scope.exportdata = undefined;
          }
        });
      });
    },
      function (error) {
        $scope.generateError = error;
        $scope.exportdata = undefined;
      }
    );
  };

  //MD Version
  function generateNLUData(regex, intents, expressions, params, synonyms, variants) {
    let tmpData = "";
    
    //Loop through Intents --> Examples (expressions) --> Entities --> Parameters
    for (let intent_i = 0; intent_i < intents.length; intent_i++) {
      let expressionList = expressions.filter(
        expression => expression.intent_id === intents[intent_i].intent_id
      );
      tmpData += "## intent:" + intents[intent_i].intent_name + "\n"; 
      if (expressionList.length > 0) {
        for (let expression_i = 0; expression_i < expressionList.length; expression_i++) {
          //Add parameters to expression
          var expression = expressionList[expression_i].expression_text;
          let parameterList = params.filter(
            param => param.expression_id === expressionList[expression_i].expression_id
          );
          if (parameterList.length > 0) {
            for (let parameter_i = 0; parameter_i < parameterList.length; parameter_i++) {
              expression = expression.splice(parameterList[parameter_i].parameter_end, 0, "](" + parameterList[parameter_i].entity_name + ")").splice(parameterList[parameter_i].parameter_start, 0, "[");
            }
          }
          tmpData += "- " + expression + "\n";
        }
      }
    }
    tmpData += "\n";

    if (synonyms) {
      for (let synonym_i = 0; synonym_i < synonyms.length; synonym_i++) {
        tmpData += "## synonym:" + synonyms[synonym_i].synonym_reference + "\n";
        for (let synonym_variant_i = 0; synonym_variant_i < variants.length; synonym_variant_i++) {
          //The additional properties of the factory method is causing problems
          if (variants[synonym_variant_i].synonym_id == synonyms[synonym_i].synonym_id) {
            tmpData += "- " + variants[synonym_variant_i].synonym_value + "\n";
          }
        }
      }
      tmpData += "\n";
    }

    if (regex) {
      for (let regex_i = 0; regex_i < regex.length; regex_i++) {
        tmpData += "## regex:" + regex[regex_i].regex_name;
        tmpData += "- " + regex[regex_i].regex_pattern + "\n\n";
      }
    }

    $scope.raw_data.nlu = tmpData;
    $scope.getCoreData();
  }

  //MD Version
  $scope.generateCoreData = function() {
    //Need to create domain (slots, entities, intents, templates, actions) and stories
    let tmpData = "";
    let intents = $scope.bot_data.intents;
    let entities = $scope.bot_data.entities;
    let actions = $scope.bot_data.actions;
    let responses = $scope.bot_data.responses;

    tmpData += "slots:\n"
    for (let entity_i = 0; entity_i < entities.length; entity_i++) {
      if (entities[entity_i].slot_data_type) {
        tmpData += "  " + entities[entity_i].entity_name + ":\n";
        tmpData += "    type: " + entities[entity_i].slot_data_type + "\n";
      }
    }

    tmpData += "\nentities:\n"
    for (let entity_i = 0; entity_i < entities.length; entity_i++) {
      tmpData += "- " + entities[entity_i].entity_name + "\n"; 
    }
    
    tmpData += "\nintents:\n"
    for (let intent_i = 0; intent_i < intents.length; intent_i++) {
      tmpData += "- " + intents[intent_i].intent_name + "\n"; 
    }

    tmpData += "\ntemplates:\n"
    for (let action_i = 0; action_i < actions.length; action_i++) {
      var responses_array = [];
      for (let response_i = 0; response_i < responses.length; response_i++) {
        //if action has responses list it
        if (responses[response_i].action_id == actions[action_i].action_id) {
          responses_array.push(responses[response_i]);
        }
      }
      if (responses_array.length > 0) {
        tmpData += "  " + actions[action_i].action_name + ":\n"; 
        for (let response of responses_array) {
          tmpData += "    - " + response.response_type + ": \"" + response.response_text + "\"\n"; 
        }
      }
    }

    tmpData += "\nactions:\n"
    for (let action_i = 0; action_i < actions.length; action_i++) {
      tmpData += "- " + actions[action_i].action_name + "\n"; 
    }

    $scope.raw_data.domain = tmpData;
    $scope.updateData();
  }

  $scope.savecoretofiles = function () {
    let data = new Blob([$scope.domain_yml], { type: 'text/plain' });
    let core_domain = document.getElementById('core_domain');
    core_domain.download = '_domain.yml';
    core_domain.href = URL.createObjectURL(data);
    core_domain.click();

    let stories_data = new Blob([$scope.stories_md], { type: 'text/plain' });
    let core_stories = document.getElementById('core_stories');
    core_stories.download = '_stories.md';
    core_stories.href = URL.createObjectURL(stories_data);
    core_stories.click();

    var core_credentials_data = new Blob([$scope.credentials_yml], { type: 'text/plain' });
    var core_credentials = document.getElementById("core_credentials");
    core_credentials.download = "credentials.yml";
    core_credentials.href = URL.createObjectURL(core_credentials_data);
    core_credentials.click();

    var endpoints_data = new Blob([$scope.endpoints_yml], { type: 'text/plain' });
    var endpoints = document.getElementById("endpoints_yml");
    endpoints.download = "endpoints.yml";
    endpoints.href = URL.createObjectURL(endpoints_data);
    endpoints.click();
  };

  function reset() {
    $scope.generateError = '';
    $scope.message = '';
  }

  function populateCoreDomainYaml(bot_id, intents) {
    //get entities by botid
    let domain_yml_obj = {};
    var endpoints_yml_obj = {};
    var credentials_yml_obj = { rest: "" };
    var endpoints_yml_obj = {};
    var credentials_yml_obj = { rest: "" };
    $scope.stories_md = '';
    Bot.get({ bot_id: bot_id }, function (data) {
      $scope.stories_md = data.story_details;
      if (data.endpoint_enabled) {
        endpoints_yml_obj.action_endpoint = { "url": data.endpoint_url };
      }
      $scope.credentials_yml = yaml.stringify(credentials_yml_obj);
      $http({ method: 'GET', url: appConfig.api_endpoint_v2 + '/rasa/url' }).then(
        function (response) {
          endpoints_yml_obj.nlu = response.data;
          $scope.endpoints_yml = yaml.stringify(endpoints_yml_obj);
        },
        function (errorResponse) {
          console.log("Error Message while Getting Messages." + errorResponse);
        });
    });

    BotEntities.query({ bot_id: bot_id }, function (allEntities) {
      let requiredSlots = allEntities.filter(
        entity => entity.slot_data_type !== 'NOT_USED' && entity.slot_data_type !== ''
      );
      if (requiredSlots.length > 0) {
        //build slots
        let slots_yml_str = requiredSlots
          .map(function (slot) {
            return (
              '"' +
              slot["entity_name"] +
              '":{"type":"' +
              slot["slot_data_type"] +
              '"}'
            );
          })
          .join(',');
        domain_yml_obj.slots = JSON.parse('{' + slots_yml_str + '}');
      }

      if (intents.length > 0) {
        //build intents
        domain_yml_obj.intents = intents.map(function (intent) {
          return intent['intent_name'];
        });
      }

      if (allEntities.length > 0) {
        //build entities
        domain_yml_obj.entities = allEntities.map(function (entity) {
          return entity['entity_name'];
        });
      }
      domain_yml_obj.action_factory = 'remote';

      BotActions.query({ bot_id: bot_id }, function (actionsList) {
        if (actionsList != null && actionsList.length > 0) {
          //build actions
          domain_yml_obj.actions = actionsList.map(function (action) {
            return action['action_name'];
          });

          let action_ids = actionsList
            .map(function (action) {
              return action['action_id'];
            }).toString();

          $http({ method: 'GET', url: appConfig.api_endpoint_v2 + '/action_responses?action_ids=' + action_ids }).then(
            function (data) {
              if (data.data.length > 0) {
                let responsesArrObj = {};
                data.data.map(function (response) {
                  let response_templete = {};
                  if (!responsesArrObj.hasOwnProperty(response.action_name)) {
                    responsesArrObj[response.action_name] = [];
                  }
                  //add response text if there is one
                  if (response.response_text != null && response.response_text !== '') {
                    response_templete.text = response.response_text;
                  }
                  //add buttons if there are any
                  if (response.buttons_info != null && response.buttons_info !== '') {
                    response_templete.buttons = response.buttons_info.map(
                      function (button) {
                        let buttonObj = {};
                        buttonObj.title = button.title;
                        buttonObj.payload = button.payload;
                        return buttonObj;
                      }
                    );
                  }
                  //add image if it is available.
                  if (response.response_image_url != null && response.response_image_url !== '') {
                    response_templete.image = response.response_image_url;
                  }
                  responsesArrObj[response.action_name].push(response_templete);
                });
                domain_yml_obj.templates = responsesArrObj;
              }
              //build templetes
              try {
                if (!angular.equals(domain_yml_obj, {}))
                  $scope.domain_yml = yaml.stringify(domain_yml_obj);
              } catch (e) { }
            },
            function () { }
          );
        }
      });
    });
  }



  function generateDataToJSON(regex, intents, expressions, params, synonyms, variants) {
    /*
    let tmpData = {};
    let tmpIntent = {};
    let tmpExpression = {};
    let tmpParam = {};
    tmpData.rasa_nlu_data = {};
    tmpData.rasa_nlu_data.common_examples = [];
    if (typeof synonyms !== 'undefined') {
      tmpData.rasa_nlu_data.entity_synonyms = [];
      for (let synonym_i = 0; synonym_i < synonyms.length; synonym_i++) {
        let variants_synonyme = variants
          .filter(function (obj) {
            return obj.synonym_id === synonyms[synonym_i].synonym_id;
          })
          .map(function (obj) {
            return obj.synonym_value;
          });
        if (variants_synonyme.length !== 0) {
          tmpData.rasa_nlu_data.entity_synonyms.push({
            value: synonyms[synonym_i].synonym_reference,
            synonyms: variants_synonyme
          });
        }
      }
    }
    if (regex.length > 0) {
      tmpData.rasa_nlu_data.regex_features = [];
    }

    for (let regex_i = 0; regex_i < regex.length; regex_i++) {
      tmpData.rasa_nlu_data.regex_features.push({
        name: regex[regex_i].regex_name,
        pattern: regex[regex_i].regex_pattern
      });
    }

    for (let intent_i = 0; intent_i <= intents.length - 1; intent_i++) {
      let expressionList = expressions.filter(
        expression => expression.intent_id === intents[intent_i].intent_id
      );
      if (expressionList !== undefined) {
        for (let expression_i = 0; expression_i <= expressionList.length - 1; expression_i++) {
          tmpIntent = {};
          tmpExpression = {};

          tmpIntent.text = expressionList[expression_i].expression_text;
          tmpIntent.intent = intents[intent_i].intent_name;

          tmpIntent.entities = [];
          tmpIntent.expression_id = expressionList[expression_i].expression_id;

          let parameterList = params.filter(
            param =>
              param.expression_id === expressionList[expression_i].expression_id
          );
          if (parameterList !== undefined) {
            for (let parameter_i = 0; parameter_i <= parameterList.length - 1; parameter_i++) {
              tmpParam = {};
              tmpParam.start = parameterList[parameter_i].parameter_start;
              tmpParam.end = parameterList[parameter_i].parameter_end;
              tmpParam.value = parameterList[parameter_i].parameter_value;
              tmpParam.entity = parameterList[parameter_i].entity_name;
              tmpIntent.entities.push(tmpParam);

              //Check for common errors
              if (tmpParam.entity === null) {
                $scope.generateError = 'Entity is null';
              }
            }
            tmpData.rasa_nlu_data.common_examples.push(tmpIntent);
          }
        }
      }
    }

    for (let i = 0; i <= tmpData.rasa_nlu_data.common_examples.length - 1; i++) {
      let parameterList = params.filter(
        param =>
          param.expression_id ===
          tmpData.rasa_nlu_data.common_examples[i].expression_id
      );
      if (tmpData.rasa_nlu_data.common_examples[i].entities.length !== parameterList.length
      ) {
        let missingEntities = parameterList.filter(
          param =>
            param.entity_id !==
            tmpData.rasa_nlu_data.common_examples[i].entities[0].entity_id
        );
        for (let parameter_i = 0; parameter_i <= missingEntities.length - 1; parameter_i++) {
          tmpParam = {};
          let start = tmpData.rasa_nlu_data.common_examples[i].text.indexOf(
            missingEntities[parameter_i].parameter_value
          );
          let end = missingEntities[parameter_i].parameter_value.length + start;
          tmpParam.start = start;
          tmpParam.end = end;
          tmpParam.value = missingEntities[parameter_i].parameter_value;
          tmpParam.entity = missingEntities[parameter_i].entity_name;
          tmpData.rasa_nlu_data.common_examples[i].entities.push(tmpParam);
        }
      }
      delete tmpData.rasa_nlu_data.common_examples[i].expression_id;
    }

    let botToTrain = $scope.objectFindByKey($scope.botList, 'bot_id', $scope.bot.bot_id);

    let dataToPost = {};
    dataToPost.config = botToTrain.bot_config;
    dataToPost.out = botToTrain.output_folder;
    dataToPost.nlu = tmpData;

    $scope.exportdata = tmpData;
    $scope.generateError = '';
    */
  }

}

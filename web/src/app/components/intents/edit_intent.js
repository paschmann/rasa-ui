angular
.module('app')
.controller('EditIntentController', EditIntentController)

function EditIntentController($rootScope, $scope, Agent, Intent, Expressions, Expression, Parameter, Parameters, Entities, UniqueIntentEntities) {
  console.log('Edit Intent controller loaded');

  Agent.query({agent_id: $scope.$routeParams.agent_id}, function(data) {
      $scope.agent = data[0];
  });

  Entities.query( function(data) {
      $scope.entityList = data;
  });

  Intent.query({intent_id: $scope.$routeParams.intent_id}, function(data) {
      $scope.intent = data[0];
  });

  loadExpressions();
  loadUniqueIntentEntities();

  function loadExpressions() {
    Expressions.query({intent_id: $scope.$routeParams.intent_id}, function(data) {
        $scope.expressionList = data;
        loadParameters();
      });
  }

  $scope.runExpression = function(expression_text) {
    $rootScope.$broadcast('executeTestRequest', expression_text);
  }

  $scope.deleteIntent = function() {
    Intent.remove({intent_id: $scope.$routeParams.intent_id}).$promise.then(function(resp) {
      $scope.go('/agent/' + $scope.$routeParams.agent_id);
    });
  };

  function highlight (str, word) {
    str = str.replace(word, '<span style="padding: 3px; background-color: ' + pastelColors() + '">' + word + '</span>');
    return str;
  }

  $scope.toggleArrow = function(expression_id) {
    if ($('#table_expression_' + expression_id).hasClass('show')) {
      $('#icon_expression_' + expression_id).removeClass('icon-arrow-up').addClass('icon-arrow-down')
    } else {
      $('#icon_expression_' + expression_id).removeClass('icon-arrow-down').addClass('icon-arrow-up')
    }
  }

  function loadUniqueIntentEntities() {
    UniqueIntentEntities.query({intent_id: $scope.$routeParams.intent_id},function(data) {
      $scope.intentEntityList = data;
    });
  }

  function loadParameters() {
    Parameters.query({intent_id: $scope.$routeParams.intent_id},function(data) {
        $scope.parameterList = data;
        $scope.parameterFilterList = data;
        //Loop through each parameter and highlight the words it is for
        for (var z = 0; z <= $scope.expressionList.length; z++) {
          if ($scope.expressionList[z] !== undefined) {
            var text = $scope.expressionList[z].expression_text;
            for (var i = 0; i <= data.length - 1; i++) {
              if ($scope.expressionList[z].expression_id === data[i].expression_id) {
                text = highlight(text, data[i].parameter_value);
              }
            }
            $scope.expressionList[z].expression_highlighted_text = text;
          }
        }
      });
  }
  $scope.addParameter = function(expression_id) {
    var selectedText = window.getSelection().toString();
    if (selectedText !== "") {
      var expressionText = $('#expression_' + expression_id).text();
      var newObj = {};
      newObj.expression_id = expression_id;
      newObj.parameter_start = expressionText.indexOf(selectedText);
      newObj.parameter_end = newObj.parameter_start + selectedText.length;
      newObj.parameter_value = selectedText;
      Parameter.save(newObj).$promise.then(function() {
        loadExpressions();
      });

      //Make sure parameter table is open
      $('#table_expression_' + expression_id).addClass("show");
    }
  }

  $scope.deleteParameter = function(parameter_id) {
    Parameter.remove({parameter_id: parameter_id}).$promise.then(function() {
      loadExpressions();
    });
  }

  $scope.addExpression = function() {
    var newObj = {};
    newObj.intent_id = $scope.$routeParams.intent_id;
    newObj.expression_text = this.expression_text;

    Expressions.save(newObj).$promise.then(function() {
      $scope.expression_text = '';
      loadExpressions();
    });
  }

  $scope.updateParameterEntity = function(param_id, entity_id) {
    Parameter.update({parameter_id: param_id}, {parameter_id: param_id, entity_id: entity_id}).$promise.then(function() {
      loadUniqueIntentEntities();
    });
  }

  $scope.deleteExpression = function(expression_id) {
    Expression.remove({expression_id: expression_id}).$promise.then(function() {
      loadExpressions();
    });
  }

}

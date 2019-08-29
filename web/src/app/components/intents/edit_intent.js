angular.module('app').controller('EditIntentController', EditIntentController);

function EditIntentController($rootScope, $scope, Bot, BotEntities, Intent, Expressions, Expression, Parameter, Parameters, Entities, Response, Response) {
  Bot.get({ bot_id: $scope.$routeParams.bot_id }, function (data) {
    $scope.bot = data;
  });

  BotEntities.query({ bot_id: $scope.$routeParams.bot_id }, function (data) {
    $scope.entityList = data;
  });

  Intent.get({ intent_id: $scope.$routeParams.intent_id }, function (data) {
    $scope.intent = data;
  });

  loadExpressions();

  function loadExpressions() {
    Expressions.query({ intent_id: $scope.$routeParams.intent_id }, function (data) {
      $scope.expressionList = data;
      loadExpressionParameters();
    });
  }

  function loadExpressionParameters() {
    Parameters.query({ intent_id: $scope.$routeParams.intent_id }, function (
      data
    ) {
      $scope.parameterList = data;
      $scope.parameterFilterList = data;
      //Loop through each parameter and highlight the words it is for
      for (let z = 0; z <= $scope.expressionList.length; z++) {
        if ($scope.expressionList[z] !== undefined) {
          let text = $scope.expressionList[z].expression_text;
          for (let i = 0; i <= data.length - 1; i++) {
            if (
              $scope.expressionList[z].expression_id === data[i].expression_id
            ) {
              text = highlight(text, data[i].parameter_value);
            }
          }
          $scope.expressionList[z].expression_highlighted_text = text;
        }
      }
    });
  }

  $scope.updateIntentNameAndWebhook = function (intent) {
    Intent.update({ intent_id: intent.intent_id }, intent).$promise.then(
      function () {
        $rootScope.$broadcast(
          'setAlertText',
          'Intent information updated Sucessfully!!'
        );
      }
    );
  };

  $scope.runExpression = function (expression_text) {
    $rootScope.$broadcast('executeTestRequest', expression_text);
  };

  $scope.deleteIntent = function () {
    Intent.remove({ intent_id: $scope.$routeParams.intent_id }).$promise.then(
      function () {
        $scope.go('/bot/' + $scope.$routeParams.bot_id);
      }
    );
  };

  function highlight(str, word) {
    const highlighted = str.replace(
      word,
      '<span style="padding: 3px; background-color: ' +
      $scope.pastelColors() +
      '">' +
      word +
      "</span>"
    );
    return highlighted;
  }

  $scope.toggleArrow = function (expression_id) {
    if ($('#table_expression_' + expression_id).hasClass('show')) {
      $('#icon_expression_' + expression_id)
        .removeClass('icon-arrow-up')
        .addClass('icon-arrow-down');
    } else {
      $('#icon_expression_' + expression_id)
        .removeClass('icon-arrow-down')
        .addClass('icon-arrow-up');
    }
  };


  $scope.addParameter = function (expression_id) {
    const selectedText = window.getSelection().toString();
    if (selectedText !== '') {
      const expressionText = $('#expression_' + expression_id).text();
      const newObj = {};
      newObj.expression_id = expression_id;
      newObj.parameter_start = expressionText.indexOf(selectedText);
      newObj.parameter_end = newObj.parameter_start + selectedText.length;
      newObj.parameter_value = selectedText;
      newObj.intent_id = Number($scope.$routeParams.intent_id);
      Parameter.save(newObj).$promise.then(function () {
        loadExpressions();
      });

      //Make sure parameter table is open
      $('#table_expression_' + expression_id).addClass('show');
    }
  };

  $scope.deleteParameter = function (parameter_id) {
    Parameter.remove({ parameter_id: parameter_id }).$promise.then(function () {
      loadExpressions();
    });
  };

  $scope.addExpression = function () {
    const newObj = {};
    newObj.intent_id = $scope.$routeParams.intent_id;
    newObj.expression_text = this.expression_text;

    Expression.save(newObj).$promise.then(function () {
      $scope.expression_text = '';
      loadExpressions();
    });
  };

  $scope.updateParameterEntity = function (param_id, entity_id) {
    Parameter.update(
      { parameter_id: param_id },
      { parameter_id: param_id, entity_id: entity_id }
    ).$promise.then(function () {
      //loadUniqueIntentEntities();
      //loadExpressions();
    });
  };

  $scope.deleteExpression = function (expression_id) {
    Expression.remove({ expression_id: expression_id }).$promise.then(
      function () {
        loadExpressions();
      }
    );
  };
}

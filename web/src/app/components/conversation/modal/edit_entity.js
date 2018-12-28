angular
  .module("app")
  .controller("EditEntityModalController", EditEntityModalController);

function EditEntityModalController(
  $scope,
  close,
  entity,
  agent,
  entitiesList,
  Expression,
  Parameter
) {
  $scope.entity = entity.selectedText;
  $scope.message = entity.messageText;
  $scope.entitiesList = entitiesList;
  $scope.selectedEntity;

  $scope.close = function(result) {
    if (result) {
      $scope.addExpression().then(function(data) {
        console.log("Expression.save", data);
        $scope.addParameter(data.expression_id).then(result => {
          close(result, 500);
        });
      });
    } else {
      close(result, 500);
    }
  };

  $scope.addExpression = function() {
    var expression = {};
    // todo get intent id
    expression.intent_id = 4;
    expression.expression_text = $scope.message;
    return Expression.save(expression).$promise;
  };

  $scope.addParameter = function(expression_id) {
    var selectedText = $scope.entity;
    if (selectedText !== "") {
      var expressionText = $scope.message;
      var newObj = {};
      newObj.expression_id = expression_id;
      newObj.entity_id = $scope.selectedEntity.entity_id;
      newObj.parameter_start = expressionText.indexOf(selectedText);
      newObj.parameter_end = newObj.parameter_start + selectedText.length;
      newObj.parameter_value = selectedText;
      return Parameter.save(newObj).$promise;
    }
  };

  //   $scope.deleteParameter = function(parameter_id) {
  //     Parameter.remove({parameter_id: parameter_id}).$promise.then(function() {
  //       loadExpressions();
  //     });
  //   }

  $scope.selectEntity = function(entity) {
    $scope.selectedEntity = entity;
  };

  $scope.isEntitySelected = function(entity) {
    return $scope.selectedEntity === entity;
  };
}

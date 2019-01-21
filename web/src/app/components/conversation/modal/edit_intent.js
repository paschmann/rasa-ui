angular
  .module("app")
  .controller("EditIntentModalController", EditIntentModalController);

function EditIntentModalController(
  $scope,
  close,
  message,
  intentList,
  Expression,
  $http
) {
  $scope.message = message;
  $scope.intentList = intentList;
  $scope.selectedIntent;

  console.log("message", message);

  if ($scope.message.intent_id) {
    $scope.selectedIntent = $scope.intentList.find(function(intent) {
      return intent.intent_id === $scope.message.intent_id;
    });
  }

  $scope.close = function(result) {
    if (
      $scope.message.messages_id &&
      $scope.selectedIntent &&
      $scope.selectedIntent.intent_id &&
      result
    ) {
      $http
        .put(
          api_endpoint_v2 + `/messages/${$scope.message.messages_id}`,
          JSON.stringify({
            intent_id: $scope.selectedIntent.intent_id
          })
        )
        .then(
          function() {
            if ($scope.message.expression_id === null) {
              $scope.addExpression().then(function() {
                close($scope.selectedIntent, 500);
              });
            } else {
              Expression.update(
                { expression_id: $scope.message.expression_id },
                {
                  expression_id: $scope.message.expression_id,
                  expression_text: $scope.message.message_text,
                  intent_id: $scope.selectedIntent.intent_id
                }
              ).$promise.then(() => {
                close($scope.selectedIntent, 500);
              });
            }
          },
          function() {}
        );
    } else {
      close({}, 500);
    }
  };

  $scope.addExpression = function() {
    var expression = {};
    expression.intent_id = $scope.selectedIntent.intent_id;
    expression.expression_text = $scope.message.message_text;
    return Expression.save(expression).$promise;
  };
  // $scope.editExpression = function(expression_id) {
  //   var expression = {};
  //   expression.intent_id = $scope.selectedIntent.intent_id;
  //   expression.expression_text = $scope.message.message_text;
  //   return Expression.update({expression_id}, {expression_id, intent_id: intent_id}).$promise;
  // };

  $scope.selectIntent = function(intent) {
    $scope.selectedIntent = intent;
  };
  $scope.isIntentSelected = function(intent) {
    return $scope.selectedIntent === intent;
  };
}

angular
  .module("app")
  .controller("EditIntentModalController", EditIntentModalController);

function EditIntentModalController(
  $scope,
  close,
  message,
  agent,
  intentList,
  Expression,
  $http
) {
  $scope.message = message;
  $scope.intentList = intentList;
  $scope.selectedIntent;

  if ($scope.message.intent_id) {
    $scope.selectedIntent = $scope.intentList.find(function(intent) {
      return intent.intent_id === $scope.message.intent_id;
    });
  }

  $scope.close = function() {
    if (
      $scope.message.messages_id &&
      $scope.selectedIntent &&
      $scope.selectedIntent.intent_id
    ) {
      $http
        .put(
          api_endpoint_v2 + `/messages/${$scope.message.messages_id}`,
          JSON.stringify({
            intent_id: $scope.selectedIntent.intent_id
          })
        )
        .then(
          function(result) {
            if ($scope.message.expression_id === null) {
              $scope.addExpression().then(function(expression) {
                close($scope.selectedIntent, 500);
              });
            } else {
              close($scope.selectedIntent, 500);
            }
          },
          function(errorResponse) {}
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

  $scope.selectIntent = function(intent) {
    $scope.selectedIntent = intent;
  };
  $scope.isIntentSelected = function(intent) {
    return $scope.selectedIntent === intent;
  };
}

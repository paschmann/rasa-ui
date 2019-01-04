angular
  .module("app")
  .controller("EditEntityModalController", EditEntityModalController);

function EditEntityModalController(
  $scope,
  close,
  entity,
  selectedText,
  message,
  entitiesList,
  $http,
  Parameter,
  Expression
) {
  $scope.entity = entity;
  $scope.selectedText = selectedText;
  $scope.message = message;
  $scope.entitiesList = entitiesList;
  $scope.selectedEntity;
  $scope.newEntity = false;

  if (!$scope.entity) {
    $scope.newEntity = true;
  } else if ($scope.entity.entity_id) {
    $scope.selectedEntity = $scope.entitiesList.find(function(entity) {
      return entity.entity_id === $scope.entity.entity_id;
    });
  }

  $scope.close = async function(result) {
    if (result) {
      if (!$scope.message.expression_id) {
        var expression = {};
        if ($scope.message.intent_id) {
          expression.intent_id = $scope.message.intent_id;
        }
        expression.expression_text = $scope.message.message_text;
        const expressionId = await Expression.save(expression).$promise;
        $scope.message.expression_id = expressionId.expression_id;
      }

      if ($scope.newEntity) {
        addParameter(
          $scope.message,
          $scope.selectedText,
          $scope.selectedEntity.entity_id
        ).then(() => {
          addMessageEntity($scope.entity).then(result => {
            close(result, 500);
          });
          close(result, 500);
        });
      } else {
        editMessageEntity($scope.entity).then(result => {
          addParameter(
            $scope.message,
            $scope.entity.parameter_value,
            $scope.selectedEntity.entity_id,
            $scope.entity.parameter_id
          ).then(() => {
            close(result, 500);
          });
        });
      }
    } else {
      close(result, 500);
    }
  };

  function addMessageEntity() {
    let entity = {};
    entity.entity_id = $scope.selectedEntity.entity_id;
    entity.entity_value = $scope.selectedText;
    entity.entity_start = $scope.message.message_text.indexOf(
      $scope.selectedText
    );
    entity.entity_end = entity.entity_start + $scope.selectedText.length;
    entity.message_id = $scope.message.messages_id;
    return $http.post(
      `${api_endpoint_v2}/messages/${entity.message_id}/entities`,
      entity,
      { headers: { "Content-Type": "application/json;charset=utf-8" } }
    );
  }
  function editMessageEntity(entity) {
    const oldEntityId = $scope.entity.entity_id;
    $scope.entity.entity_id = $scope.selectedEntity.entity_id;
    $scope.entity.entity_name = $scope.selectedEntity.entity_name;
    return $http.put(
      `${api_endpoint_v2}/messages/${
        entity.messages_id
      }/entities/${oldEntityId}`,
      entity,
      { headers: { "Content-Type": "application/json;charset=utf-8" } }
    );
  }

  function addParameter(message, parameter_value, entity_id, parameter_id) {
    if (parameter_value !== "") {
      var parameter = {};
      parameter.expression_id = message.expression_id;
      parameter.parameter_start = message.message_text.indexOf(parameter_value);
      parameter.parameter_end =
        parameter.parameter_start + parameter_value.length;
      parameter.parameter_value = parameter_value;
      parameter.entity_id = entity_id;
      if (message.expression_id && parameter_id) {
        return Parameter.update({ parameter_id }, parameter).$promise;
      } else {
        return Parameter.save(parameter).$promise;
      }
    }
  }

  $scope.selectEntity = function(entity) {
    $scope.selectedEntity = entity;
  };

  $scope.isEntitySelected = function(entity) {
    return $scope.selectedEntity === entity;
  };
}

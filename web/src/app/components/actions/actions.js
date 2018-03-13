angular
.module('app')
.controller('ActionsController', ActionsController)

function ActionsController($rootScope,$scope, $http,Actions, Response, ActionResponses,Agent) {
  Agent.get({agent_id: $scope.$routeParams.agent_id}, function(data) {
      $scope.agent = data;
  });
    $scope.readonly = true;
    $scope.buttonsArray=[];
    Actions.get({action_id: $scope.$routeParams.action_id}, function(data) {
        $scope.action = data;
    });
    loadActionResponses($scope.$routeParams.action_id);

    $scope.saveActionResponse= function(actionResponse) {
      if(actionResponse.response_text =='')return;
      if($scope.buttonsArray.length >0){
        actionResponse.buttons_info=JSON.stringify($scope.buttonsArray);
      }else{
        actionResponse.buttons_info=null;
      }
      if(actionResponse.response_image_url=null){
        actionResponse.response_image_url='';
      }
      actionResponse.response_type=1;
      ActionResponses.save(actionResponse).$promise.then(function() {
        $rootScope.$broadcast('setAlertText', "Response Added Sucessfully!!");
        actionResponse.response_text,actionResponse.button_text,actionResponse.response_image_url='';
        loadActionResponses(actionResponse.action_id);
      });
    };

      $scope.deleteActionResponse = function(response_id,action_id) {
        Response.remove({response_id: response_id}).$promise.then(function(resp) {
          loadActionResponses(action_id);
        });
      }

      $scope.addButton = function(action){
        if(action.button_text.indexOf(':') ==-1 )return;
        var seq =$scope.buttonsArray.length;
        $scope.buttonsArray.push({"seq":seq,"title":action.button_text.split(":")[0], "payload":action.button_text.split(":")[1]});
        action.button_text='';
      }
      function loadActionResponses(action_id){
        ActionResponses.query({action_id: action_id},function(data){
          $scope.responses=data;
        });
      }
      $scope.actionNameEdit= function(action) {
        if($scope.readonly){
          $scope.readonly =false;
          $scope.mstr_action_name = $scope.action.action_name;
          return;
        }else{
          $scope.readonly = true;
          if($scope.action.action_name != $scope.mstr_action_name){
            Actions.update({ action_id:action.action_id }, action).$promise.then(function() {
              $rootScope.$broadcast('setAlertText', "Action information updated Sucessfully!!");
              loadAgentActions(action.agent_id);
            });
          }
        }
      };

      $scope.deleteAction= function(){
        Actions.remove({action_id: $scope.$routeParams.action_id}).$promise.then(function(resp) {
          loadAgentActions(action.agent_id);
          $scope.go('/agent/' + $scope.$routeParams.agent_id);
        });
      }
      function loadAgentActions(agent_id){
        AgentActions.query({agent_id: agent_id},function(data) {
            $scope.actionsList = data;
        });
      }
}

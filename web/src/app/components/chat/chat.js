angular.module('app').controller('ChatController', ChatController);

function ChatController($scope, $rootScope, $interval, $http, Rasa_Version, Settings, Rasa_Status, appConfig, Rasa_Parse) {
  $scope.test_text = 'I want italian food in new york';
  $scope.test_text_response = {};
  $rootScope.config = {}; //Initilize in case server is not online at startup
  let configcheck;

  /* TODO: Currently do not have support for conversations in v3, coming soon.
  $scope.restartConversation = function() {
    $scope.test_text_response = {};
    $http.post(appConfig.api_endpoint_v2 + '/rasa/restart');
    $scope.response_text = [];
    $scope.test_text_response = {};
    $scope.test_text = '';
    $rootScope.$broadcast('setAlertText', 'Conversation restarted!!');
  };
  */

  function addOverlay() {
    $('.aside-menu').addClass('dimmed');
  }

  function removeOverlay() {
    $('.aside-menu').removeClass('dimmed');
  }

  $scope.executeTestRequest = function () {
    $scope.response_text = [];
    $scope.test_text_response = {};
    let reqMessage = {};

    reqMessage = { text: $scope.test_text };

    //TODO: We should use a factory method for this
    if ($scope.test_text) {
      //make a httpcall
      addOverlay();
      $http.post(appConfig.api_endpoint_v2 + '/rasa/model/parse', JSON.stringify(reqMessage)).then(function (response) {
        // success callback
        removeOverlay();
        $scope.test_text_response = response.data;
        if (!$scope.wsEnabled) {
          if ($scope.test_text_response > 0) {
            $scope.test_text_response.forEach(function (response) {
              $scope.response_text.push(response.response_text);
            });
          }
        }
      },
        function (errorResponse) {
          removeOverlay();
        }
      );
    }
  };
}

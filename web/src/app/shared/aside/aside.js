angular.module('app').controller('AsideController', AsideController);

function AsideController($scope, $rootScope, $http, appConfig) {
  $scope.test_text = '';
  $scope.test_text_response = {};
  $rootScope.config = {}; //Initilize in case server is not online at startup
  let configcheck;

  $scope.$on('executeTestRequest', function (event, expression_text) {
    $scope.test_text = expression_text;
    $scope.executeTestRequest();
  });

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

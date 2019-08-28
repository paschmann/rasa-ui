angular
.module('app')
.controller('BotsController', BotsController);

function BotsController($scope, $rootScope, Bot,$http,appConfig,$window) {
  Bot.query(function(data) {
      $scope.botList = data; 
  });
}

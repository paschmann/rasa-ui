var api_endpoint_v2 = '/api/v2'; //rasa UI API = location of Nodejs server.js script running, edit this if the nodejs web front end is not running on the server instance

var app =angular.module('app', ['ngFileUpload', 'angularUtils.directives.dirPagination','ngRoute', 'chart.js', 'ngResource', 'ngStorage', 'ngTagsInput', 'jsonFormatter'])
.config(function config() {
  function success(response) {
    return response;
  }
  function error(response) {
    var status = response.status;
    if (status == 401) {
      //AuthFactory.clearUser();
      //window.location = "/account/login?redirectUrl=" + Base64.encode(document.URL);
      //$rootScope.$broadcast("INVALID_JWT_TOKEN");
      return;
    }
    // otherwise
    return $q.reject(response);
  }
  return function(promise) {
    return promise.then(success, error);
  }
})
.run(function run($rootScope, $http, $sessionStorage) {
  // keep user logged in after page refresh
  if ($sessionStorage.jwt) {
    $rootScope.authenticated = true;
    $http.defaults.headers.common.Authorization = 'Bearer ' + $sessionStorage.jwt;
  }else{
    //show login page
    $rootScope.authenticated = false;
    $rootScope.$broadcast("INVALID_JWT_TOKEN");
  }
  $rootScope.$on('USER_AUTHENTICATED', function(event) {
    $rootScope.authenticated = true;
    $http.defaults.headers.common.Authorization = 'Bearer ' + $sessionStorage.jwt;
  });

   $rootScope.$on('INVALID_JWT_TOKEN', function(event) {
    $rootScope.authenticated = false;
    $sessionStorage.$reset();
   });
});

angular.module('app').controller('appCtrl', function($rootScope,$scope, $route, $routeParams, $location,$timeout,$http,$sessionStorage) {
     $scope.$route = $route;
     $scope.$location = $location;
     $scope.$routeParams = $routeParams;

     $scope.go = function ( path ) {
       $location.path( path );
     };

     $scope.formData = {};

     $scope.$on('setAlertText', function(event, alert_text) {
       $('#alertTextDiv').addClass('show');
       $scope.alert_text = alert_text;
       $timeout(function(){$('#alertTextDiv').removeClass('show')}, 10000);
     });

     $scope.loginUser = function(user){
       $http.post(api_endpoint_v2 + "/auth", JSON.stringify(user))
         .then(
           function(response){
             // success callback
             $sessionStorage.jwt = response.data.token;
             $rootScope.$broadcast("USER_AUTHENTICATED");
           },
           function(errorResponse){
             // failure callback
             $('#alertTextDiv').addClass('show');
             $scope.alert_text = "Invalid Username and Password. Please try again.";
             $timeout(function(){$('#alertTextDiv').removeClass('show')}, 10000);
           }
         );
     }
});

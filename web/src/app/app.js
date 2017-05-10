var api_endpoint = 'http://10.211.55.3:4000'; //postgrest server
var rasa_api_endpoint = 'http://localhost:5001/api'; //rasa NLU API
var configModels = [];

var app = angular.module('app', ['ngRoute', 'chart.js', 'ngResource', 'ngTagsInput', 'jsonFormatter'])

.controller('app', function($scope, $route, $routeParams, $location) {
     $scope.$route = $route;
     $scope.$location = $location;
     $scope.$routeParams = $routeParams;

     $scope.go = function ( path ) {
       $location.path( path );
     };

     $scope.formData = {};
})

angular
.module('app')
.controller('MiddlewareController', MiddlewareController)

function MiddlewareController($scope) {
  console.log($scope);
}

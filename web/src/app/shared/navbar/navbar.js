angular
.module('app')
.controller('NavBarController', NavBarController)

function NavBarController($scope, $rootScope) {
  console.log("navbar controller loaded");
  $scope.toggleAside = function () {
    if (angular.element('body').hasClass('aside-menu-hidden')) {
      angular.element('body').removeClass('aside-menu-hidden').addClass('aside-menu-fixed');
    } else {
      angular.element('body').removeClass('aside-menu-fixed').addClass('aside-menu-hidden');
    }
  }

}

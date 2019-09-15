angular.module('app')
  .directive('a', navigationDirective)
  .directive('confirmClick', confirmClickDirective)
  .directive('a', navigationDirective)
  .directive('button', layoutToggleDirective)
  .directive('button', collapseMenuTogglerDirective)
  .directive('scrollBottom', function () {
    return {
      link: function (scope, element) {
        scope.$watch(function () {
          element.scrollTop(element[0].scrollHeight);
        });
      }
    }
  })
  .directive('tooltip', function () {
    return {
      restrict: 'A',
      link: function (scope, element) {
        element.hover(
          function () {
            element.tooltip('show');
          },
          function () {
            element.tooltip('hide');
          }
        );
        element.click(
          function () {
            element.tooltip('hide');
          }
        );
      }
    };
  }).filter('trusted',
    function ($sce) {
      return function (ss) {
        return $sce.trustAsHtml(ss)
      };
    }
  ).filter('chatDate', function($filter) {    
    var angularDateFilter = $filter('date');
    return function(theDate) {
      const today = new Date();
      const filterDate = new Date(theDate);
      if (filterDate.setHours(0,0,0,0) == today.setHours(0,0,0,0)) {
        return angularDateFilter(theDate, 'HH:mm:ss');
      } else {
        return angularDateFilter(theDate, 'MM/dd/yyyy h:mm:ss a');
      }
    }
  });;

function confirmClickDirective() {
  let i = 0;
  return {
    restrict: 'A',
    priority: 1,
    compile: function (tElem, tAttrs) {
      const fn = '$$confirmClick' + i++,
        _ngClick = tAttrs.ngClick;
      tAttrs.ngClick = fn + '($event)';

      return function (scope, elem, attrs) {
        const confirmTitle = attrs.confirmClickTitle || 'Please confirm';
        const confirmMsg = attrs.confirmClick || 'Are you sure?';

        scope[fn] = function (event) {
          $('#modal_confirm').modal('show');
          $('#modal_body').text(confirmMsg);
          $('#modal_title').text(confirmTitle);
          $('#modal_confirm').one('click', '#modal_save_btn', function (e) {
            scope.$eval(_ngClick, { $event: event });
            try {
              $('#modal_confirm').modal('hide');
            } catch (err) {
              // Bug in bootstrap 4 with hiding = transition error
            }
          });
        };
      };
    }
  };
}

function navigationDirective() {
  return {
    restrict: 'E',
    link
  };

  function link(scope, element, attrs) {
    if (element.hasClass('nav-dropdown-toggle') && angular.element('body').width() > 782) {
      element.on('click', function () {
        if (!angular.element('body').hasClass('compact-nav')) {
          element.parent().toggleClass('open').find('.open').removeClass('open');
        }
      });
    } else if (element.hasClass('nav-dropdown-toggle') && angular.element('body').width() < 783) {
      element.on('click', function () {
        element.parent().toggleClass('open').find('.open').removeClass('open');
      });
    }
  }
}

//Dynamic resize .sidebar-nav
sidebarNavDynamicResizeDirective.$inject = ['$window', '$timeout'];
function sidebarNavDynamicResizeDirective($window, $timeout) {
  return {
    restrict: 'E',
    link
  };

  function link(scope, element, attrs) {

    if (element.hasClass('sidebar-nav') && angular.element('body').hasClass('fixed-nav')) {
      const bodyHeight = angular.element(window).height();
      scope.$watch(function () {
        const headerHeight = angular.element('header').outerHeight();

        if (angular.element('body').hasClass('sidebar-off-canvas')) {
          element.css('height', bodyHeight);
        } else {
          element.css('height', bodyHeight - headerHeight);
        }
      });

      angular.element($window).bind('resize', function () {
        const bodyHeight = angular.element(window).height();
        const headerHeight = angular.element('header').outerHeight();
        const sidebarHeaderHeight = angular.element('.sidebar-header').outerHeight();
        const sidebarFooterHeight = angular.element('.sidebar-footer').outerHeight();

        if (angular.element('body').hasClass('sidebar-off-canvas')) {
          element.css('height', bodyHeight - sidebarHeaderHeight - sidebarFooterHeight);
        } else {
          element.css('height', bodyHeight - headerHeight - sidebarHeaderHeight - sidebarFooterHeight);
        }
      });
    }
  }
}

//LayoutToggle
layoutToggleDirective.$inject = ['$interval'];
function layoutToggleDirective($interval) {
  return {
    restrict: 'E',
    link
  };

  function link(scope, element, attrs) {
    element.on('click', function () {

      if (element.hasClass('sidebar-toggler')) {
        angular.element('body').toggleClass('sidebar-hidden');
      }

      if (element.hasClass('aside-menu-toggler')) {
        angular.element('body').toggleClass('aside-menu-hidden');
      }
    });
  }
}

//Collapse menu toggler
function collapseMenuTogglerDirective() {
  return {
    restrict: 'E',
    link
  };

  function link(scope, element, attrs) {
    element.on('click', function () {
      if (element.hasClass('navbar-toggler') && !element.hasClass('layout-toggler')) {
        angular.element('body').toggleClass('sidebar-mobile-show')
      }
    })
  }
}

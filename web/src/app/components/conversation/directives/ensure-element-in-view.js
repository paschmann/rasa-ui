angular.module("app").directive("ensureElementInView", [
  function() {
    return {
      restrict: "A",
      scope: {
        elementId: "@elementId",
        containerId: "@containerId"
      },
      link: function(scope, element, attrs) {
        function ensureElementInView(element, container) {
          let cTop = container.scrollTop;
          let cBottom = cTop + container.clientHeight;

          //Get element properties
          let eTop = element.offsetTop;
          let eBottom = eTop + element.clientHeight;

          //Check if in view
          let isInView = eTop >= cTop && eBottom <= cBottom;

          if (!isInView) {
            scrollElementToView(container, element);
          }
        }

        function scrollElementToView(container, element) {
          let cTop = container.scrollTop;
          let cBottom = cTop + container.clientHeight;

          let eTop = element.offsetTop;
          let eBottom = eTop + element.clientHeight;
          //Check if out of view
          if (eTop < cTop) {
            container.scrollTop -= cTop - eTop;
          } else if (eBottom > cBottom) {
            container.scrollTop += eBottom - cBottom + 50;
          }
        }

        element[0].addEventListener("mouseover", function() {
          const element = document.getElementById(scope.elementId);
          const container = document.getElementById(scope.containerId);
          ensureElementInView(element, container);
          element.classList.add("active");
        });
        element[0].addEventListener("mouseout", function() {
          const element = document.getElementById(scope.elementId);
          element.classList.remove("active");
        });
      }
    };
  }
]);

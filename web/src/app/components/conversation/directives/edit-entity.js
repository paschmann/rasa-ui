angular.module("app").directive("editEntity", [
  function() {
    return {
      restrict: "A",
      link: function(scope, element) {
        const entityEditElem = document.getElementById("entityEdit");
        const entityEditElemHeight = entityEditElem.offsetHeight;
        const entity = element[0];
        entity.addEventListener("click", function() {
          entityRect = entity.getBoundingClientRect();
          entityEditElem.style.top =
            entity.offsetTop - entityEditElemHeight + "px";
          entityEditElem.style.left =
            entity.offsetLeft +
            entityRect.width / 2 -
            entityEditElem.offsetWidth / 2 +
            "px";
          entityEditElem.style.visibility = "visible";
        });
      }
    };
  }
]);

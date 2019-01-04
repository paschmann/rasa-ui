angular.module("app").directive("selection", [
  "$rootScope",
  function($rootScope) {
    return {
      restrict: "A",
      link: function(scope, element) {
        entityAddElem = element[0];

        document.addEventListener("selectionchange", function(event) {
          const entityAddElemHeight = entityAddElem.offsetHeight;

          const selection = window.getSelection();

          if (
            selection.baseNode &&
            selection.baseNode.parentElement.parentElement.classList.contains(
              "message"
            )
          ) {
            selectionRange = selection.getRangeAt(0); //get the text range
            selectionRect = selectionRange.getBoundingClientRect();

            entityAddElem.style.top =
              selectionRect.top - entityAddElemHeight + "px";
            entityAddElem.style.left =
              selectionRect.left +
              selectionRect.width / 2 -
              entityAddElem.offsetWidth / 2 +
              "px";
            var selectedText = selection.toString();
            entityAddElem.style.visibility =
              selectedText.length > 0 ? "visible" : "hidden";

            $rootScope.$broadcast("entitySelected", {
              selectedText,
              messageId: selection.baseNode.parentElement.parentElement.id
            });
          } else {
            entityAddElem.style.visibility = "hidden";
          }
        });

        document
          .querySelector("#chatlog")
          .addEventListener("scroll", function() {
            if (entityAddElem.style.visibility === "visible") {
              entityAddElem.style.visibility = "hidden";
            }
          });

        const entityEditElem = document.getElementById("entityEdit");
        document.addEventListener("click", function(event) {
          if (
            event.target !== entityEditElem &&
            !event.target.classList.contains("entity")
          ) {
            entityEditElem.style.visibility = "hidden";
          }
        });
      }
    };
  }
]);

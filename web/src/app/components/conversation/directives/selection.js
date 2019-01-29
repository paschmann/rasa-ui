angular.module('app').directive('selection', [
  '$rootScope',
  function($rootScope) {
    return {
      restrict: 'A',
      link: function(scope, element) {
        entityAddElem = element[0];

        document.addEventListener('selectionchange', function(event) {
          const entityAddElemHeight = entityAddElem.offsetHeight;
          const selection = window.getSelection();

          let intent;
          if (selection.anchorNode) {
            intent = selection.anchorNode.parentElement.parentElement.querySelector(
              '.intent'
            );
          }

          if (
            selection.anchorNode &&
            selection.anchorNode.parentElement.parentElement.classList.contains(
              'message'
            ) &&
            intent &&
            !intent.classList.contains('no-match')
          ) {
            const selectionRange = selection.getRangeAt(0); //get the text range
            const selectionRect = selectionRange.getBoundingClientRect();

            entityAddElem.style.top =
              selectionRect.top - entityAddElemHeight + 'px';
            entityAddElem.style.left =
              selectionRect.left +
              selectionRect.width / 2 -
              entityAddElem.offsetWidth / 2 +
              'px';
            const selectedText = selection.toString();
            entityAddElem.style.visibility =
              selectedText.length > 0 ? 'visible' : 'hidden';

            $rootScope.$broadcast('entitySelected', {
              selectedText,
              messageId: selection.anchorNode.parentElement.parentElement.id
            });
          } else {
            entityAddElem.style.visibility = 'hidden';
          }
        });

        document
          .querySelector('#chatlog')
          .addEventListener('scroll', function() {
            if (entityAddElem.style.visibility === 'visible') {
              entityAddElem.style.visibility = 'hidden';
            }
          });

        const entityEditElem = document.getElementById('entityEdit');
        document.addEventListener('click', function(event) {
          if (
            event.target !== entityEditElem &&
            !event.target.classList.contains('entity')
          ) {
            entityEditElem.style.visibility = 'hidden';
          }
        });
      }};
  }
]);

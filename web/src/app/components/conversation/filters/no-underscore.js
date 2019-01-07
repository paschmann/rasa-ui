angular.module("app").filter("noUnderscore", function() {
  return function(string) {
    return string.replace(new RegExp("_", "g"), " ");
  };
});

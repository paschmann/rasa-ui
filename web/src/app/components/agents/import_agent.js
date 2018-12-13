angular
.module('app')
.controller('ImportAgentController', ImportAgentController)

function ImportAgentController($scope, $rootScope, Agent,  $http,  $timeout,$route,$location) {
  $scope.show_preview = false;
  $scope.fileInvalid= true;
  $scope.show_progress=false;

  $scope.importAgent = function() {
    var postRequest={"agent_name":$scope.formData.agent_name,"data":$scope.agentImportData};
    Agent.save({agent_id: "upload"}, postRequest).$promise.then(function(resp) {
          $rootScope.$broadcast('setAlertText', "Agent uploaded successfully");
          if($location.path().endsWith("agents")){
            $route.reload();
          }
    });
    $rootScope.$broadcast('setAlertText', "Agent upload in progress.. Notification will be sent when done!!");
    $scope.formData.agent_name = "";
    $scope.go('/agents');
  }

  $scope.validateAndPreviewAgent = function(file) {
    $scope.filesize = file.size + " bytes";
    $scope.show_preview = true;
    $scope.show_progress = true;
    $scope.agentImportData="Loading ..."
    var reader = new FileReader();
    reader.onload = function(e) {
      $scope.show_progress = false;
        try {
          $scope.agentImportData = JSON.parse(reader.result);
          $scope.fileInvalid = false;
        } catch (e) {
            $scope.agentImportData = "Invalid JSON";
            console.log("Unknown Format");
            return false;
          }
      };
    reader.onerror = function(err) {
        $scope.agentImportData = "Error Occurred while uploading the file";
        console.log(err, err.loaded, err.loaded === 0, file);
        button.removeAttribute("disabled");
    }
    reader.onprogress = function(e) {
      //console.log(e, e.lengthComputable, e.loaded, e.total);
    }
    reader.readAsText(file);
  }
}



function sortArrayByDate(arr, dt_property) {
  arr.sort(function(a, b) {
    a = new Date(a[dt_property]);
    b = new Date(b[dt_property]);
    return a>b ? -1 : a<b ? 1 : 0;
  });
  return arr;
}

function objectFindByKey(array, key, value) {
  for (var i = 0; i < array.length; i++) {
      if (array[i][key] === value) {
          return array[i];
      }
  }
  return null;
}

function parseRasaModelFolderDate(folder) {
  var p = folder.substring(folder.lastIndexOf("_") + 1)
  var d = p.substring(0,4) + '-' + p.substring(4,6) + '-' + p.substring(6,8) + 'T' + p.substring(9,11) + ':' + p.substring(11,13);
  var s = p.substring(4,6) + '-' + p.substring(6,8) + '-' + p.substring(0,4);
  var t = p.substring(9,11) + ':' + p.substring(11,13);
  return new XDate(p.substring(0,4), p.substring(4,6) - 1, p.substring(6,8), p.substring(9,11), p.substring(11,13))
}

function getAvailableModels(statusData) {
  var arrModels = [];

  if(statusData === undefined)
    return arrModels;

  for (var project in statusData.available_projects) {
    if (!statusData.available_projects.hasOwnProperty(project)) continue;
     var projectObj = statusData.available_projects[project];
     modelItr: for (var i=0; i<projectObj.available_models.length; i++){
       var modelName = projectObj.available_models[i];
       if(modelName == 'fallback') continue modelItr;
        var xdate = parseRasaModelFolderDate(modelName);
        arrModels.push({name : project+"*"+modelName, xdate: xdate});
      };
  }

  arrModels.sort(function(a, b){
    return a.xdate[0] > b.xdate[0];
  });
  return arrModels;
}

function getLoadedModels(models) {
  var arrModels = [];
  if (models instanceof Object) {
    var arrVals = Object.keys(models).map(function (key) { return models[key]; });
    var arrKeys = Object.keys(models).map(function (key) { return key; });
    for (var z = 0; z <= arrVals.length - 1; z++) {
      arrModels.push({name: arrKeys[z], folder: arrVals[z]});
    }
  } else {
    arrModels.push({name: 'Default', folder: models});
  }
  return arrModels;
}

function pastelColors(){
  var hue = Math.floor(Math.random() * 360);
  return 'hsl(' + hue + ', 100%, 87.5%)';
}

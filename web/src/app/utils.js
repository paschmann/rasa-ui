

function sortArrayByDate(arr, dt_property) {
  arr.sort(function(a, b) {
    a = new Date(a[dt_property]);
    b = new Date(b[dt_property]);
    return a>b ? -1 : a<b ? 1 : 0;
  });
  return arr;
}

function parseRasaModelFolderDate(folder) {
  var p = folder.split('/model_')[1];
  var d = p.substring(0,4) + '-' + p.substring(4,6) + '-' + p.substring(6,8) + 'T' + p.substring(9,11) + ':' + p.substring(11,13);
  var s = p.substring(4,6) + '-' + p.substring(6,8) + '-' + p.substring(0,4);
  var t = p.substring(9,11) + ':' + p.substring(11,13);
  return new XDate(p.substring(0,4), p.substring(4,6) - 1, p.substring(6,8), p.substring(9,11), p.substring(11,13))
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

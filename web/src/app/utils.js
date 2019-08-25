function sortArrayByDate(arr, dt_property) {
  arr.sort(function (a, b) {
    a = new Date(a[dt_property]);
    b = new Date(b[dt_property]);
    return a > b ? -1 : a < b ? 1 : 0;
  });
  return arr;
}

function objectFindByKey(array, key, value) {
  for (let i = 0; i < array.length; i++) {
    if (array[i][key] === value) {
      return array[i];
    }
  }
  return null;
}

function parseRasaModelFolderDate(folder) {
  const p = folder.substring(folder.lastIndexOf('_') + 1);
  const d =
    p.substring(0, 4) +
    '-' +
    p.substring(4, 6) +
    '-' +
    p.substring(6, 8) +
    'T' +
    p.substring(9, 11) +
    ':' +
    p.substring(11, 13);
  const s = p.substring(4, 6) + '-' + p.substring(6, 8) + '-' + p.substring(0, 4);
  const t = p.substring(9, 11) + ':' + p.substring(11, 13);
  return new window.XDate(
    p.substring(0, 4),
    p.substring(4, 6) - 1,
    p.substring(6, 8),
    p.substring(9, 11),
    p.substring(11, 13)
  );
}

function getNoOfTrainingJobs(statusData) {
  let count = 0;
  if (statusData === undefined) return count;

  for (let project in statusData.available_projects) {
    if (!statusData.available_projects.hasOwnProperty(project)) continue;
    const projectObj = statusData.available_projects[project];
    if (projectObj.status === 'training') {
      count++;
    }
  }
  return count;
}
function getAvailableModels(statusData) {
  const arrModels = [];
  /*

  if (statusData === undefined) return arrModels;

  for (let project in statusData.available_projects) {
    if (!statusData.available_projects.hasOwnProperty(project)) continue;
    const projectObj = statusData.available_projects[project];
    modelItr: for (var i = 0; i < projectObj.available_models.length; i++) {
      const modelName = projectObj.available_models[i];
      //if(modelName == 'fallback') continue modelItr;
      const xdate = parseRasaModelFolderDate(modelName);
      arrModels.push({ name: project + '*' + modelName, xdate: xdate });
    }
  }
  if (statusData.available_projects.length === 0) {
    let defaultDate = new Date();
    arrModels.push({
      name: 'default*fallback',
      xdate: defaultDate.setDate(defaultDate.getFullYear - 10)
    });
  }

  arrModels.sort(function(a, b) {
    return a.xdate[0] < b.xdate[0];
  });
  return arrModels;
  */
}

function timeConverter(UNIX_timestamp) {
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec;
  return time;
}

function getLoadedModels(statusData) {
  let loadedModels = [];
  if (statusData === undefined) return loadedModels;
  const data = statusData.available_projects;
  const models = Object.keys(data);
  models.forEach(x => {
    if (data[x].loaded_models.length > 0) {
      const loadedProjectModels = data[x].loaded_models.map(y => {
        return {
          name: x,
          id: y
        }
      });
      loadedModels = [...loadedModels, ...loadedProjectModels]
    }
  })
  return loadedModels;
}

function pastelColors() {
  const hue = Math.floor(Math.random() * 360);
  return 'hsl(' + hue + ', 100%, 87.5%)';
}

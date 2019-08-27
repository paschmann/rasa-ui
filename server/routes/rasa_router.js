//All NLU specific functions and routes.
const request = require('request');
const db = require('../db/db');
const logs = require('../db/logs');
const logger = require('../util/logger');
const fs = require('fs');
var path = require('path')

function getRasaNluStatus(req, res, next) {
  logger.winston.info('Rasa NLU Status Request -> ' + global.rasa_endpoint + '/status');
  request(global.rasa_endpoint + '/status', function (error, response, body) {
    try {
      if (body !== undefined) sendOutput(200, res, body);
      else sendOutput(500, res, '{"error" : "Server Error"}');
    } catch (err) {
      logger.winston.info(err);
      sendOutput(500, res, '{"error" : ' + err + "}");
    }
  });
}

function getRasaNluEndpoint(req, res, next) {
  logger.winston.info("Rasa NLU Endpoint Request");
  sendOutput(200, res, '{"url" : "' + global.rasa_endpoint + '"}');
}

function getRasaNluVersion(req, res, next) {
  logger.winston.info('Rasa NLU Version Request -> ' + global.rasa_endpoint + '/version');
  request(global.rasa_endpoint + '/version', function (error, response, body) {
    try {
      if (body !== undefined) sendOutput(200, res, body);
      else sendOutput(500, res, '{"error" : "Server Error"}');
    } catch (err) {
      logger.winston.info(err);
      sendOutput(500, res, '{"error" : ' + err + "}");
    }
  });
}

function checkDirectoryExists(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  checkDirectoryExists(dirname);
  fs.mkdirSync(dirname);
  logger.winston.info("New directory created: " + dirname);
}

function trainRasaNlu(req, res, next) {
  var model = {};
  model.file_path = "server/data/models/" + req.query.agent_name + "/";
  model.file_name = Math.floor(Date.now()) + ".tar.gz";

  logger.winston.info("Rasa NLU Train Request -> " + global.rasa_endpoint + "/model/train");
  try {
    checkDirectoryExists(model.file_path + model.file_name);
    var stream = request({ method: "POST", uri: global.rasa_endpoint + "/model/train", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body) }, function (error, response, body) {
      if (error) {
        logger.winston.info("Error Occured when posting data to nlu endpoint. " + error);
        sendOutput(500, res, '{"error" : ' + error + '}');
        return;
      }
      try {
        if (response.statusCode != 200) {
          logger.winston.info("Error occured while training. Rasa Server Response Code : " + response.statusCode);
          sendOutput(500, res, '{"error" : ' + body + '}');
          return;
        } else {
          model.server_file_name = response.headers["filename"];
          model.response = response;
          logger.winston.info("Training Completed, Rasa Server Response Code : " + response.statusCode);

          sendOutput(200, res, "");

          logs.logRequest(req, 'train', {
            server_response: response.headers["filename"],
            training_data: JSON.stringify(req.body)
          });
        }
      } catch (err) {
        logger.winston.info("Exception:" + err);
        sendOutput(500, res, '{"error" : ' + err + '}');
      }
    }).pipe(fs.createWriteStream(model.file_path + model.file_name));

    stream.on('finish', function () {
      if (model.server_file_name) {
        db.run('insert into models(model_name, comment, agent_id, local_path, server_path, server_response)' + 'values (?,?,?,?,?,?)', [model.file_name, req.query.comment, req.query.agent_id, model.file_path + model.file_name, model.server_file_name, "response"], function (err) {
          if (err) {
            logger.winston.info("Error inserting a new record: " + err);
          } else {
            logger.winston.info("Model saved to models table");
          }
        });
      }
    });
  } catch (err) {
    logger.winston.info("Exception When sending Training Data to Rasa:" + err);
  }
}

function loadRasaModel(req, res, next) {
  logger.winston.info("Load Rasa Model Request -> " + global.rasa_endpoint + "/model");
  request({ method: "PUT", uri: global.rasa_endpoint + "/model", body: JSON.stringify(req.body) }, function (error, response, body) {
    if (error) {
      logger.winston.info(error);
      sendOutput(500, res, '{"error" : ' + error + '}');
    }
    try {
      if (body !== undefined) {
        logger.winston.info("Load Rasa Model Response:" + body);
        sendOutput(200, res, body);
      }
    } catch (err) {
      logger.winston.info(err);
      sendOutput(500, res, '{"error" : ' + err + '}');
    }
  });
}

function unloadRasaModel(req, res, next) {
  logger.winston.info("Delete Rasa Model Request -> " + global.rasa_endpoint + "/model");
  request({ method: "DELETE", uri: global.rasa_endpoint + "/model" }, function (error, response, body) {
    if (error) {
      logger.winston.info(error);
      sendOutput(500, res, '{"error" : ' + error + '}');
    }
    try {
      if (body !== undefined) {
        logger.winston.info("Unload Rasa Model Response:" + body);
        sendOutput(200, res, body);
      }
    } catch (err) {
      logger.winston.info(err);
      sendOutput(500, res, '{"error" : ' + err + '}');
    }
  });
}

function parseRequest(req, res, next) {
  logger.winston.info('Routing to Rasa Parse Request -> ' + global.rasa_endpoint + '/model/parse');
  request({ method: 'POST', uri: global.rasa_endpoint + '/model/parse', body: JSON.stringify(req.body) },
    function (error, response, body) {
      try {
        logger.winston.info('Rasa Response: ' + body);
        logs.logRequest(req, 'parse', 
        {
          server_response: body,
          query: req.body.q
        });
        sendOutput(200, res, body);
      } catch (err) {
        logger.winston.info(err);
        sendOutput(500, res, '{"error" : ' + err + "}");
      }
    });
}

function sendOutput(http_code, res, body, headers, type) {
  if (headers) {
    res.writeHead(http_code, headers);
  } else {
    res.writeHead(http_code, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
  }
  if (body !== '') {
    if (type) {
      res.write(body, type);
    } else {
      res.write(body);
    }
  }
  res.end();
}

module.exports = {
  getRasaNluStatus: getRasaNluStatus,
  getRasaNluVersion: getRasaNluVersion,
  trainRasaNlu: trainRasaNlu,
  parseRequest: parseRequest,
  getRasaNluEndpoint: getRasaNluEndpoint,
  unloadRasaModel: unloadRasaModel,
  loadRasaModel: loadRasaModel
};
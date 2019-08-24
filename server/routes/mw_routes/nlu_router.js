//All NLU specific functions and routes.
const request = require('request');
const db = require('../../db/db');
const logs = require('../../db/logs');
const logger = require('../../util/logger');

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

/* No longer available?
function getRasaNluConfig(req, res, next) {
  logger.winston.info('Rasa NLU Config Request -> ' + global.rasa_endpoint + '/config');
  request(global.rasa_endpoint + '/config', function (error, response, body) {
    try {
      if (body !== undefined) sendOutput(200, res, body);
      else sendOutput(500, res, '{"error" : "Server Error"}');
    } catch (err) {
      logger.winston.info(err);
      sendOutput(500, res, '{"error" : ' + err + "}");
    }
  });
}
*/

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

function trainRasaNlu(req, res, next) {
  logger.winston.info("Rasa NLU Train Request -> " + global.rasa_endpoint + "/model/train");
  console.log(JSON.stringify(req.body));
  try {
    request({ method: "POST", uri: global.rasa_endpoint + "/model/train", headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(req.body) }, function (error, response, body) {
      console.log("Done with Request");

      if (error) {
        console.log("Error Occured when posting data to nlu endpoint. " + error);
        sendOutput(500, res, '{"error" : ' + error + '}');
        return;
      }
      try {
        if (response.statusCode != 200) {
          console.log("Error occured while training. Response Code : " + response.statusCode + " Body" + body);
          sendOutput(response.statusCode, res, JSON.stringify({
            errorBody: body
          }));
          return;
        }
        console.log("Training Done !! Response Code : " + response.statusCode);
        sendOutput(200, res, "");
        return;
      } catch (err) {
        console.log("Exception:" + err);
        sendOutput(500, res, '{"error" : ' + err + '}');
      }
    });
  } catch (err) {
    console.log("Exception When sending Training Data to Rasa:" + err);
  }
}

function unloadRasaModel(req, res, next) {
  const query = req.url.replace("/rasa/models", "");
  logger.winston.info("Delete Rasa NLU Model Request -> " + global.rasa_endpoint + "/models" + query);
  request({
    method: "DELETE",
    uri: global.rasa_endpoint + "/models" + query,
  }, function (error, response, body) {
    if (error) {
      console.log(error);
      sendOutput(500, res, '{"error" : ' + error + '}');
    }
    try {
      if (body !== undefined) {
        console.log("Delete Rasa Model Response:" + body);
        sendOutput(200, res, body);
      }
    } catch (err) {
      console.log(err);
      sendOutput(500, res, '{"error" : ' + err + '}');
    }
  });
}

function parseRequest(req, res, next) {
  logger.winston.info('Routing to NLU Parse Request -> ' + global.rasa_endpoint + '/model/parse');
  request({ method: 'POST', uri: global.rasa_endpoint + '/model/parse', body: JSON.stringify(req.body) },
    function (error, response, body) {
      try {
        logger.winston.info('rasa_response:+++ ' + body);
        logs.logRequest(req, 'parse', {
         // project: projectName,
          // model: modelName,
          // intent: '',
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

function sendOutput(http_code, res, body) {
  res.writeHead(http_code, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  });
  if (body !== '') {
    res.write(body);
  }
  res.end();
}

module.exports = {
  getRasaNluStatus: getRasaNluStatus,
  /*getRasaNluConfig: getRasaNluConfig,*/
  getRasaNluVersion: getRasaNluVersion,
  trainRasaNlu: trainRasaNlu,
  parseRequest: parseRequest,
  getRasaNluEndpoint: getRasaNluEndpoint,
  unloadRasaModel: unloadRasaModel
};
//All Rasa specific functions and routes.
const request = require('request');
const db = require('../db/db');
const logs = require('../db/logs');
const logger = require('../util/logger');
const fs = require('fs');
var path = require('path')

/* -------------------------------- Util Functions ----------------------------------------------------------------------------------------------------- */

function checkDirectoryExists(filePath) {
  var dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  checkDirectoryExists(dirname);
  fs.mkdirSync(dirname);
  logger.winston.info("New directory created: " + dirname);
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
  if (body && body !== '') {
    if (type) {
      res.write(body, type);
    } else {
      res.write(body);
    }
  }
  res.end();
}

/* -------------------------------- Server Router Functions ----------------------------------------------------------------------------------------------------- */

function getRasaNluStatus(req, res, next) {
  logger.winston.info('Rasa NLU Status Request -> ' + global.rasa_endpoint + '/status');
  request(global.rasa_endpoint + '/status', function (error, response, body) {
    try {
      if (body !== undefined) {
        sendOutput(200, res, body);
      } else {
        sendOutput(500, res, '{"error" : "Server Error"}');
      }
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
      if (body !== undefined) {
        sendOutput(200, res, body);
      } else {
        sendOutput(500, res, '{"error" : "Server Error"}');
      }
    } catch (err) {
      logger.winston.info(err);
      sendOutput(500, res, '{"error" : ' + err + "}");
    }
  });
}

/* -------------------------------- NLU Router Functions ----------------------------------------------------------------------------------------------------- */

function trainRasaNlu(req, res, next) {
  var model = {};
  model.file_path = "server/data/models/" + req.query.bot_name + "/";
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
        db.run('insert into models(model_name, comment, bot_id, local_path, server_path, server_response)' + 'values (?,?,?,?,?,?)', [model.file_name, req.query.comment, req.query.bot_id, model.file_path + model.file_name, model.server_file_name, "response"], function (err) {
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

function modelParseRequest(req, res, next) {
  logger.winston.info('Routing to Model Rasa Parse Request -> ' + global.rasa_endpoint + '/model/parse');
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

/* -------------------------------- Core Router Functions ----------------------------------------------------------------------------------------------------- */


function conversationParseRequest(req, res, next) {
  try {
    logger.winston.info("Routing to Model Rasa Parse Request -> " + global.rasa_endpoint + "/conversations/" + "default" + "/messages");
    request({ method: 'POST', uri: global.rasa_endpoint + "/conversations/" + "default" + "/messages", body: JSON.stringify(req.body) },
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
  } catch (err) {
    logger.winston.info(err);
  }
}


function restartRasaCoreConversation(req, res, next) {
  logger.winston.info("Rasa Core Restart Request -> " + global.rasa_endpoint);
  try {
    var body = JSON.stringify({ "events": [{ "event": "restart" }] });
    request({
      method: "POST",
      uri: global.rasa_endpoint + "/conversations/" + "default" + "/tracker/events",
      body: body
    }, function (error, response, body) {
      if (error) {
        logger.winston.info(error);
        sendOutput(500, res, '{"error" : "Exception caught !!"}');
        return;
      }
      logger.winston.info("Restart Response" + JSON.stringify(body));
      sendOutput(200, res, body);
    });
  } catch (err) {
    logger.winston.info(err);
    sendOutput(500, res, '{"error" : "Exception caught !!"}');
    return;
  }
}

/*
var startPredictingActions = async(function (core_url, req, currentAction, res, agentObj, events) {
  while (true) {
    console.log("*********** Executed this ***********: " + currentAction);
    var responseBody = await(rasaCoreRequest(req, "continue", JSON.stringify({ "executed_action": currentAction, "events": events })));
    console.log("Rasa Core Resonse from Continue: " + JSON.stringify(responseBody));
    responseBody.actionTimestamp = Date.now();
    events = await(getActionResponses(req, responseBody, res, agentObj));
    currentAction = responseBody.next_action;
    if (currentAction === "action_listen") {
      //last loop. done predicting all ACTIONS
      console.log("last loop. done predicting all ACTIONS")
      break;
    }
  }
  return;
});

function rasaCoreRequest(req, type, reqBody) {
  return new Promise((resolve, reject) => {
    request({
      method: "POST",
      uri: global.rasa_endpoint + "/conversations/" + req.jwt.username + "/" + type,
      body: reqBody,
      sendImmediately: false
    }, function (error, response, body) {
      if (error) {
        console.log(error);
        reject(error); return;
      }
      console.log("After request:" + body);
      resolve(JSON.parse(body));
    });
  });
}

var insertMessageToDB = async(function (message, corelogData, nlulogData) {
  db.any('insert into public.messages(agent_id, user_id, user_name, message_text, message_rich, user_message_ind)' +
    ' values(${agent_id}, ${user_id},${user_name}, ${message_text}, ${message_rich}, ${user_message_ind}) RETURNING messages_id', message)
    .then(function (response) {
      console.log("Message Inserted with Id: " + response[0].messages_id);
      corelogData.messages_id = response[0].messages_id;
      nlulogData.messages_id = response[0].messages_id;
      insertCoreParseLogDB(corelogData);
      insertNLUParseLogDB(nlulogData);
    }).catch(function (err) {
      console.log("Exception while inserting inserting to DB");
      console.log(err);
    });

});

//TODO: New table
var insertCoreParseLogDB = async(function (corelogData) {
  db.none('INSERT INTO public.core_parse_log(messages_id,action_name, slots_data, user_response_time_ms, core_response_time_ms) values( ' +
    ' ${messages_id}, ${action_name}, ${slots_data}, ${user_response_time_ms},${core_response_time_ms})', corelogData)
    .then(function () {
      console.log("Cache inserted into Core db.");
    })
    .catch(function (err) {
      console.log("Exception while inserting Core Parse log");
      console.log(err);
    });
});


var getActionResponses = async(function (req, rasa_core_response, res, agentObj) {
  var events = [];
  return new Promise((resolve, reject) => {
    if (rasa_core_response.next_action != 'action_listen') {
      if (rasa_core_response.next_action.startsWith("utter_webhook_")) {
        //webhook type. Make a call to external webhook and append response
        var webhookResponse = await(fetchActionDetailsFromWebhook(req, rasa_core_response, agentObj));
        console.log("------ Webhook Response for action : " + rasa_core_response.next_action + "------------");
        console.log(webhookResponse);
        console.log("------------------------------------------------------------");
        if (webhookResponse != undefined) {
          try {
            rasa_core_response.response_text = JSON.parse(webhookResponse).displayText;
            rasa_core_response.response_rich = JSON.parse(webhookResponse).dataToClient;
            if ("undefined" !== typeof (JSON.parse(webhookResponse).events)) {
              events = JSON.parse(webhookResponse).events;
              console.log("-******************---------------" + events + "-------**************-----------");
            }
            resolve(events);
          } catch (e) {
            console.log("Unknown response from Webhook for action: " + rasa_core_response.next_action);
            console.log("Webhook Response" + webhookResponse);
            rasa_core_response.response_text = "Please check your Webhook Conenction. Got an error response.";
            reject(e);
            return;
          }
        } else {
          console.log("Unknown response from Webhook for action: " + rasa_core_response.next_action);
          rasa_core_response.response_text = "Unknown response from Webhook for action: " + rasa_core_response.next_action;
          resolve(events);
        }
      } else if (rasa_core_response.next_action.startsWith("utter_")) {
        //utter Type
        var actionRespObj = await(fetchActionDetailsFromDb(rasa_core_response.next_action, agentObj.agent_id));
        console.log("------ Utter Response for action : " + rasa_core_response.next_action + "------------");
        console.log(actionRespObj);
        console.log("------------------------------------------------------------");
        if (actionRespObj != undefined) {
          var slot_to_fill = actionRespObj.response_text.match(/{(.*)}/ig);
          if (slot_to_fill != null && slot_to_fill.length > 0) {
            for (var i = 0; i < slot_to_fill.length; i++) {
              console.log("Found a slot to fill: " + slot_to_fill[i]);
              var stringForRasa = slot_to_fill[i].substring(1, slot_to_fill[i].length - 1);
              var slotVal = rasa_core_response.tracker.slots[stringForRasa];
              console.log("Filling: " + stringForRasa + " with: " + slotVal);
              actionRespObj.response_text = actionRespObj.response_text.replace(slot_to_fill[i], rasa_core_response.tracker.slots[stringForRasa]);
            }
          }
          rasa_core_response.response_text = actionRespObj.response_text;
          rasa_core_response.buttons_info = actionRespObj.buttons_info;
          rasa_core_response.response_image_url = actionRespObj.response_image_url;
        } else {
          console.log("Error while Fetching templete for Action.");
          rasa_core_response.response_text = "No templete configured for this action";
        }
        resolve(events);
      } else if (rasa_core_response.next_action.startsWith("action_restart")) {
        console.log("Got an action_restart. Restarting conversation!! ");
        try {
          request({
            method: "POST",
            uri: global.rasa_endpoint + "/conversations/" + req.jwt.username + "/continue",
            body: JSON.stringify({ "events": [{ "event": "restart" }] })
          }, function (error, response, body) {
            if (error) {
              console.log("Restart Error: " + error);
            }
            console.log("Restarted Successfully!! ");
          });
        } catch (err) {
          console.log(err);
          sendResponse(500, res, '{"error" : "Exception caught !!"}');
          return;
        }
        resolve(events);
      }
      else {
        console.log("Unrecognized Actions. Rasa UI can only process 'utter' type and 'utter_webhook' type. Got: " + rasa_core_response.next_action + " . Logging and skipping it.");
        resolve(events);
      }
    } else {
      //just keep listening for next message from user
      console.log("Got an action Listen. Will Listen for next message.");
      resolve(events);
    }
  });
});

function fetchActionDetailsFromDb(action_name, agent_id) {
  return new Promise((resolve, reject) => {
    db.any('SELECT * FROM ACTIONS, responses where actions.action_id = responses.action_id and actions.action_name=$1 and actions.agent_id=$2 ' +
      ' order by random() LIMIT 1', [action_name, agent_id])
      .then(function (data) {
        if (data.length > 0) {
          resolve(data[0]);
        } else {
          console.log("Error occurred. Respond back with Rasa NLU only");
          return;
        }
      })
      .catch(function (err) {
        console.log("Error occurred. Respond back with Rasa NLU only");
        reject(err); return;
      });
  });
}

function fetchActionDetailsFromWebhook(req, rasa_core_response, agentObj) {
  return new Promise((resolve, reject) => {
    request.post({
      url: agentObj.endpoint_url,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": "Bearer " + req.original_token
      },
      body: JSON.stringify(rasa_core_response)
    },
      function (error, response, body) {
        if (error) {
          console.log("Error occurred in Webhook call");
          reject(error); return;
        } else {
          resolve(body);
          return;
        }
      }
    );
  });
}
*/

module.exports = {
  getRasaNluStatus: getRasaNluStatus,
  getRasaNluVersion: getRasaNluVersion,
  trainRasaNlu: trainRasaNlu,
  modelParseRequest: modelParseRequest,
  getRasaNluEndpoint: getRasaNluEndpoint,
  unloadRasaModel: unloadRasaModel,
  loadRasaModel: loadRasaModel,
  conversationParseRequest: conversationParseRequest,
  restartRasaCoreConversation: restartRasaCoreConversation
};
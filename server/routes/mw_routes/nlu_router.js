//All NLU specific functions and routes.
const request = require('request');
const db = require('../../db/db');
const NodeCache = require('node-cache');
const logger = require('../../util/logger');
//https://github.com/mpneuried/nodecache
const nluParseLogCache = new NodeCache();
const YAML = require('yaml');


function getRasaNluStatus(req, res, next) {
  logger.winston.info(
    'Rasa NLU Status Request -> ' + global.rasanluendpoint + '/status'
  );
  request(global.rasanluendpoint + '/status', function(error, response, body) {
    try {
      if (body !== undefined) sendOutput(200, res, body);
      else sendOutput(500, res, '{"error" : "Server Error"}');
    } catch (err) {
      logger.winston.error(err);
      sendOutput(500, res, '{"error" : ' + err + "}");
    }
  });
}

function getRasaNluEndpoint(req, res, next) {
  logger.winston.info("Rasa NLU Endpoint Request");
  sendOutput(200, res, '{"url" : "'+global.rasanluendpoint+'"}');
}

function getRasaNluConfig(req, res, next) {
  logger.winston.info(
    'Rasa NLU Config Request -> ' + global.rasanluendpoint + '/config'
  );
  request(global.rasanluendpoint + '/config', function(error, response, body) {
    try {
      if (body !== undefined) sendOutput(200, res, body);
      else sendOutput(500, res, '{"error" : "Server Error"}');
    } catch (err) {
      logger.winston.error(err);
      sendOutput(500, res, '{"error" : ' + err + "}");
    }
  });
}

function getRasaNluVersion(req, res, next) {
  logger.winston.info(
    'Rasa NLU Version Request -> ' + global.rasanluendpoint + '/version'
  );
  request(global.rasanluendpoint + '/version', function(error, response, body) {
    try {
      if (body !== undefined) sendOutput(200, res, body);
      else sendOutput(500, res, '{"error" : "Server Error"}');
    } catch (err) {
      logger.winston.error(err);
      sendOutput(500, res, '{"error" : ' + err + "}");
    }
  });
}

function trainRasaNlu(req, res, next) {
  logger.winston.info(
    'Rasa NLU Train Request -> ' +
      global.rasanluendpoint +
      '/train?project=' +
      req.query.project +
      '&model=' +
      req.query.name
  );

  var reqBody = YAML.stringify({
    language: req.body.language,
    pipeline: req.body.pipeline,
    data: req.body.data
  });
  logRequest(req, "train", {
    project: req.query.project,
    model: req.query.name,
    data: reqBody
  });

  try {
    request({
      method: "POST",
      uri: global.rasanluendpoint + "/train?project=" + req.query.project + "&model=" + req.query.name,
      headers: {
        'Content-Type': 'application/x-yml'
      },
      body: reqBody
    }, function (error, response, body) {
      console.log("Done with Request");

      if (error) {
        console.log("Error Occured when posting data to nlu endpoint. " + error);
        sendOutput(500, res, '{"error" : ' + error + '}');
        return;
      }
      try {
        if (response.statusCode !== 200) {
          logger.winston.info(
            'Error occured while training. Response Code : ' +
              response.statusCode +
              ' Body' +
              body
          );
          sendOutput(
            response.statusCode,
            res,
            JSON.stringify({ errorBody: body })
          );
          return;
        }
        logger.winston.info(
          'Training Done !! Response Code : ' + response.statusCode
        );
        sendOutput(200, res, '');
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
  const query = req.url.replace("/rasa/models","");
  console.log("Delete Rasa NLU Model Request -> " + global.rasanluendpoint + "/models"+ query);
  request({
    method: "DELETE",
    uri: global.rasanluendpoint + "/models" + query,
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
        logger.winston.info("Exception:" +err);
        sendOutput(500, res, '{"error" : ' + err + "}");
      }
    }
  );
}

function parseRequest(req, res, next, agentObj) {
  logger.winston.info(
    'Routing to NLU Parse Request -> ' + global.rasanluendpoint + '/parse'
  );

  if (req.body.q === '') {
    logger.winston.info('Query not found');
    sendOutput(500, res, '{"error" : "Query not found !!"}');
    return;
  }

  let modelName;
  let projectName;

  let cache_key;
  if (req.body.model !== undefined) {
    projectName = req.body.project;
    modelName = req.body.model;
    cache_key = req.jwt.username + '_' + modelName + '_' + Date.now();
    logRequest(req, 'parse', {
      project: projectName,
      model: modelName,
      intent: '',
      query: req.body.q
    });
    createInitialCacheRequest(req, cache_key, agentObj);
  }

  request(
      {
      method: 'POST',
      uri: global.rasanluendpoint + '/parse',
      body: JSON.stringify(req.body)
    },
    function(error, response, body) {
      if (error) {
        logger.winston.info(error);
        sendOutput(500, res, '{"error" : ' + error + "}");
      }
      try {
        logger.winston.info('rasa_response:+++ ' + body);
        updateCacheWithRasaNluResponse(JSON.parse(body), cache_key);
        updateAndSendRasaResponse(
          req,
          cache_key,
          JSON.parse(body),
          modelName,
          projectName,
          res
        );
      } catch (err) {
        logger.winston.error(err);
        sendOutput(500, res, '{"error" : ' + err + "}");
      }
    }
  );
}

// ----------------------------------------------------------
// Utility functions for middleware
// ----------------------------------------------------------
function finalizeCacheFlushToDbAndRespond(cacheKey, http_code, res, body) {
  nluParseLogCache.get(cacheKey, function (err, nlu_parse_cache) {
    if (!err) {
      if (nlu_parse_cache === undefined) {
        // quit logging and return
        logger.winston.info('Cache Not Found for key ' + cacheKey);
      } else {
        if (body !== '') {
          if (body.response_text !== undefined)
            nlu_parse_cache.response_text = body.response_text;
          if (body.response_rich !== undefined)
            nlu_parse_cache.message_rich = body.response_rich;
          nlu_parse_cache.user_response_time_ms =
            Date.now() - nlu_parse_cache.createTime;
        }
        //insert message and use that id to insert nlu_parse_log
        nlu_parse_cache.message_text = nlu_parse_cache.response_text;
        nlu_parse_cache.user_message_ind = false;

        if (nlu_parse_cache.agent_id !== undefined) {
          //insert user message and nlu classification
          db.any(
              'insert into messages(agent_id, user_id, user_name, message_text, user_message_ind, intent_id)' +
              ' values($(agent_id), $(user_id),$(user_name), $(request_text), true, (SELECT intent_id FROM intents WHERE intent_name=$(intent_name) and agent_id=$(agent_id))) RETURNING messages_id',
              nlu_parse_cache
            )
            .then(function (returnData) {
              nlu_parse_cache.messages_id = returnData[0].messages_id;
              db.none(
                  'INSERT INTO nlu_parse_log(intent_name, entity_data, messages_id,intent_confidence_pct, user_response_time_ms,nlu_response_time_ms) ' +
                  ' values($(intent_name), $(entity_data), $(messages_id), $(intent_confidence_pct),$(user_response_time_ms),$(nlu_response_time_ms))',
                  nlu_parse_cache
                )
                .then(function () {
                  logger.winston.info('Cache inserted into db. Removing it');
                  nluParseLogCache.del(cacheKey);
                })
                .catch(function (err) {
                  logger.winston.info('Exception while inserting Parse log');
                  logger.winston.info(err);
                });
                  //insert bot message
                db.any(
                  'insert into messages(agent_id, user_id, user_name, message_text, message_rich, user_message_ind)' +
                  ' values($(agent_id), $(user_id),$(user_name), $(message_text), $(message_rich), false) RETURNING messages_id',
                  nlu_parse_cache
                ).then(function (returnData) {
                  logger.winston.info('Message Inserter Successfully!!');
                }).catch(function (err) {
                  logger.winston.info('Exception in the DB log');
                  logger.winston.info(err);
                });
            })
            .catch(function(err) {
              logger.winston.info('Exception in the DB log');
              logger.winston.error(err);
            });
        }
      }
    } else {
      logger.winston.info('Cache Not Found for key ' + cacheKey);
      return;
    }
  });
  //send response
  res.writeHead(http_code, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'});
  if (body !== '') {
    res.write(JSON.stringify(body));
  }
  res.end();
}

function updateCacheWithRasaNluResponse(rasa_response, cacheKey) {
  nluParseLogCache.get(cacheKey, function (err, nlu_parse_cache) {
    if (!err) {
      if (nlu_parse_cache === undefined) {
        // quite logging and return
        logger.winston.info('Cache Not Found for key ' + cacheKey);
      } else {
        try {
          nlu_parse_cache.intent_name = rasa_response.intent.name;
          nlu_parse_cache.entity_data = JSON.stringify(rasa_response.entities);
          nlu_parse_cache.intent_confidence_pct =
            rasa_response.intent.confidence.toFixed(2) * 100;
          nlu_parse_cache.nlu_response_time_ms =
            Date.now() - nlu_parse_cache.createTime;
          nluParseLogCache.set(cacheKey, nlu_parse_cache);
        } catch (err) {
          //logger.winston.error(err);
        }
      }
    } else {
      logger.winston.info('Cache Not Found for key ' + cacheKey);
    }
  });
}

function createInitialCacheRequest(req, cacheKey, agentObj) {
  logger.winston.info('Create Initial cache');
  const nluParseReqObj = {};
  nluParseReqObj.request_text = req.body.q;
  nluParseReqObj.model_name = req.body.model;
  nluParseReqObj.project_name = req.body.project;
  nluParseReqObj.user_id = req.jwt.username;
  nluParseReqObj.user_name = req.jwt.name;
  nluParseReqObj.createTime = Date.now();
  //empty object
  nluParseReqObj.intent_name = '';
  nluParseReqObj.entity_data = '{}';
  nluParseReqObj.response_text = '';
  nluParseReqObj.message_rich = '{}';
  nluParseReqObj.intent_confidence_pct = 0;
  nluParseReqObj.user_response_time_ms = 0;
  nluParseReqObj.nlu_response_time_ms = 0;
  //set agent_id
  if (agentObj !== undefined) {
    nluParseReqObj.agent_id = agentObj.agent_id;
  }
  //set it in the cache
  nluParseLogCache.set(cacheKey, nluParseReqObj, function (err, success) {
    if (!err && success) {
      logger.winston.info('Object Inserted into Cache');
    }
  });
}

function sendOutput(http_code, res, body) {
  res.writeHead(http_code, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'});
  if (body !== '') {
    res.write(body);
  }
  res.end();
}

function logRequest(req, type, data) {
  try {
    const obj = {};
    obj.ip_address =
      req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    obj.query = req.originalUrl;
    obj.event_type = type;
    obj.event_data = data;
    logger.winston.info(obj);

    db.any(
      'insert into nlu_log(ip_address, query, event_type, event_data)' +
        'values($(ip_address), $(query), $(event_type), $(event_data))',
        obj
    ).catch(function(err) {
      logger.winston.error(err);
    });
  } catch (err) {
    logger.winston.info('Error: ' + err);
  }
}

function updateAndSendRasaResponse(
  req,
  cacheKey,
  rasa_response,
  modelName,
  projectName,
  res
) {
  if (rasa_response.intent === undefined) {
    finalizeCacheFlushToDbAndRespond(cacheKey, 200, res, rasa_response);
  } else {
    db.any(
      'select agents.endpoint_enabled as agent_endpoint, agents.endpoint_url, agents.basic_auth_username,agents.basic_auth_password, ' +
        'intents.endpoint_enabled as intent_endpoint, intents.intent_id, intents.intent_name  from agents, intents where agents.agent_name=$2 ' +
        ' and intents.intent_name=$1 and intents.agent_id=agents.agent_id',
      [rasa_response.intent.name, projectName]
      ).then(function(data) {
      //check if webhook is configured
      if (data.length > 0) {
        if (data[0].intent_endpoint === true) {
          //post rasa_response to configured webhook
          //Need to add HTTP Basic Authentication
          request.post(
                {
              url: data[0].endpoint_url,
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + req.original_token
              },
              body: JSON.stringify(rasa_response)
            },
            function(error, response, body) {
              if (error) {
                //Got error from webhook,log and and send original rasa nlu response
                logger.winston.info(error);
                rasa_response.response_text =
                  'Configured Webhook threw an error. Check with the service provider.';
                finalizeCacheFlushToDbAndRespond(
                  cacheKey,
                  200,
                  res,
                  rasa_response
                );
                return;
              }
              try {
                //respond back to client.
                //Expecting API.ai style response element.
                //var response_text={
                //   'speech': '',
                  //   'displayText': '',
                  //   'dataToClient':{}
                  //}
                  logger.winston.info(
                  'Response from Webhook --> ' + JSON.stringify(body)
                  );
                if (body !== undefined) {
                  rasa_response.response_text = JSON.parse(body).displayText;
                  rasa_response.response_rich = JSON.parse(body).dataToClient;
                  logger.winston.info(
                    'Sending Rasa NLU Response + Webhook response'
                    );
                  finalizeCacheFlushToDbAndRespond(
                    cacheKey,
                    200,
                    res,
                    rasa_response
                  );
                } else {
                  logger.winston.info(
                    'Unknown response from webhook. Respond back with Rasa NLU only'
                    );
                  finalizeCacheFlushToDbAndRespond(
                    cacheKey,
                    200,
                    res,
                    rasa_response
                  );
                }
              } catch (err) {
                  logger.winston.info(
                  'Error from Webhook. Respond back with Rasa NLU only'
                  );
                logger.winston.error(err);
                finalizeCacheFlushToDbAndRespond(
                  cacheKey,
                  200,
                  res,
                  rasa_response
                );
              }
            }
          );
        } else {
          //no webhook, check if there is a static response configured
          db.any(
            'SELECT responses.response_text FROM responses, intents where responses.intent_id = intents.intent_id and intents.intent_id = $1 order by random() LIMIT 1',
            data[0].intent_id
              )
            .then(function(data) {
              if (data.length > 0) {
                rasa_response.response_text = data[0].response_text;
                logger.winston.info(
                  'Sending Rasa NLU Response + Static response configured'
                );
                finalizeCacheFlushToDbAndRespond(
                  cacheKey,
                  200,
                  res,
                  rasa_response
                );
              } else {
                logger.winston.info(
                  'No Static response configured. Respond back with Rasa NLU only'
                );
                finalizeCacheFlushToDbAndRespond(
                  cacheKey,
                  200,
                  res,
                  rasa_response
                );
              }
            })
            .catch(function(err) {
              logger.winston.info(
                'Error occurred. Respond back with Rasa NLU only'
              );
              logger.winston.error(err);
              finalizeCacheFlushToDbAndRespond(
                cacheKey,
                200,
                res,
                rasa_response
              );
            });
        }
      } else {
        logger.winston.info(
          'No intent Data found. Respond back with Rasa NLU only'
        );
        finalizeCacheFlushToDbAndRespond(cacheKey, 200, res, rasa_response);
      }
    });
  }
}

module.exports = {
  getRasaNluStatus: getRasaNluStatus,
  getRasaNluConfig: getRasaNluConfig,
  getRasaNluVersion: getRasaNluVersion,
  trainRasaNlu: trainRasaNlu,
  parseRequest: parseRequest,
  getRasaNluEndpoint: getRasaNluEndpoint,
  unloadRasaModel: unloadRasaModel
};
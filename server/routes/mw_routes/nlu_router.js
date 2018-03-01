//All NLU specific functions and routes.
var request = require('request');
const db = require('../../db/db')
const NodeCache = require( "node-cache" );
//https://github.com/mpneuried/nodecache
const nluParseLogCache = new NodeCache();

function getRasaNluStatus(req, res, next) {
  console.log("Rasa NLU Status Request -> " + process.env.npm_package_config_rasanluendpoint + "/status");
  request(process.env.npm_package_config_rasanluendpoint + '/status', function (error, response, body) {
    try {
      if (body !== undefined) sendOutput(200, res, body);
      else sendOutput(404, res, '{"error" : "Server Error"}');
    } catch (err) {
      console.log(err);
      sendOutput(404, res, '{"error" : "Exception caught !!"}');
    }
  });
}

function getRasaNluConfig(req, res, next) {
  console.log("Rasa NLU Config Request -> " + process.env.npm_package_config_rasanluendpoint + "/config");
  request(process.env.npm_package_config_rasanluendpoint + '/config', function (error, response, body) {
    try {
      if (body !== undefined) sendOutput(200, res, body);
      else sendOutput(404, res, '{"error" : "Server Error"}');
    } catch (err) {
      console.log(err);
      sendOutput(404, res, '{"error" : "Exception caught !!"}');
    }
  });
}

function getRasaNluVersion(req, res, next) {
  console.log("Rasa NLU Version Request -> " + process.env.npm_package_config_rasanluendpoint + "/version");
  request(process.env.npm_package_config_rasanluendpoint + '/version', function (error, response, body) {
    try {
      if (body !== undefined) sendOutput(200, res, body);
      else sendOutput(404, res, '{"error" : "Server Error"}');
    } catch (err) {
      console.log(err);
      sendOutput(404, res, '{"error" : "Exception caught !!"}');
    }
  });
}

function trainRasaNlu(req, res, next) {
  console.log("Rasa NLU Train Request -> " + process.env.npm_package_config_rasanluendpoint + "/train?project=" + req.query.project);
  request({
    method: "POST",
    uri: process.env.npm_package_config_rasanluendpoint + "/train?project=" + req.query.project,
    body: JSON.stringify(req.body)
    //commenting headers out. NLU doesnt need any headers
    //headers: req.headers
  }, function (error, response, body) {
    if(error){
      console.log("Error Occured when posting data to nlu endpoint. "+error);
      sendOutput(404, res, error);
      return;
    }
    try {
      if(response.statusCode != 200){
          console.log("Error occured while training. Response Code : "+response.statusCode+" Body"+ body);
          sendOutput(response.statusCode, res, JSON.stringify({errorBody : body}));
          return;
      }
      console.log("Training Done !! Response Code : " + response.statusCode);
      sendOutput(200, res, "");
      return;
    } catch (err) {
      console.log(err);
      sendOutput(404, res, '{"error" : "Exception caught !!"}');
    }
  });
}

function parseRequest(req, res, next, agentObj) {
  console.log("Routing to NLU Parse Request -> " + process.env.npm_package_config_rasanluendpoint + "/parse");
  var modelName = req.body.model;
  var projectName = req.body.project;
  if(modelName == ''){
    console.log("Model not found");
    sendOutput(404, res, '{"error" : "Model not found !!"}');
    return;
  }
  if(req.body.q == ''){
    console.log("Query not found");
    sendOutput(404, res, '{"error" : "Query not found !!"}');
    return;
  }
  var cache_key = req.jwt.username+"_"+modelName+"_"+Date.now();
  logRequest(req, "parse", {project:projectName, model: modelName, intent: '', query: req.body.q});
  createInitialCacheRequest(req,cache_key,agentObj);
  request({
    method: "POST",
    uri: process.env.npm_package_config_rasanluendpoint + "/parse",
    body: JSON.stringify(req.body)
    //headers: req.headers
  }, function (error, response, body) {
    if(error){
      console.log(error);
      sendOutput(404, res, error);
    }
    try {
      console.log("rasa_response:+++ "+ body);
      updateCacheWithRasaNluResponse(JSON.parse(body), cache_key);
      updateAndSendRasaResponse(req,cache_key,JSON.parse(body),modelName,projectName,res);
    } catch (err) {
      console.log(err);
      sendOutput(404, res, '{"error" : "Exception caught !!"}');
    }
  });
}

// ----------------------------------------------------------
// Utility functions for middleware
// ----------------------------------------------------------
function finalizeCacheFlushToDbAndRespond(cacheKey, http_code, res, body) {
  nluParseLogCache.get(cacheKey, function( err, nlu_parse_cache ){
    if( !err ){
      if(nlu_parse_cache == undefined){
        // quite logging and return
        console.log("Cache Not Found for key "+ cacheKey);
        return;
      }else{
        if(body != ""){
          if(body.response_text != undefined)nlu_parse_cache.response_text =body.response_text;
          if(body.response_rich != undefined)nlu_parse_cache.response_rich_data =body.response_rich;
          nlu_parse_cache.user_response_time_ms = Date.now() - nlu_parse_cache.createTime;
        }
        db.none('INSERT INTO public.nlu_parse_log(agent_id, request_text, intent_name, entity_data, response_text, response_rich_data, intent_confidence_pct, user_id, user_name,user_response_time_ms,nlu_response_time_ms) values(${agent_id}, ${request_text}, ${intent_name}, ${entity_data}, ${response_text},${response_rich_data}, ${intent_confidence_pct}, ${user_id}, ${user_name},${user_response_time_ms},${nlu_response_time_ms})',nlu_parse_cache)
          .then(function () {
              console.log("Cache inserted into db. Removing it");
              nluParseLogCache.del(cacheKey);
          })
          .catch(function (err) {
            console.log("Exception while inserting Parse log");
            console.log(err);
          });

      }
    }else{
      console.log("Cache Not Found for key "+ cacheKey);
      return;
    }
  });
  //send response
  res.writeHead(http_code, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  });
  if (body !== "") {
    res.write(JSON.stringify(body));
  }
  res.end();
}

function updateCacheWithRasaNluResponse(rasa_response, cacheKey){
  nluParseLogCache.get(cacheKey, function( err, nlu_parse_cache ){
    if( !err ){
      if(nlu_parse_cache == undefined){
        // quite logging and return
        console.log("Cache Not Found for key "+ cacheKey);
        return;
      }else{
        nlu_parse_cache.intent_name = rasa_response.intent.name;
        nlu_parse_cache.entity_data = JSON.stringify(rasa_response.entities);
        nlu_parse_cache.intent_confidence_pct = rasa_response.intent.confidence.toFixed(2)*100;
        nlu_parse_cache.nlu_response_time_ms= Date.now() - nlu_parse_cache.createTime;
        nluParseLogCache.set(cacheKey, nlu_parse_cache);
      }
    }else{
      console.log("Cache Not Found for key "+ cacheKey);
      return;
    }
  });
}

function createInitialCacheRequest(req, cacheKey, agentObj) {
  console.log("Create Initial cache");
  var nluParseReqObj = new Object();
  nluParseReqObj.request_text = req.body.q;
  nluParseReqObj.model_name = req.body.model;
  nluParseReqObj.project_name = req.body.project
  nluParseReqObj.user_id=req.jwt.username;
  nluParseReqObj.user_name=req.jwt.name;
  nluParseReqObj.createTime=Date.now();
  //empty object
  nluParseReqObj.intent_name='';
  nluParseReqObj.entity_data='{}';
  nluParseReqObj.response_text='';
  nluParseReqObj.response_rich_data='{}';
  nluParseReqObj.intent_confidence_pct=0;
  nluParseReqObj.user_response_time_ms=0;
  nluParseReqObj.nlu_response_time_ms=0;
  //set agent_id
  nluParseReqObj.agent_id= agentObj.agent_id;
  //set it in the cache
  nluParseLogCache.set(cacheKey, nluParseReqObj, function(err, success ){
    if( !err && success ){
      console.log( "Object Inserted into Cache" );
    }
  });
}

function sendOutput(http_code, res, body) {
  res.writeHead(http_code, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  });
  if (body !== "") {
    res.write(body);
  }
  res.end();
}

function logRequest(req, type, data) {
  try {
    var obj = {};
    obj.ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    obj.query = req.originalUrl;
    obj.event_type = type;
    obj.event_data = data;

    db.any('insert into nlu_log(ip_address, query, event_type, event_data)' +
      'values(${ip_address}, ${query}, ${event_type}, ${event_data})',
      obj)
      .catch(function (err) {
        console.log(err);
      });
  } catch (err) {
    console.log("Error: " + err);
  }
}

function updateAndSendRasaResponse(req,cacheKey,rasa_response, modelName, projectName,res) {
  db.any(
  'select agents.endpoint_enabled as agent_endpoint, agents.endpoint_url, agents.basic_auth_username,agents.basic_auth_password, '+
  'intents.endpoint_enabled as intent_endpoint, intents.intent_id, intents.intent_name  from agents, intents where agents.agent_name=$2 '+
  ' and intents.intent_name=$1 and intents.agent_id=agents.agent_id', [rasa_response.intent.name,projectName])
  .then(function (data) {
    //check if webhook is configured
    if(data.length>0){
      if(data[0].intent_endpoint == true){
        //post rasa_response to configured webhook
        //Need to add HTTP Basic Authentication
        request.post({
          url: data[0].endpoint_url,
          headers : {
           "Accept": "application/json",
           "Content-Type": "application/json",
           "Authorization" : "Bearer "+req.original_token
         },
         body: JSON.stringify(rasa_response)
        },
        function (error, response, body){
          if(error){
            //Got error from webhook,log and and send original rasa nlu response
            console.log(error);
            rasa_response.response_text = "Configured Webhook threw an error. Check with the service provider.";
            finalizeCacheFlushToDbAndRespond(cacheKey,200, res, rasa_response);
            return;
          }
          try {
              //respond back to client.
              //Expecting API.ai style response element.
              //var response_text={
              //   "speech": "",
              //   "displayText": "",
              //   "dataToClient":{}
              //}
              console.log("Response from Webhook --> " +JSON.stringify(body));
              if(body != undefined){
                rasa_response.response_text = JSON.parse(body).displayText;
                rasa_response.response_rich=JSON.parse(body).dataToClient;
                console.log("Sending Rasa NLU Response + Webhook response");
                finalizeCacheFlushToDbAndRespond(cacheKey,200, res, rasa_response);
              }else{
                console.log("Unknown response from webhook. Respond back with Rasa NLU only");
                finalizeCacheFlushToDbAndRespond(cacheKey,200, res, rasa_response);
              }
            } catch (err) {
              console.log("Error from Webhook. Respond back with Rasa NLU only");
              console.log(err);
              finalizeCacheFlushToDbAndRespond(cacheKey,200, res, rasa_response);
            }
        });
      }else{
        //no webhook, check if there is a static response configured
        db.any('SELECT responses.response_text FROM responses, intents where responses.intent_id = intents.intent_id and intents.intent_id = $1 order by random() LIMIT 1', data[0].intent_id)
        .then(function (data) {
          if (data.length > 0) {
            rasa_response.response_text =data[0].response_text;
            console.log("Sending Rasa NLU Response + Static response configured");
            finalizeCacheFlushToDbAndRespond(cacheKey,200, res, rasa_response);
          } else {
              console.log("No Static response configured. Respond back with Rasa NLU only");
              finalizeCacheFlushToDbAndRespond(cacheKey,200, res, rasa_response);
          }
        })
        .catch(function (err) {
          console.log("Error occurred. Respond back with Rasa NLU only");
          console.log(err);
          finalizeCacheFlushToDbAndRespond(cacheKey,200, res, rasa_response);
        });
      }
    }else{
      console.log("No intent Data found. Respond back with Rasa NLU only");
      finalizeCacheFlushToDbAndRespond(cacheKey,200, res, rasa_response);
    }
  })
}

module.exports = {
  getRasaNluStatus: getRasaNluStatus,
  getRasaNluConfig: getRasaNluConfig,
  getRasaNluVersion: getRasaNluVersion,
  trainRasaNlu: trainRasaNlu,
  parseRequest: parseRequest
};

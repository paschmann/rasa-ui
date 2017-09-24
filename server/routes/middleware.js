var request = require('request');
const db = require('../db/db')

function getRasaNluStatus(req, res, next) {
  console.log("Rasa NLU Status Request -> " + process.env.npm_package_config_rasaserver + "/status");
  request(process.env.npm_package_config_rasaserver + '/status', function (error, response, body) {
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
  console.log("Rasa NLU Config Request -> " + process.env.npm_package_config_rasaserver + "/config");
  request(process.env.npm_package_config_rasaserver + '/config', function (error, response, body) {
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
  console.log("Rasa NLU Version Request -> " + process.env.npm_package_config_rasaserver + "/version");
  request(process.env.npm_package_config_rasaserver + '/version', function (error, response, body) {
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
  console.log("Rasa NLU Train Request -> " + process.env.npm_package_config_rasaserver + "/train");
  request({
    method: "POST",
    uri: process.env.npm_package_config_rasaserver + "/train",
    body: JSON.stringify(req.body),
    headers: req.headers
  }, function (error, response, body) {
    if(error){
      //check for webhook error first. log it and send it
      console.log(error);
      sendOutput(404, res, error);
    }
    try {
      console.log(response);
      sendOutput(200, res, "");
    } catch (err) {
      console.log(err);
      sendOutput(404, res, '{"error" : "Exception caught !!"}');
    }
  });
}

function parseRasaNlu(req, res, next) {
  console.log("Rasa NLU Parse Request -> " + process.env.npm_package_config_rasaserver + "/parse");
  var modelName = req.body.model;
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
  logRequest(req, "parse", {model: modelName, intent: '', query: req.body.q});
  request({
    method: "POST",
    uri: process.env.npm_package_config_rasaserver + "/parse",
    body: JSON.stringify(req.body),
    headers: req.headers
  }, function (error, response, body) {
    if(error){
      console.log(error);
      sendOutput(404, res, error);
    }
    try {
      console.log(body);
      updateAndSendRasaResponse(body,modelName,res);
    } catch (err) {
      console.log(err);
      sendOutput(404, res, '{"error" : "Exception caught !!"}');
    }
  });
}

// ----------------------------------------------------------
// Utility functions for middleware
// ----------------------------------------------------------
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

function updateAndSendRasaResponse(rasa_response, modelName, res) {
  console.log("resp: "+rasa_response);
  db.any(
  'select agents.endpoint_enabled as agent_endpoint, agents.endpoint_url, agents.basic_auth_username,agents.basic_auth_password, '+
  'intents.endpoint_enabled as intent_endpoint, intents.intent_id, intents.intent_name  from agents, intents where agents.agent_name=$2 '+
  ' and intents.intent_name=$1 and intents.agent_id=agents.agent_id', [JSON.parse(rasa_response).intent.name,modelName.split("_")[0]])
  .then(function (data) {
    //check if webhook is configured
    if(data.length>0){
      if(data[0].intent_endpoint == true){
        //post rasa_response to configured webhook
        //Need to add HTTP Basic Authentication
        request.post({
          url: data[0].endpoint_url,
          form: JSON.parse(rasa_response)
        },
        function (error, response, body){
          if(error){
            //check for webhook error first. log it and send it
            console.log(error);
            sendOutput(404, res, error);
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
              var responseBackToClient = JSON.parse(rasa_response);
              responseBackToClient.response_text = JSON.parse(body).displayText;
              responseBackToClient.response_rich=JSON.parse(body).dataToClient;
              console.log("Sending Rasa NLU Response + Webhook response");
              sendOutput(200, res, JSON.stringify(responseBackToClient));
            }else{
              console.log("Unknown response from webhook. Respond back with Rasa NLU only");
              sendOutput(200, res, rasa_response);
            }
          } catch (err) {
            console.log("Error from Webhook. Respond back with Rasa NLU only");
            console.log(err);
            sendOutput(200, res, rasa_response);
          }
        });
      }else{
        //no webhook, check if there is a static response configured
        db.any('SELECT responses.response_text FROM responses, intents where responses.intent_id = intents.intent_id and intents.intent_name = $1 order by random() LIMIT 1', JSON.parse(rasa_response).intent.name)
        .then(function (data) {
          if (data.length > 0) {
          var responseBackToClient = JSON.parse(rasa_response);
          responseBackToClient.response_text =data[0].response_text;
          console.log("Sending Rasa NLU Response + Webhook response");
          sendOutput(200, res, JSON.stringify(responseBackToClient));
          } else {
          console.log("No Static response configured. Respond back with Rasa NLU only");
          sendOutput(200, res, rasa_response);
          }
        })
        .catch(function (err) {
          console.log("Error occurred. Respond back with Rasa NLU only");
          console.log(err);
          sendOutput(200, res, rasa_response);
        });
      }
    }else{
      console.log("No intent Data found. Respond back with Rasa NLU only");
      sendOutput(200, res, rasa_response);
    }
  })
}

module.exports = {
  getRasaNluStatus: getRasaNluStatus,
  getRasaNluConfig: getRasaNluConfig,
  getRasaNluVersion: getRasaNluVersion,
  trainRasaNlu: trainRasaNlu,
  parseRasaNlu: parseRasaNlu
};

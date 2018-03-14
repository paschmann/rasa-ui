var request = require('request');
const db = require('../../db/db')
const NodeCache = require( "node-cache" );
//https://github.com/mpneuried/nodecache
const coreParseLogCache = new NodeCache();
const responseCache = new NodeCache();
var async = require('asyncawait/async');
var await = require('asyncawait/await');


  function getRasaCoreVersion(req, res, next) {
    console.log("Rasa Core Version Request -> " + global.rasacoreendpoint + "/version");
    request(global.rasacoreendpoint + '/version', function (error, response, body) {
      try {
        if (body !== undefined) sendHTTPResponse(200, res, body);
        else sendHTTPResponse(500, res, '{"error" : "Server Error"}');
      } catch (err) {
        console.log(err);
        sendHTTPResponse(500, res, '{"error" : "Exception caught  in Version call to Rasa Core!!"}');
      }
    });
  }

  function restartRasaCoreConversation(req, res, next) {
    console.log("Rasa Core Version Request -> " + global.rasacoreendpoint + "/version");
    var responseBody =rasaCoreRequest(req,"continue",JSON.stringify({"events": [{"event": "restart"}]}));
    console.log("RestartResponse" + JSON.stringify(responseBody));
  }

  function parseRequest(req, res, next, agentObj) {
    var core_url = global.rasacoreendpoint +"/conversations/"+req.jwt.username+ "/parse";
    if(global.coresecuritytoken !=''){
      core_url=core_url+"?token="+global.coresecuritytoken;
    }
    console.log("Rasa Core Parse Request -> " + core_url);
    var cache_key = req.jwt.username+"_"+agentObj.agent_id+"_"+Date.now();
    createInitialCacheRequest(req,cache_key,agentObj);
    postRequestToRasa(core_url, req, cache_key,res,agentObj);
  }

  var postRequestToRasa = async (function (core_url, req, cache_key,res,agentObj){
    //Post Parse Request
    var responseBody = await (rasaCoreRequest(req,"parse",JSON.stringify(req.body)));
    try {
      console.log("Rasa Core Resonse: "+ JSON.stringify(responseBody));
      updateCacheWithRasaCoreResponse(responseBody, cache_key)
      await( getActionResponses(req,responseBody,res,cache_key,agentObj) );
      if (responseBody.next_action != "action_listen"){
          console.log("Starting next actions");
          startPredictingActions(core_url, req, responseBody.next_action,cache_key,res,agentObj);
      }else{
        //got and actionlisten. Send response and flush data.
        sendCacheResponse(200, res,cache_key);
        flushCacheToCoreDb(cache_key);
      }
    } catch (err) {
      console.log(err);
      sendHTTPResponse(500, res, '{"error" : "Exception caught !!"}');
    }
  });

  var  startPredictingActions = async (function (core_url, req, currentAction,cache_key,res,agentObj){
    while (true){
      console.log("Executed this: " + currentAction);
      var responseBody = await (rasaCoreRequest(req,"continue",JSON.stringify({"executed_action":currentAction,"events": []})));
      console.log("Rasa Core Resonse from Continue: "+ JSON.stringify(responseBody));
      updateCacheWithRasaCoreResponse(responseBody, cache_key)
      await(getActionResponses(req,responseBody,res,cache_key,agentObj));
      currentAction = responseBody.next_action;
      if(currentAction === "action_listen"){
        //last loop. done predicting all ACTIONS
        sendCacheResponse(200, res,cache_key);
        flushCacheToCoreDb(cache_key);
        break;
      }
    }
    return;
  });

  function rasaCoreRequest(req,type,reqBody){
    return new Promise((resolve, reject) => {
        request({
          method: "POST",
          uri: global.rasacoreendpoint +"/conversations/"+req.jwt.username+ "/"+type,
          body: reqBody,
          sendImmediately:false
        }, function (error, response, body) {
          if(error){
            console.log(error);
            reject(err); return;
          }
          resolve(JSON.parse(body));
        });
    });
  }

  function addResponseInfoToCache(req,cacheKey,body) {
    var core_parse_cache = coreParseLogCache.get(cacheKey);
    if(core_parse_cache == undefined){
      // quite logging and return
      console.log("Cache Not Found for key "+ cacheKey);
      return;
    }else{
      if(body != ""){
        if(body.response_text != undefined)core_parse_cache.response_text =body.response_text;
        if(body.response_rich != undefined)core_parse_cache.response_rich_data =body.response_rich;
        core_parse_cache.user_response_time_ms = Date.now() - core_parse_cache.createTime;
        var allResponses = responseCache.get(cacheKey);
        if(allResponses== undefined){
          //this is the first response
          allResponses =[];
        }
        //check if wsstream is enabled.
        if(req.body.wsstream){
          //respond back in Websocket
          console.log("wsstream is True. Will send responses in websockets.");
          req.app.get('socket').emit('on:responseMessage', body);
        }

        allResponses.push(body);
        console.log("AllReponses: "+JSON.stringify(allResponses));
        responseCache.set(cacheKey,allResponses);
      }
    }
  }

  function flushCacheToCoreDb(cacheKey){
    var core_parse_cache = coreParseLogCache.get(cacheKey);
    console.log("Object before insert: "+JSON.stringify(core_parse_cache));
    db.none('INSERT INTO public.core_parse_log(agent_id, request_text, action_data, tracker_data, response_text, response_rich_data, '+
       ' user_id, user_name, user_response_time_ms, core_response_time_ms) values(${agent_id}, ${request_text}, '+
       ' ${action_data}::jsonb[], ${tracker_data}::jsonb[], ${response_text}::jsonb[],${response_rich_data}::jsonb[], ${user_id}, ${user_name}, '+
       ' ${user_response_time_ms},${core_response_time_ms})',core_parse_cache)
      .then(function () {
          console.log("Cache inserted into db. Removing it");
          coreParseLogCache.del(cacheKey);
      })
      .catch(function (err) {
        console.log("Exception while inserting Parse log");
        console.log(err);
      });
  }

  /**
  *Send the Body back to the http response.
  */
  function sendCacheResponse(http_code,res,cache_key) {
    res.writeHead(http_code, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
    console.log("Sending Response: "+JSON.stringify(responseCache.get(cache_key)));
    if (responseCache.get(cache_key) !== "") {
      res.write(JSON.stringify(responseCache.get(cache_key)));
    }
    res.end();
  }

  //only for Error cases.
  function sendHTTPResponse(http_code, res, body) {
    res.writeHead(http_code, {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    });
    if (body!=null && body !== "") {
      res.write(body);
    }
    res.end();
  }

  var  getActionResponses = async (function (req,rasa_core_response,res,cacheKey,agentObj) {
    //inspect the rasacore response
    if(rasa_core_response.next_action !='action_listen'){
      if(rasa_core_response.next_action.startsWith("utter_webhook_")){
        //webhook type. Make a call to external webhook and append response
        var webhookResponse =await(fetchActionDetailsFromWebhook(req,rasa_core_response, agentObj));
        if(webhookResponse != undefined){
          rasa_core_response.response_text = JSON.parse(webhookResponse).displayText;
          rasa_response.response_rich=JSON.parse(webhookResponse).dataToClient;
          console.log("Sending Rasa Core Response + Webhook response");
          addResponseInfoToCache(req,cacheKey,rasa_core_response);
        }else{
          console.log("Unknown response from Webhook for action: "+rasa_core_response.next_action);
          rasa_core_response.response_text = "Unknown response from Webhook for action: "+rasa_core_response.next_action;
          addResponseInfoToCache(req,cacheKey,rasa_core_response);
        }
      }else if(rasa_core_response.next_action.startsWith("utter_")){
        //utter Type
        console.log("Got an action of utter type. Fetching info from db");
        var actionRespObj = await( fetchActionDetailsFromDb(rasa_core_response.next_action))
        if(actionRespObj != undefined){
          var slot_to_fill=  actionRespObj.response_text.match(/{(.*)}/ig);
          if(slot_to_fill!=null && slot_to_fill.length>0){
            for(var i=0; i<slot_to_fill.length;i++){
              console.log("Found a slot to fill: "+slot_to_fill[i]);
              var stringForRasa =slot_to_fill[i].substring(1,slot_to_fill[i].length-1);
              var slotVal =rasa_core_response.tracker.slots[stringForRasa];
              console.log("Filling: "+stringForRasa +" with: "+slotVal);
              actionRespObj.response_text = actionRespObj.response_text.replace(slot_to_fill[i], rasa_core_response.tracker.slots[stringForRasa]);
            }
          }
          rasa_core_response.response_text =actionRespObj.response_text;
          rasa_core_response.buttons_info =actionRespObj.buttons_info;
          rasa_core_response.response_image_url =actionRespObj.response_image_url;
          console.log("Sending Configured Response");
          addResponseInfoToCache(req,cacheKey,rasa_core_response);
        }else{
          console.log("Error from Webhook. Sending Core Response");
          rasa_core_response.response_text = "Got an error response from Webhook.";
          addResponseInfoToCache(req,cacheKey,rasa_core_response);
        }
      }else{
        console.log("Unrecognized Actions. Rasa UI can only process 'utter' type and 'utter_webhook' type");
        sendHTTPResponse(500, res, '{"error" : "Unrecognized Actions. Rasa UI can only process \'utter\' type and \'utter_webhook\' type !!"}');
      }
    }else{
      //just keep listening for next message from user
      console.log("Got an action Listen. Will Listen for next message.");
      addResponseInfoToCache(req,cacheKey,rasa_core_response);
    }
  });

  function fetchActionDetailsFromDb(action_name){
    return new Promise((resolve, reject) => {
        db.any('SELECT * FROM ACTIONS, responses where actions.action_id = responses.action_id and actions.action_name=$1 '+
                'order by random() LIMIT 1', action_name)
        .then(function (data) {
          if (data.length > 0) {
            resolve(data[0]);
          }else{
            console.log("Error occurred. Respond back with Rasa NLU only");
            reject(err); return;
          }
        })
        .catch(function (err) {
          console.log("Error occurred. Respond back with Rasa NLU only");
          reject(err); return;
        });
    });
  }

  function fetchActionDetailsFromWebhook(req,rasa_core_response, agentObj){
    return new Promise((resolve, reject) => {
      request.post({
        url: agentObj.endpoint_url,
        headers : {
         "Accept": "application/json",
         "Content-Type": "application/json",
         "Authorization" : "Bearer "+req.original_token
       },
       body: JSON.stringify(rasa_core_response)
      },
      function (error, response, body){
        if(error){
          console.log("Error occurred in Webhook call");
          reject(err); return;
        }else{
          //respond back to client.
          //Expecting API.ai style response element.
          //var response_text={
          //   "speech": "",
          //   "displayText": "",
          //   "dataToClient":{}
          //}
          resolve(body);
          return;
        }
      }
    );
    });
  }

  function updateCacheWithRasaCoreResponse(rasa_core_response, cacheKey){
    var core_parse_cache = coreParseLogCache.get(cacheKey);
    if(core_parse_cache == undefined){
      // quite logging and return
      console.log("Cache Not Found for key "+ cacheKey);
      return;
    }else{
      var actionObj={};
      actionObj.actionName=rasa_core_response.next_action;
      actionObj.actionTimestamp=Date.now();

      core_parse_cache.action_data.push(actionObj);
      core_parse_cache.tracker_data.push(rasa_core_response.tracker);
      //this gets overridden for every action and the last time stamp shows the total time
      core_parse_cache.core_response_time_ms= Date.now() - core_parse_cache.createTime;
      coreParseLogCache.set(cacheKey, core_parse_cache);
    }
  }

  function createInitialCacheRequest(req, cacheKey, agentObj) {
    console.log("Create Initial cache for rasa Core Parse Request");
    var coreParseReqObj = new Object();
    coreParseReqObj.request_text = req.body.q;
    coreParseReqObj.user_id=req.jwt.username;
    coreParseReqObj.user_name=req.jwt.name;
    coreParseReqObj.createTime=Date.now();
    //empty object
    coreParseReqObj.action_data=[];
    coreParseReqObj.tracker_data=[];
    coreParseReqObj.response_text=[];
    coreParseReqObj.response_rich_data=[];
    coreParseReqObj.user_response_time_ms=0;
    coreParseReqObj.core_response_time_ms=0;
    coreParseReqObj.agent_id= agentObj.agent_id;
    //set it in the cache
    coreParseLogCache.set(cacheKey, coreParseReqObj);
  }

  module.exports = {
    parseRequest: parseRequest,
    restartRasaCoreConversation: restartRasaCoreConversation,
    getRasaCoreVersion: getRasaCoreVersion
  };

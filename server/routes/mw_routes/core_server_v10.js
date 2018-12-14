let request = require('request');
let CoreServer = require('./core_server');
let NodeCache = require("node-cache");
const coreParseLogCache = new NodeCache();

class CoreServerV10 extends CoreServer {
    constructor() {
        super()
    }

    restartRasaCoreConversation(req, res) {
        console.log("Rasa Core Restart Request -> " + global.rasacoreendpoint);
        try {
            request({
                method: "POST",
                uri: global.rasacoreendpoint + "/conversations/" + req.jwt.username + "/continue",
                body: JSON.stringify({"events": [{"event": "restart"}]})
            }, function (error, response, body) {
                if (error) {
                    console.log(error);
                    CoreServerV10.sendHTTPResponse(500, res, '{"error" : "Exception caught !!"}');
                    return;
                }
                console.log("Restart Response" + JSON.stringify(body));
                CoreServerV10.sendHTTPResponse(200, res, body);
            });
        } catch (err) {
            console.log(err);
            CoreServerV10.sendHTTPResponse(500, res, '{"error" : "Exception caught !!"}');
        }
    }

    parseRequest(req, res, next, agentObj) {
        let path_core = global.rasacorerequestpath.replace('{id}', req.jwt.username);
        let core_url = global.rasacoreendpoint + path_core;
        if (global.coresecuritytoken !== '') {
            core_url = core_url + "?token=" + global.coresecuritytoken;
        }
        console.log("Rasa Core Parse Request -> " + core_url);
        let cache_key = req.jwt.username + "_" + agentObj.agent_id + "_" + Date.now();
        this.createInitialCacheRequest(req, cache_key, agentObj);
        this.postRequestToRasa(core_url, req, cache_key, res, agentObj);
    }

    async postRequestToRasa(core_url, req, cache_key, res, agentObj) {
        //Post Parse Request
        let responseBody = await (this.rasaCoreRequest(req, "parse", JSON.stringify(req.body)));
        try {
            console.log("First request to Rasa Core. Resonse: " + JSON.stringify(responseBody));
            //updateCacheWithRasaCoreResponse(responseBody, cache_key)
            responseBody.actionTimestamp = Date.now();
            let events = await (this.getActionResponses(req, responseBody, res, cache_key, agentObj));
            if (responseBody.next_action !== "action_listen") {
                this.startPredictingActions(core_url, req, responseBody.next_action, cache_key, res, agentObj, events);
            } else {
                //got and actionlisten. Send response and flush data.
                this.sendCacheResponse(200, res, cache_key);
                this.flushCacheToCoreDb(cache_key);
            }
        } catch (err) {
            console.log(err);
            CoreServerV10.sendHTTPResponse(500, res, '{"error" : "Exception caught !!"}');
        }
    }


    rasaCoreRequest(req, type, reqBody) {
        return new Promise((resolve, reject) => {
            request({
                method: "POST",
                uri: global.rasacoreendpoint + "/conversations/" + req.jwt.username + "/" + type,
                body: reqBody,
                sendImmediately: false
            }, function (error, response, body) {
                if (error) {
                    console.log(error);
                    reject(error);
                    return;
                }
                console.log("After request:" + body);
                resolve(JSON.parse(body));
            });
        });
    }

    addResponseInfoToCache(req, cacheKey, body) {
        let core_parse_cache = coreParseLogCache.get(cacheKey);
        if (core_parse_cache === undefined) {
            // quite logging and return
            console.log("Cache Not Found for key " + cacheKey);
        } else {
            if (body !== "") {
                body.user_response_time_ms = Date.now() - core_parse_cache.createTime;
                core_parse_cache.allResponses.push(body);
                //check if wsstream is enabled.
                if (req.body.wsstream) {
                    //respond back in Websocket
                    console.log("wsstream is True. Will send responses in websockets.");
                    try {
                        var jwt0 = req.original_token.split(".")[0];
                        console.log("Sending to Token : " + jwt0);
                        req.app.get("socketCache").get(jwt0).emit('on:responseMessage', body);
                        console.log("Done Sending response via websocket.");
                    } catch (err) {
                        console.log("Exception while Sending message in WS: ");
                        console.log(err);
                    }
                }
                coreParseLogCache.set(cacheKey, core_parse_cache);
            }
        }
    }

    async startPredictingActions(core_url, req, currentAction, cache_key, res, agentObj, events) {
        while (true) {
            console.log("*********** Executed this ***********: " + currentAction);
            let responseBody = await (this.rasaCoreRequest(req, "continue", JSON.stringify({
                "executed_action": currentAction,
                "events": events
            })));
            console.log("Rasa Core Resonse from Continue: " + JSON.stringify(responseBody));
            //updateCacheWithRasaCoreResponse(responseBody, cache_key)
            responseBody.actionTimestamp = Date.now();
            events = await (this.getActionResponses(req, responseBody, res, cache_key, agentObj));
            currentAction = responseBody.next_action;
            if (currentAction === "action_listen") {
                //last loop. done predicting all ACTIONS
                this.sendCacheResponse(200, res, cache_key);
                this.flushCacheToCoreDb(cache_key);
                break;
            }
        }
    };

    async getActionResponses(req, rasa_core_response, res, cacheKey, agentObj) {
        var events = [];
        return new Promise((resolve, reject) => {
            if (rasa_core_response.next_action !== 'action_listen') {
                if (rasa_core_response.next_action.startsWith("utter_webhook_")) {
                    //webhook type. Make a call to external webhook and append response
                    var webhookResponse = await(this.fetchActionDetailsFromWebhook(req, rasa_core_response, agentObj));
                    console.log("------ Webhook Response for action : " + rasa_core_response.next_action + "------------");
                    console.log(webhookResponse);
                    console.log("------------------------------------------------------------");
                    if (webhookResponse !== undefined) {
                        try {
                            rasa_core_response.response_text = JSON.parse(webhookResponse).displayText;
                            rasa_core_response.response_rich = JSON.parse(webhookResponse).dataToClient;
                            if ("undefined" !== typeof (JSON.parse(webhookResponse).events)) {
                                events = JSON.parse(webhookResponse).events;
                                console.log("-******************---------------" + events + "-------**************-----------");
                            }
                            this.addResponseInfoToCache(req, cacheKey, rasa_core_response);
                            resolve(events);
                        } catch (e) {
                            console.log("Unknown response from Webhook for action: " + rasa_core_response.next_action);
                            console.log("Webhook Response" + webhookResponse);
                            rasa_core_response.response_text = "Please check your Webhook Conenction. Got an error response.";
                            this.addResponseInfoToCache(req, cacheKey, rasa_core_response);
                            reject(e);
                        }
                    } else {
                        console.log("Unknown response from Webhook for action: " + rasa_core_response.next_action);
                        rasa_core_response.response_text = "Unknown response from Webhook for action: " + rasa_core_response.next_action;
                        this.addResponseInfoToCache(req, cacheKey, rasa_core_response);
                        resolve(events);
                    }
                } else if (rasa_core_response.next_action.startsWith("utter_")) {
                    //utter Type
                    let actionRespObj = await(this.fetchActionDetailsFromDb(rasa_core_response.next_action, agentObj.agent_id));
                    console.log("------ Utter Response for action : " + rasa_core_response.next_action + "------------");
                    console.log(actionRespObj);
                    console.log("------------------------------------------------------------");
                    if (actionRespObj !== undefined) {
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
                        this.addResponseInfoToCache(req, cacheKey, rasa_core_response);
                    } else {
                        console.log("Error while Fetching templete for Action.");
                        rasa_core_response.response_text = "No templete configured for this action";
                        this.addResponseInfoToCache(req, cacheKey, rasa_core_response);
                    }
                    resolve(events);
                } else if (rasa_core_response.next_action.startsWith("action_restart")) {
                    console.log("Got an action_restart. Restarting conversation!! ");
                    try {
                        request({
                            method: "POST",
                            uri: global.rasacoreendpoint + "/conversations/" + req.jwt.username + "/continue",
                            body: JSON.stringify({"events": [{"event": "restart"}]})
                        }, function (error, response, body) {
                            if (error) {
                                console.log("Restart Error: " + error);
                            }
                            console.log("Restarted Successfully!! ");
                        });
                    } catch (err) {
                        console.log(err);
                        CoreServerV10.sendHTTPResponse(500, res, '{"error" : "Exception caught !!"}');
                        return;
                    }
                    resolve(events);
                } else {
                    console.log("Unrecognized Actions. Rasa UI can only process 'utter' type and 'utter_webhook' type. Got: " + rasa_core_response.next_action + " . Logging and skipping it.");
                    resolve(events);
                }
            } else {
                //just keep listening for next message from user
                console.log("Got an action Listen. Will Listen for next message.");
                this.addResponseInfoToCache(req, cacheKey, rasa_core_response);
                resolve(events);
            }
        });
    };

    /**
     *Send the Body back to the http response if any one is waiting for it.
     */
    sendCacheResponse(http_code, res, cache_key) {
        res.writeHead(http_code, {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        });
        console.log("------ Responding in HTTP with below body ------");
        console.log(JSON.stringify(coreParseLogCache.get(cache_key)));
        console.log("------------------------------------------------------");
        if (coreParseLogCache.get(cache_key) !== "") {
            res.write(JSON.stringify(coreParseLogCache.get(cache_key)));
        }
        res.end();
    }


    fetchActionDetailsFromDb(action_name, agent_id) {
        return new Promise((resolve, reject) => {
            db.any('SELECT * FROM ACTIONS, responses where actions.action_id = responses.action_id and actions.action_name=$1 and actions.agent_id=$2 '+
                ' order by random() LIMIT 1', [action_name, agent_id])
                .then(function (data) {
                    if (data.length > 0) {
                        resolve(data[0]);
                    } else {
                        console.log("Error occurred. Respond back with Rasa NLU only");
                    }
                })
                .catch(function (err) {
                    console.log("Error occurred. Respond back with Rasa NLU only");
                    reject(err);
                });
        });
    }

    fetchActionDetailsFromWebhook(req, rasa_core_response, agentObj) {
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
                        reject(error);
                    } else {
                        //respond back to client.
                        //Expecting API.ai style response element.
                        //var response_text={
                        //   "speech": "",
                        //   "displayText": "",
                        //   "dataToClient":{},
                        //   "events":[]
                        //}
                        resolve(body);
                    }
                }
            );
        });
    }

    createInitialCacheRequest(req, cacheKey, agentObj) {
        console.log("Create Initial cache for rasa Core Parse Request");

        let coreParseReqObj = {};
        coreParseReqObj.request_text = req.body.q;
        coreParseReqObj.user_id = req.jwt.username;
        coreParseReqObj.user_name = req.jwt.name;
        coreParseReqObj.createTime = Date.now();
        coreParseReqObj.agent_id = agentObj.agent_id;

        //empty object
        // allresponses. push(response with action and tracker details.)
        coreParseReqObj.allResponses = [];

        /*  coreParseReqObj.action_data=[];
          coreParseReqObj.tracker_data=[];
          coreParseReqObj.response_text=[];
          coreParseReqObj.response_rich_data=[];
          coreParseReqObj.user_response_time_ms=0;
          coreParseReqObj.core_response_time_ms=0;
      */
        //set it in the cache
        coreParseLogCache.set(cacheKey, coreParseReqObj);
    }

    async flushCacheToCoreDb(cacheKey) {
        let core_parse_cache = coreParseLogCache.get(cacheKey);
        if (core_parse_cache == null || core_parse_cache.allResponses == null) return;
        for (let i = 0; i < core_parse_cache.allResponses.length; i++) {
            //insert a message
            let responseObj = core_parse_cache.allResponses[i];

            let message = {};
            message.agent_id = core_parse_cache.agent_id;
            message.user_id = core_parse_cache.user_id;
            message.user_name = core_parse_cache.user_name;
            message.message_text = responseObj.response_text;
            message.message_rich = responseObj.response_rich;
            message.user_message_ind = false;

            let corelogData = {};
            corelogData.action_name = responseObj.next_action;
            corelogData.slots_data = responseObj.tracker.slots;
            corelogData.user_response_time_ms = responseObj.user_response_time_ms;
            corelogData.core_response_time_ms = responseObj.actionTimestamp - core_parse_cache.createTime;

            let nluLogData = {};
            nluLogData.intent_name = responseObj.tracker.latest_message.intent.name;
            nluLogData.entity_data = JSON.stringify(responseObj.tracker.latest_message.entities);
            nluLogData.intent_confidence_pct = responseObj.tracker.latest_message.intent.confidence.toFixed(2) * 100;
            nluLogData.user_response_time_ms = responseObj.user_response_time_ms;
            nluLogData.nlu_response_time_ms = responseObj.actionTimestamp - core_parse_cache.createTime;

            await (this.insertMessageToDB(message, corelogData, nluLogData));
        }
    };

    async insertMessageToDB(message, corelogData, nlulogData) {
        let context = this;
        db.any('insert into public.messages(agent_id, user_id, user_name, message_text, message_rich, user_message_ind)' +
            ' values(${agent_id}, ${user_id},${user_name}, ${message_text}, ${message_rich}, ${user_message_ind}) RETURNING messages_id', message)
            .then(function (response) {
                console.log("Message Inserted with Id: " + response[0].messages_id);
                corelogData.messages_id = response[0].messages_id;
                nlulogData.messages_id = response[0].messages_id;
                context.insertCoreParseLogDB(corelogData);
                context.insertNLUParseLogDB(nlulogData);
            }).catch(function (err) {
            console.log("Exception while inserting inserting to DB");
            console.log(err);
        });

    };

    async insertCoreParseLogDB(corelogData) {
        db.none('INSERT INTO public.core_parse_log(messages_id,action_name, slots_data, user_response_time_ms, core_response_time_ms) values( ' +
            ' ${messages_id}, ${action_name}, ${slots_data}, ${user_response_time_ms},${core_response_time_ms})', corelogData)
            .then(function () {
                console.log("Cache inserted into Core db.");
            })
            .catch(function (err) {
                console.log("Exception while inserting Core Parse log");
                console.log(err);
            });
    };

    async insertNLUParseLogDB(nlulogData) {
        db.none('INSERT INTO public.nlu_parse_log(messages_id,intent_name, entity_data, intent_confidence_pct, user_response_time_ms, nlu_response_time_ms) VALUES (${messages_id}, ${intent_name}, ${entity_data}, ${intent_confidence_pct},${user_response_time_ms},${nlu_response_time_ms})', nlulogData)
            .then(function () {
                console.log("Cache inserted into NLU db");
            })
            .catch(function (err) {
                console.log("Exception while inserting NLU Parse log");
                console.log(err);
            });
    };

    addResponseInfoToCache(req, cacheKey, body) {
        let core_parse_cache = coreParseLogCache.get(cacheKey);
        if (core_parse_cache === undefined) {
            // quite logging and return
            console.log("Cache Not Found for key " + cacheKey);
        } else {
            if (body !== "") {
                body.user_response_time_ms = Date.now() - core_parse_cache.createTime;
                core_parse_cache.allResponses.push(body);
                //check if wsstream is enabled.
                if (req.body.wsstream) {
                    //respond back in Websocket
                    console.log("wsstream is True. Will send responses in websockets.");
                    try {
                        let jwt0 = req.original_token.split(".")[0];
                        console.log("Sending to Token : " + jwt0);
                        req.app.get("socketCache").get(jwt0).emit('on:responseMessage', body);
                        console.log("Done Sending response via websocket.");
                    } catch (err) {
                        console.log("Exception while Sending message in WS: ");
                        console.log(err);
                    }
                }
                coreParseLogCache.set(cacheKey, core_parse_cache);
            }
        }
    }
}

module.exports = CoreServerV10;
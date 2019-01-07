var request = require('request');
const db = require('../db/db')
const messages = require('../db/messages')
const NodeCache = require( "node-cache" );
const core_router = require( "./mw_routes/core_router" );
const nlu_router = require( "./mw_routes/nlu_router" );
//https://github.com/mpneuried/nodecache
const agentCache = new NodeCache();
const {
    CoreServerV10,
    CoreServerV12
} = require('./mw_routes');

/*
* Middleware for parse Request. All other requests go to specific modules.
*/
function parseRasaRequest(req, res, next) {
  console.log("Got to parse middleware");
  var agentObj;
  if(req.body.q == ''){
    console.log("No Query in the RASA Parse Request.");
    sendOutput(500, res, '{"error" : "No Query in the Rasa Parse Request !!"}');
    return;
  }
  //attempt to get it from the cache: Sync call
  var agent_name = req.body.project;
  console.log(agent_name);
  if (agent_name != undefined) {
    agentObj = agentCache.get(agent_name);
  }

  var messageObj = new Object();
  messageObj.user_id = req.jwt.username;
  messageObj.user_name = req.jwt.name;
  messageObj.message_text = req.body.q;
  messageObj.message_rich = null
  messageObj.user_message_ind = true;

  if (agentObj == undefined && agent_name == undefined) {;
    routeRequest(req, res, next, messageObj);
  } else if (agentObj == undefined) {
    console.log("Cache Not Found for Agent. Making a DB call for: "+ agent_name);
    db.any('SELECT agent_id, agent_name, endpoint_enabled, endpoint_url, basic_auth_username, '+
    ' basic_auth_password, rasa_core_enabled from agents where agent_name = $1', agent_name).then(function (data) {
      try {
        console.log("Agent Information: " + JSON.stringify(data));
        //cache Agents only if Env variable is set.
        if(global.cacheagents == "true"){
            //add this to the cache
            console.log("global.cacheagents is true. Setting Agent in cache");
            agentCache.set(agent_name, data[0]);
        }
        if (data.length > 0) {
          //insert user_message into message table.
          messageObj.agent_id = data[0].agent_id;
        } else {
          //messageObj.agent_id = ;
        }
        messages.createMessage(messageObj);
        //route the req to appropriate router.
        routeRequest(req, res, next, data[0]);
      } catch (err) {
          console.log(err);
      }
    }).catch(function(err){
      console.log("DB Error while getting agent details." );
      console.log(err);
    });
  } else {
    //insert user_message into message table.
    console.log("parseRasaRequest");
    messageObj.agent_id = agentObj.agent_id;
    routeRequest(req, res, next, agentObj);
  }
}

async function routeRequest(req, res, next, agentObj){
    console.log("routeRequest");
    if(agentObj !== undefined && agentObj.rasa_core_enabled){
      let rasaVersion = JSON.parse(await core_router.getRasaCoreVersion(req, res, next)).version.split(".");
      let majorVersion = parseInt(rasaVersion[0]);
      let minorVersion = parseInt(rasaVersion[1]);
      let coreRouter;
      if(majorVersion===0 && minorVersion < 11) {
        coreRouter = new CoreServerV10();
      } else {
        coreRouter = new CoreServerV12();
      }
      coreRouter.parseRequest(req, res, next, agentObj)
    } else{
      nlu_router.parseRequest(req, res, next, agentObj);
    }
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
module.exports = {
  parseRasaRequest: parseRasaRequest
};

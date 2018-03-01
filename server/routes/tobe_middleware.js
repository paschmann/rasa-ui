var request = require('request');
const db = require('../db/db')
const NodeCache = require( "node-cache" );
const core_router = require( "./mw_routes/core_router" );
const nlu_router = require( "./mw_routes/nlu_router" );
//https://github.com/mpneuried/nodecache
const agentCache = new NodeCache();

function parseRasaRequest(req, res, next) {
  console.log("Got tot the tobe middleware");
  if(req.body.q == ''){
    console.log("No Query in the RASA Parse Request.");
    sendOutput(500, res, '{"error" : "No Query in the Rasa Parse Request !!"}');
    return;
  }
  //attempt to get it from the cache: Sync call
  var agent_name=req.body.project;
  agentObj = agentCache.get(agent_name);
  if(agentObj == undefined ){
    console.log("Cache Not Found for Agent. Making a DB call for: "+ agent_name);
    db.any('SELECT agent_id, agent_name, endpoint_enabled, endpoint_url, basic_auth_username, '+
    ' basic_auth_password, rasa_core_enabled from agents where agent_name = $1', agent_name).then(function (data) {
      console.log("Agent Information: " + JSON.stringify(data));
      //cache Agents only if Env variable is set.
      if(process.env.npm_package_config_cacheagents){
          //add this to the cache
          agentCache.set(agent_name, data[0]);
      }
      routeRequest(req, res, next, data[0]);
    }).catch(function(err){
      console.log("DB Error while getting agent details." );
      console.log(err);
    });
  }else{
    routeRequest(req, res, next, agentObj);
  }
}

function routeRequest(req, res, next, agentObj){
    if(agentObj.rasa_core_enabled){
      core_router.parseRequest(req, res, next, agentObj);
    }else{
      nlu_router.parseRequest(req, res, next, agentObj);
    }
}

module.exports = {
  parseRasaRequest: parseRasaRequest
};

const db = require("./db");
const logger = require("../util/logger");

function getSingleIntent(req, res, next) {
  var intentID = parseInt(req.params.intent_id);
  db.one("select * from intents where intent_id = $1", intentID)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getAgentIntents(req, res, next) {
  logger.winston.info("intents.getAgentIntents");
  var AgentID = parseInt(req.params.agent_id);
  db.any("select * from intents where agent_id = $1", AgentID)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getUniqueIntents(req, res, next) {
  logger.winston.info("intents.getUniqueIntents");
  var IntentID = parseInt(req.params.intent_id);
  db.any("select * from unique_intent_entities where intent_id = $1", IntentID)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function createAgentIntent(req, res, next) {
  logger.winston.info("intents.createAgentIntent");
  db.any(
    "insert into intents(agent_id, intent_name)" +
      "values(${agent_id}, ${intent_name}) RETURNING intent_id",
    req.body
  )
    .then(function(resp) {
      res.status(200).json({
        status: "success",
        message: "Inserted",
        agent_id: req.body.agent_id
      });
    })
    .catch(function(err) {
      return next(err);
    });
}

function removeIntent(req, res, next) {
  logger.winston.info("intents.removeIntent");
  var intentID = parseInt(req.params.intent_id);
  db.result("delete from intents where intent_id = $1", intentID)
    .then(function(result) {
      /* jshint ignore:start */
      res.status(200).json({
        status: "success",
        message: "Removed ${result.rowCount}"
      });
      /* jshint ignore:end */
    })
    .catch(function(err) {
      return next(err);
    });
}

function updateIntent(req, res, next) {
  logger.winston.info("intents.updateIntentEndpoint");
  db.none(
    "update intents set intent_name=$2,endpoint_enabled=$3 where intent_id=$1",
    [
      parseInt(req.params.intent_id),
      req.body.intent_name,
      req.body.endpoint_enabled
    ]
  )
    .then(function() {
      res.status(200).json({
        status: "success",
        message: "Updated Intent"
      });
    })
    .catch(function(err) {
      return next(err);
    });
}

module.exports = {
  getAgentIntents: getAgentIntents,
  createAgentIntent: createAgentIntent,
  getSingleIntent: getSingleIntent,
  removeIntent: removeIntent,
  getUniqueIntents: getUniqueIntents,
  updateIntent: updateIntent
};

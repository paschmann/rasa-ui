var express = require("express");
var router = express.Router();

var agents = require("../db/agents");
var intents = require("../db/intents");
var actions = require("../db/actions");
var expressions = require("../db/expressions");
var parameters = require("../db/parameters");
var entities = require("../db/entities");
var regex = require("../db/regex");
var synonyms = require("../db/synonyms");
var variants = require("../db/variants");
var settings = require("../db/settings");
var responses = require("../db/responses");
var messages = require("../db/messages");
var middleware = require("./middleware");
var health = require("./health");
var rasa_events = require("./rasa_events");
var core_router = require("./mw_routes/core_router");
var nlu_router = require("./mw_routes/nlu_router");
var auth = require("./auth");
var logs = require("../db/logs");

router.get("/agents", agents.getAllAgents);
router.get("/agents/:agent_id", agents.getSingleAgent);
router.post("/agents", agents.createAgent);
router.put("/agents/:agent_id", agents.updateAgent);
router.post("/agentStory", agents.updateAgentStory);
router.delete("/agents/:agent_id", agents.removeAgent);
router.post("/agents/upload", agents.uploadAgentFromFile);

router.get("/actions/:action_id", actions.getSingleAction);
router.put("/actions/:action_id", actions.updateAction);
router.delete("/actions/:action_id", actions.removeAction);
router.post("/actions", actions.createAgentAction);
router.get("/agents/:agent_id/actions", actions.getAgentActions);

router.get("/agents/:agent_id/intents", intents.getAgentIntents);
router.get("/intents/:intent_id", intents.getSingleIntent);
router.get(
  "/intents/:intent_id/unique_intent_entities",
  intents.getUniqueIntents
);
router.put("/intents/:intent_id", intents.updateIntent);

router.post("/agents/:agent_id/intents", intents.createAgentIntent);
router.post("/intents", intents.createAgentIntent);
router.delete("/intents/:intent_id", intents.removeIntent);

router.get("/intent_expressions", expressions.getIntentExpressionQuery); //Used for training

router.get("/intents/:intent_id/expressions", expressions.getIntentExpressions);
router.get("/expressions/:expression_id", expressions.getSingleExpression);
router.post("/expressions", expressions.createIntentExpression);
router.delete("/expressions/:expression_id", expressions.removeExpression);

router.get("/expression_parameters", parameters.getExpressionParametersQuery); //Used for training

router.get(
  "/expresions/:expression_id/parameters",
  parameters.getExpressionParameters
);
router.get("/parameters/:parameter_id", parameters.getSingleParameter);
router.get("/intent/:intent_id/parameters", parameters.getIntentParameters);
router.post("/parameters", parameters.createExpressionParameter);
router.put("/parameters/:parameter_id", parameters.updateParameter);
router.delete("/parameters/:parameter_id", parameters.removeParameter);

router.get("/entities", entities.getAllEntities);
router.get("/entities/agent/:agent_id", entities.getAllEntitiesForAgent);
router.get("/entities/:entity_id", entities.getSingleEntity);
router.post("/entities", entities.createEntity);
router.put("/entities/:entity_id", entities.updateEntity);
router.delete("/entities/:entity_id", entities.removeEntity);

router.get("/agent/:agent_id/regex", regex.getAgentRegex);
router.get("/regex/:regex_id", regex.getSingleRegex);
router.post("/regex", regex.createRegex);
router.put("/regex/:regex_id", regex.updateRegex);
router.delete("/regex/:regex_id", regex.removeRegex);

router.get("/agent/:agent_id/synonyms", synonyms.getAgentSynonyms);
router.get("/synonyms/:synonym_id", synonyms.getSingleSynonym);
router.post("/synonyms", synonyms.createAgentSynonym);
router.delete("/synonyms/:synonym_id", synonyms.removeSynonym);

router.get("/synonyms_variants/:synonyms_id", variants.getSynonymsVariants); //Used for training

router.get("/synonyms/:synonym_id/variants", variants.getSynonymVariants);
router.get("/variants/:synonym_variant_id", variants.getSingleVariant);
router.get("/synonymvariants", variants.getAllSynonymVariants);
router.post("/variants", variants.createVariant);
router.delete("/variants/:synonym_variant_id", variants.removeVariant);
router.delete("/synonyms/:synonym_id/variants", variants.removeSynonymVariants);

router.get("/settings", settings.getSettings);
router.get("/settings/:setting_name", settings.getSingleSetting);
router.put("/settings/:setting_name", settings.updateSetting);

router.get("/actionresponse/:action_id", responses.getActionResponses);
router.post("/actionresponse", responses.createActionResponse);

router.get("/response/:intent_id", responses.getIntentResponses);
router.post("/response", responses.createIntentResponse);
router.delete("/response/:response_id", responses.removeResponse);

router.get("/rndmresponse", responses.getRandomResponseForIntent);
router.get("/action_responses", responses.getActionResponsesQuery);

router.get("/nlu_log/:query", logs.getLogs);
router.get("/intent_usage_by_day", logs.getIntentUsageByDay);
router.get("/intent_usage_total", logs.getIntentUsageTotal);
router.get("/request_usage_total", logs.getRequestUsageTotal);
router.get("/avg_intent_usage_by_day", logs.getAvgIntentUsageByDay);
router.get("/nlu_parse_log/:agent_id", logs.getNluParseLogByAgent);
router.get("/agentsByIntentConfidencePct", logs.getAgentsByIntentConfidencePct);
router.get("/intentsMostUsed", logs.getIntentsMostUsed);
router.get(
  "/avgNluResponseTimesLast30Days",
  logs.getAvgNluResponseTimesLast30Days
);
router.get(
  "/avgUserResponseTimesLast30Days",
  logs.getAvgUserResponseTimesLast30Days
);
router.get("/activeUserCountLast12Months", logs.getActiveUserCountLast12Months);
router.get("/activeUserCountLast30Days", logs.getActiveUserCountLast30Days);

//rasa nlu api's
router.get("/rasa/status", nlu_router.getRasaNluStatus);
router.get("/rasa/config", nlu_router.getRasaNluConfig);
router.get("/rasa/version", nlu_router.getRasaNluVersion);
router.post("/rasa/train", nlu_router.trainRasaNlu);

//common middleware for parse
router.post("/rasa/parse", middleware.parseRasaRequest);

//rasa core API
router.post("/rasa/restart", core_router.restartRasaCoreConversation);

//rasa core events logging API
router.post("/rasa/logEvents", rasa_events.logEventsRoute);

//messages api
router.get("/agent/:agent_id/messages", messages.getUniqueUsersList);
router.get(
  "/agent/:agent_id/recent9UniqueUsersList",
  messages.getRecent9UniqueUsersList
);
router.post("/messages/list", messages.getMessagesListByUser);
router.put("/messages/:messages_id", messages.updateMessage);
router.get("/messages/:messages_id", messages.getMessageDetails);
router.delete("/messages/:message_id/entities", messages.deleteMessageEntities);
router.put(
  "/messages/:message_id/entities/:entity_id",
  messages.updateMessageEntities
);
router.post("/messages/:message_id/entities", messages.addMessageEntities);

//authentication js
router.post("/auth", auth.authenticateUser);
router.post("/authclient", auth.authenticateClient);

router.get("/health", health.liveness);
module.exports = router;

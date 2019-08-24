const express = require('express');
const router = express.Router();

const agents = require('../db/agents');
const intents = require('../db/intents');
const actions = require('../db/actions');
const expressions = require('../db/expressions');
const parameters = require('../db/parameters');
const entities = require('../db/entities');
const regex = require('../db/regex');
const synonyms = require('../db/synonyms');
const variants = require('../db/variants');
const settings = require('../db/settings');
const responses = require('../db/responses');
const messages = require('../db/messages');

const nlu_router = require('./mw_routes/nlu_router');
const auth = require('./auth');
const logs = require('../db/logs');
 
//routes agent
router.get('/agents', agents.getAllAgents);
router.get('/agents/:agent_id', agents.getSingleAgent);
router.post('/agents', agents.createAgent);
router.put('/agents/:agent_id', agents.updateAgent);
router.post('/agentStory', agents.updateAgentStory);
router.delete('/agents/:agent_id', agents.removeAgent);
router.post('/agents/upload', agents.uploadAgentFromFile);
//routes action
router.get('/actions/:action_id', actions.getSingleAction);
router.put('/actions/:action_id', actions.updateAction);
router.delete('/actions/:action_id', actions.removeAction);
router.post('/actions', actions.createAgentAction);
router.get('/agents/:agent_id/actions', actions.getAgentActions);
//routes intents
router.get('/agents/:agent_id/intents', intents.getAgentIntents);
router.get('/intents/:intent_id', intents.getSingleIntent);
router.put('/intents/:intent_id', intents.updateIntent);
router.post('/agents/:agent_id/intents', intents.createAgentIntent);
router.post('/intents', intents.createAgentIntent);
router.delete('/intents/:intent_id', intents.removeIntent);
//routes expression
router.get('/intent_expressions', expressions.getIntentExpressionQuery); //Used for training
router.get('/intents/:intent_id/expressions', expressions.getIntentExpressions);
router.get('/expressions/:expression_id', expressions.getSingleExpression);
router.put('/expressions/:expression_id', expressions.updateExpression);
router.post('/expressions', expressions.createIntentExpression);
router.delete('/expressions/:expression_id', expressions.removeExpression);
//routes parameters
router.get('/expression_parameters', parameters.getExpressionParametersQuery); //Used for training
router.get('/expresions/:expression_id/parameters', parameters.getExpressionParameters);
//router.get('/parameters/:parameter_id', parameters.getSingleParameter);
router.get('/intent/:intent_id/parameters', parameters.getIntentParameters);
router.post('/parameters', parameters.createExpressionParameter);
router.put('/parameters/:parameter_id', parameters.updateParameter);
router.delete('/parameters/:parameter_id', parameters.removeExpressionParameter);
//routes entities
router.get('/entities', entities.getAllEntities);
router.get('/entities/agent/:agent_id', entities.getAllEntitiesForAgent);
router.get('/entities/:entity_id', entities.getSingleEntity);
router.post('/entities', entities.createEntity);
router.put('/entities/:entity_id', entities.updateEntity);
router.delete('/entities/:entity_id', entities.removeEntity);
//routes regex
router.get('/agent/:agent_id/regex', regex.getAgentRegex);
router.get('/regex/:regex_id', regex.getSingleRegex);
router.post('/regex', regex.createRegex);
router.put('/regex/:regex_id', regex.updateRegex);
router.delete('/regex/:regex_id', regex.removeRegex);
//routes synonymes
router.get('/agent/:agent_id/synonyms', synonyms.getAgentSynonyms);
router.get('/synonyms/:synonym_id', synonyms.getSingleSynonym);
router.post('/synonyms', synonyms.createAgentSynonym);
router.delete('/synonyms/:synonym_id', synonyms.removeSynonym);
//routes variants
router.get('/synonyms_variants/:synonyms_id', variants.getSynonymsVariants); //Used for training
router.get('/synonyms/:synonym_id/variants', variants.getSynonymVariants);
router.get('/variants/:synonym_variant_id', variants.getSingleVariant);
router.get('/synonymvariants', variants.getAllSynonymVariants);
router.post('/variants', variants.createVariant);
router.delete('/variants/:synonym_variant_id', variants.removeVariant);
router.delete('/synonyms/:synonym_id/variants', variants.removeSynonymVariants);
//routes settings
router.get('/settings', settings.getSettings);
router.get('/settings/:setting_name', settings.getSingleSetting);
router.put('/settings/:setting_name', settings.updateSetting);
//routes actions responses
router.get('/actionresponse/:action_id', responses.getActionResponses);
router.post('/actionresponse', responses.createActionResponse);
//routes intent responses
router.get('/response/:intent_id', responses.getIntentResponses);
router.post('/response', responses.createIntentResponse);
router.delete('/response/:response_id', responses.removeResponse);
router.get('/rndmresponse', responses.getRandomResponseForIntent);
router.get('/action_responses', responses.getActionResponsesQuery);
//routes logs
router.get('/nlu_log/:query', logs.getLogs);
router.get('/intent_usage_by_day', logs.getIntentUsageByDay);
router.get('/intent_usage_total', logs.getIntentUsageTotal);
router.get('/request_usage_total', logs.getRequestUsageTotal);
router.get('/total_log_entries', logs.getTotalLogEntries);
router.get('/avg_intent_usage_by_day', logs.getAvgIntentUsageByDay);
router.get('/nlu_parse_log/:agent_id', logs.getNluParseLogByAgent);
router.get('/agentsByIntentConfidencePct/:agent_id', logs.getAgentsByIntentConfidencePct);
router.get('/intentsMostUsed/:agent_id', logs.getIntentsMostUsed);
router.get('/avgNluResponseTimesLast30Days', logs.getAvgNluResponseTimesLast30Days);
router.get('/avgUserResponseTimesLast30Days', logs.getAvgUserResponseTimesLast30Days);
router.get('/activeUserCountLast12Months', logs.getActiveUserCountLast12Months);
router.get('/activeUserCountLast30Days', logs.getActiveUserCountLast30Days);
//rasa nlu api's
router.get('/rasa/status', nlu_router.getRasaNluStatus);
router.get('/rasa/url', nlu_router.getRasaNluEndpoint);
//router.get('/rasa/config', nlu_router.getRasaNluConfig);
router.get('/rasa/version', nlu_router.getRasaNluVersion);
router.post('/model/train', nlu_router.trainRasaNlu);
router.delete('/rasa/models', nlu_router.unloadRasaModel);
//common middleware for parse
router.post('/rasa/model/parse', nlu_router.parseRequest);

//rasa core events logging API
//messages api
router.get('/agent/:agent_id/messages', messages.getUniqueUsersList);
router.get('/agent/:agent_id/recent9UniqueUsersList', messages.getRecent9UniqueUsersList);
router.post('/messages/list', messages.getMessagesListByUser);
router.put('/messages/:messages_id', messages.updateMessage);
router.get('/messages/:messages_id', messages.getMessageDetails);
router.delete('/messages/:message_id/entities', messages.deleteMessageEntities);
router.put('/messages/:message_id/entities/:entity_id', messages.updateMessageEntities);
router.post('/messages/:message_id/entities', messages.addMessageEntities);
//authentication js
router.post('/auth', auth.authenticateUser);
router.post('/authclient', auth.authenticateClient);

module.exports = router;

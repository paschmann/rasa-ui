const express = require('express');
const router = express.Router();

const bots = require('../db/bots');
const intents = require('../db/intents');
const expressions = require('../db/expressions');
const parameters = require('../db/parameters');
const entities = require('../db/entities');
const regex = require('../db/regex');
const synonyms = require('../db/synonyms');
const variants = require('../db/variants');
const settings = require('../db/settings');
const responses = require('../db/responses');
const models = require('../db/models');
const stories = require('../db/stories');
const actions = require('../db/actions');
const conversations = require('../db/conversations');

const rasa_router = require('./rasa_router');
const auth = require('./auth');
const logs = require('../db/logs');

//routes model
router.get('/models/:bot_id', models.getBotModels);
router.delete('/models', models.removeModel);
router.post('/models', models.createModel);
 
//routes bot
router.get('/bots', bots.getAllBots);
router.get('/bots/:bot_id', bots.getSingleBot);
router.post('/bots', bots.createBot);
router.put('/bots/:bot_id', bots.updateBot);
router.delete('/bots/:bot_id', bots.removeBot);
router.post('/bots/upload', bots.uploadBotFromFile);

//routes intents
router.get('/bots/:bot_id/intents', intents.getBotIntents);
router.get('/intents/:intent_id', intents.getSingleIntent);
router.put('/intents/:intent_id', intents.updateIntent);
router.post('/intents', intents.createBotIntent);
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
router.get('/intent/:intent_id/parameters', parameters.getIntentParameters);
router.post('/parameters', parameters.createExpressionParameter);
router.put('/parameters/:parameter_id', parameters.updateParameter);
router.delete('/parameters/:parameter_id', parameters.removeExpressionParameter);

//routes entities
//router.get('/entities', entities.getAllEntities); //NeededTODO: Needed?
router.get('/entities/bot/:bot_id', entities.getAllEntitiesForBot);
router.get('/entities/:entity_id', entities.getSingleEntity);
router.post('/entities', entities.createEntity);
router.put('/entities/:entity_id', entities.updateEntity);
router.delete('/entities/:entity_id', entities.removeEntity);

//routes regex
router.get('/bot/:bot_id/regex', regex.getBotRegex);
router.get('/regex/:regex_id', regex.getSingleRegex);
router.post('/regex', regex.createRegex);
router.put('/regex/:regex_id', regex.updateRegex);
router.delete('/regex/:regex_id', regex.removeRegex);

//routes synonymes
router.get('/bot/:bot_id/synonyms', synonyms.getBotSynonyms);
router.get('/synonyms/:synonym_id', synonyms.getSingleSynonym);
router.post('/synonyms', synonyms.createBotSynonym);
router.delete('/synonyms/:synonym_id', synonyms.removeSynonym);

//routes variants
router.get('/synonyms_variants/:synonyms_id', variants.getSynonymsVariants); //Used for training
router.get('/synonyms/:synonym_id/variants', variants.getSynonymVariants);
router.get('/variants/:synonym_variant_id', variants.getSingleVariant);
router.post('/variants', variants.createVariant);
router.delete('/variants/:synonym_variant_id', variants.removeVariant);
router.delete('/synonyms/:synonym_id/variants', variants.removeSynonymVariants);

//routes settings
router.get('/settings', settings.getSettings);
router.get('/settings/:setting_name', settings.getSingleSetting);
router.put('/settings/:setting_name', settings.updateSetting);

//routes for stories
router.get('/stories/:bot_id', stories.getAllBotStories);
router.post('/stories', stories.createStory);
router.put('/stories', stories.updateStory);
router.delete('/stories', stories.removeStory);
router.get('/stories/:bot_id/search', stories.searchStoryAttributes);

//routes responses
router.post('/response', responses.createResponse);
router.put('/response', responses.updateResponse);
router.delete('/response', responses.deleteResponse);

//routes actions
router.get('/actions', actions.getBotActionsAndResponses);
router.post('/actions', actions.createAction);
router.delete('/actions', actions.removeAction);

//routes logs
router.get('/nlu_log/:query', logs.getLogs);
router.get('/intent_usage_by_day', logs.getIntentUsageByDay);
router.get('/intent_usage_total', logs.getIntentUsageTotal);
router.get('/request_usage_total', logs.getRequestUsageTotal);
router.get('/total_log_entries', logs.getTotalLogEntries);
router.get('/avg_intent_usage_by_day', logs.getAvgIntentUsageByDay);
router.get('/nlu_parse_log/:bot_id', logs.getNluParseLogByBot);
router.get('/botsByIntentConfidencePct/:bot_id', logs.getBotsByIntentConfidencePct);
router.get('/intentsMostUsed/:bot_id', logs.getIntentsMostUsed);
router.get('/avgNluResponseTimesLast30Days', logs.getAvgNluResponseTimesLast30Days);
router.get('/avgUserResponseTimesLast30Days', logs.getAvgUserResponseTimesLast30Days);
router.get('/activeUserCountLast12Months', logs.getActiveUserCountLast12Months);
router.get('/activeUserCountLast30Days', logs.getActiveUserCountLast30Days);

//Conversations
router.get('/conversations/:bot_id', conversations.getConversations);
router.post('/conversations', conversations.createConversation);
router.delete('/conversations', conversations.removeConversation);

//rasa api's
router.get('/rasa/status', rasa_router.getRasaNluStatus);
router.get('/rasa/url', rasa_router.getRasaNluEndpoint);
router.get('/rasa/version', rasa_router.getRasaNluVersion);
router.post('/rasa/model/train', rasa_router.trainRasaNlu);
router.put('/rasa/model', rasa_router.loadRasaModel);
router.delete('/rasa/model', rasa_router.unloadRasaModel);
router.post('/rasa/model/parse', rasa_router.modelParseRequest);
router.post('/rasa/conversations/messages', rasa_router.conversationParseRequest);
router.post('/rasa/restart', rasa_router.restartRasaCoreConversation);
router.get('/rasa/story', rasa_router.getConversationStory);
router.post('/rasa/conversations/execute', rasa_router.runActionInConversation);


//authentication js
router.post('/auth', auth.authenticateUser);
router.post('/authclient', auth.authenticateClient);

module.exports = router;

var express = require('express');
var router = express.Router();

var agents = require('../db/agents');
var intents = require('../db/intents');
var expressions = require('../db/expressions');
var parameters = require('../db/parameters');
var entities = require('../db/entities');
var synonyms = require('../db/synonyms');
var variants = require('../db/variants');
var settings = require('../db/settings');
var logs = require('../db/logs');

router.get('/agents', agents.getAllAgents);
router.get('/agents/:agent_id', agents.getSingleAgent);
router.post('/agents', agents.createAgent);
router.put('/agents/:agent_id', agents.updateAgent);
router.delete('/agents/:agent_id', agents.removeAgent);

router.get('/agents/:agent_id/intents', intents.getAgentIntents);
router.get('/intents/:intent_id', intents.getSingleIntent);
router.get('/intents/:intent_id/unique_intent_entities', intents.getUniqueIntents);

router.post('/agents/:agent_id/intents', intents.createAgentIntent);
router.post('/intents', intents.createAgentIntent);
router.delete('/intents/:intent_id', intents.removeIntent);

router.get('/intent_expressions', expressions.getIntentExpressionQuery); //Used for training

router.get('/intents/:intent_id/expressions', expressions.getIntentExpressions);
router.get('/expressions/:expression_id', expressions.getSingleExpression);
router.post('/expressions', expressions.createIntentExpression);
router.delete('/expressions/:expression_id', expressions.removeExpression);

router.get('/expression_parameters', parameters.getExpressionParametersQuery); //Used for training

router.get('/expresions/:expression_id/parameters', parameters.getExpressionParameters);
router.get('/parameters/:parameter_id', parameters.getSingleParameter);
router.get('/intent/:intent_id/parameters', parameters.getIntentParameters);
router.post('/parameters', parameters.createExpressionParameter);
router.put('/parameters/:parameter_id', parameters.updateParameter);
router.delete('/parameters/:parameter_id', parameters.removeParameter);

router.get('/entities', entities.getAllEntities);
router.get('/entities/:entity_id', entities.getSingleEntity);
router.post('/entities', entities.createEntity);
router.put('/entities/:entity_id', entities.updateEntity);
router.delete('/entities/:entity_id', entities.removeEntity);

router.get('/entity/:entity_id/synonyms', synonyms.getEntitySynonyms);
router.get('/synonyms/:synonym_id', synonyms.getSingleSynonym);
router.post('/synonyms', synonyms.createEntitySynonym);
router.delete('/synonyms/:synonym_id', synonyms.removeSynonym);

router.get('/entity_synonym_variants', variants.getEntitySynonymVariantsQuery); //Used for training

router.get('/synonyms/:synonym_id/variants', variants.getEntitySynonymVariants);
router.get('/variants/:synonym_variant_id', variants.getSingleVariant);
router.post('/variants', variants.createVariant);
router.delete('/variants/:synonym_variant_id', variants.removeVariant);
router.delete('/synonyms/:synonym_id/variants', variants.removeSynonymVariants);

router.get('/settings', settings.getSettings);
router.get('/settings/:setting_name', settings.getSingleSetting);
router.put('/settings/:setting_name', settings.updateSetting);

router.get('/nlu_log/:query', logs.getLogs);
router.get('/intent_usage_by_day', logs.getIntentUsageByDay);
router.get('/intent_usage_total', logs.getIntentUsageTotal);
router.get('/request_usage_total', logs.getRequestUsageTotal);
router.get('/avg_intent_usage_by_day', logs.getAvgIntentUsageByDay);

module.exports = router;

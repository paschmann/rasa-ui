const db = require('./db');
const logger = require('../util/logger');

function getSingleIntent(req, res, next) {
  logger.winston.info('intents.getSingleIntents');
  db.get('select * from intents where intent_id = ?', req.params.intent_id, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function getAgentIntents(req, res, next) {
  logger.winston.info('intents.getAgentIntents');
  db.all('select * from intents where agent_id = ?', req.params.agent_id, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function createAgentIntent(req, res, next) {
  logger.winston.info('intents.createAgentIntent');
  db.run('insert into intents (agent_id, intent_name)' + 'values (?,?)', [req.body.agent_id, req.body.intent_name], function(err) {
    if (err) {
      logger.winston.info("Error inserting a new record");
    } else {
      res.status(200).json({ status: 'success', message: 'Inserted' });
    }
  });
}

function updateIntent(req, res, next) {
  logger.winston.info('intents.updateIntent');

  db.run('update intents set intent_name = ? where intent_id = ?', [req.body.intent_name, req.params.intent_id], function(err) {
    if (err) {
      logger.winston.info("Error updating the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Updated' });
    }
  });
}

function removeIntent(req, res, next) {
  //Remove all sub components of intent
  logger.winston.info('intents.removeIntent');

  db.run('delete from intents where intent_id = ?', req.params.intent_id, function(err) {
    if (err) {
      logger.winston.info("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}

module.exports = {
  getAgentIntents,
  createAgentIntent,
  getSingleIntent,
  updateIntent,
  removeIntent
};

const db = require('./db');
const logger = require('../util/logger');

function getSingleIntent(req, res, next) {
  logger.winston.info('intents.getSingleIntents');
  db.get('select * from intents where intent_id = ?', req.params.intent_id, function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function getBotIntents(req, res, next) {
  logger.winston.info('intents.getBotIntents');
  db.all('select * from intents where bot_id = ? order by intent_id desc', req.params.bot_id, function(err, data) {
    if (err) {
      logger.winston.error(err);;
    } else {
      res.status(200).json(data);
    }
  });
}

function createBotIntent(req, res, next) {
  logger.winston.info('intents.createBotIntent');
  db.run('insert into intents (bot_id, intent_name)' + 'values (?,?)', [req.body.bot_id, req.body.intent_name], function(err) {
    if (err) {
      logger.winston.error("Error inserting a new record");
    } else {
      res.status(200).json({ status: 'success', message: 'Inserted' });
    }
  });
}

function updateIntent(req, res, next) {
  logger.winston.info('intents.updateIntent');

  db.run('update intents set intent_name = ? where intent_id = ?', [req.body.intent_name, req.params.intent_id], function(err) {
    if (err) {
      logger.winston.error("Error updating the record");
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
      logger.winston.error("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}

module.exports = {
  getBotIntents,
  createBotIntent,
  getSingleIntent,
  updateIntent,
  removeIntent
};

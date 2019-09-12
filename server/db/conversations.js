const db = require('./db');
const logger = require('../util/logger');

module.exports = {
  getConversations,
  createConversation,
  removeConversation
};

function getConversations(req, res, next) {
  logger.winston.info('Conversations.getConversations');
  db.all('select * from conversations where bot_id = ? order by timestamp desc', req.params.bot_id, function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function createConversation(req, res, next) {
  logger.winston.info('Conversations.createConversation');
  db.run('insert into conversations(bot_id)' + 'values (?)', [req.body.bot_id], function(err) {
    if (err) {
      logger.winston.error("Error inserting a new record");
    } else {
      res.status(200).json({ status: 'success', message: 'Inserted' });
    }
  });
}

function removeConversation(req, res, next) {
  logger.winston.info('Conversations.removeConversation');
  db.run('delete from conversations where conversation_id = ?', req.query.conversation_id, function(err) {
    if (err) {
      logger.winston.error("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}
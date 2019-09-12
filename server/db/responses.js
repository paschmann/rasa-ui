const db = require('./db');
const logger = require('../util/logger');

function createResponse(req, res, next) {
  logger.winston.info('responses.createResponse');
  db.run('insert into responses (response_text, action_id, response_type)' + 'values (?,?,?)', [req.body.response_text, req.body.action_id, req.body.response_type], function(err) {
    if (err) {
      logger.winston.error("Error inserting a new record");
    } else {
      res.status(200).json({ status: 'success', message: 'Inserted' });
    }
  });
}

function updateResponse(req, res, next) {
  logger.winston.info('responses.updateResponse');
  db.run('update responses set response_text = ?, response_type = ? where response_id = ?', [req.body.response_text, req.body.response_type, req.body.response_id], function(err) {
    if (err) {
      logger.winston.error("Error updating the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Updated' });
    }
  });
}

function deleteResponse(req, res, next) {
  logger.winston.info('responses.removeResponse');
  db.run('delete from responses where response_id = ?', req.query.response_id, function(err) {
    if (err) {
      logger.winston.error("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}

module.exports = {
  createResponse,
  deleteResponse,
  updateResponse
};
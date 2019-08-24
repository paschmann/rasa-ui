const db = require('./db');
const logger = require('../util/logger');

function getAgentRegex(req, res, next) {
  logger.winston.info('regex.getAgentRegex');
  db.all('select * from regex where agent_id = ?', req.params.agent_id, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function getSingleRegex(req, res, next) {
  logger.winston.info('regex.getSingleRegex');
  db.get('select * from regex where regex_id = ?', req.params.regex_id, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function createRegex(req, res, next) {
  logger.winston.info('regex.createRegex');
  db.run('insert into regex(agent_id, regex_name, regex_pattern)' + 'values (?,?,?)', [req.body.agent_id, req.body.regex_name, req.body.regex_pattern], function(err) {
    if (err) {
      logger.winston.info("Error inserting a new record");
    } else {
      res.status(200).json({ status: 'success', message: 'Inserted' });
    }
  });
}

function updateRegex(req, res, next) {
  logger.winston.info('regex.updateRegex');
  db.run('update regex set regex_name = ?, regex_pattern = ? where regex_id = ?', [req.body.regex_name, req.body.regex_pattern, req.body.regex_id], function(err) {
    if (err) {
      logger.winston.info("Error updating the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Updated' });
    }
  });
}

function removeRegex(req, res, next) {
  logger.winston.info('regex.removeRegex');
  db.run('delete from regex where regex_id = ?', req.params.regex_id, function(err) {
    if (err) {
      logger.winston.info("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}

module.exports = {
  getAgentRegex,
  getSingleRegex,
  createRegex,
  updateRegex,
  removeRegex};

const db = require('./db');
const logger = require('../util/logger');

function getBotRegex(req, res, next) {
  logger.winston.info('regex.getBotRegex');
  db.all('select * from regex where bot_id = ? order by regex_id desc', req.params.bot_id, function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function getSingleRegex(req, res, next) {
  logger.winston.info('regex.getSingleRegex');
  db.get('select * from regex where regex_id = ?', req.params.regex_id, function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function createRegex(req, res, next) {
  logger.winston.info('regex.createRegex');
  db.run('insert into regex(bot_id, regex_name, regex_pattern)' + 'values (?,?,?)', [req.body.bot_id, req.body.regex_name, req.body.regex_pattern], function(err) {
    if (err) {
      logger.winston.error("Error inserting a new record");
    } else {
      res.status(200).json({ status: 'success', message: 'Inserted' });
    }
  });
}

function updateRegex(req, res, next) {
  logger.winston.info('regex.updateRegex');
  db.run('update regex set regex_name = ?, regex_pattern = ? where regex_id = ?', [req.body.regex_name, req.body.regex_pattern, req.body.regex_id], function(err) {
    if (err) {
      logger.winston.error("Error updating the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Updated' });
    }
  });
}

function removeRegex(req, res, next) {
  logger.winston.info('regex.removeRegex');
  db.run('delete from regex where regex_id = ?', req.params.regex_id, function(err) {
    if (err) {
      logger.winston.error("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}

module.exports = {
  getBotRegex,
  getSingleRegex,
  createRegex,
  updateRegex,
  removeRegex};

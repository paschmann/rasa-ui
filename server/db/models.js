const db = require('./db');
const logger = require('../util/logger');
const fs = require('fs');

function getBotModels(req, res, next) {
  logger.winston.info('Model.getBotModels');
  db.all('select * from models where bot_id = ?  order by model_id desc', req.params.bot_id, function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function createModel(req, res, next) {
  logger.winston.info('Bot.createModel');
  db.run('insert into models(model_name, comment, bot_id, server_path, local_path)' + 'values (?,?,?,?,?)', [req.body.file_name, req.body.comment, req.body.bot_id, req.body.server_path, 'Manually added'], function (err) {
    if (err) {
      logger.winston.error("Error inserting a new record: " + err);
    } else {
      logger.winston.info("Model saved to models table");
      res.status(200).json({ status: 'success', message: 'Inserted' });
    }
  });
}

function removeModel(req, res, next) {
  logger.winston.info('Model.removeModel');
  db.run('delete from models where model_id = ?', req.query.model_id, function(err) {
    if (err) {
      logger.winston.error("Error removing the record");
    } else {
      if (req.query.local_path && req.query.local_path != "Manually Added") {
        fs.unlink(req.query.local_path, (err) => {
          if (err) {
            logger.winston.info(err)
            return
          }
        })
      }
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}

module.exports = {
  getBotModels,
  removeModel,
  createModel
};
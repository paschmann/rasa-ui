const db = require('./db');
const logger = require('../util/logger');
const fs = require('fs');

function getAgentModels(req, res, next) {
  logger.winston.info('Model.getAgentModels');
  db.all('select * from models where agent_id = ?', req.params.agent_id, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function removeModel(req, res, next) {
  logger.winston.info('Model.removeModel');

  db.run('delete from models where model_id = ?', req.query.model_id, function(err) {
    if (err) {
      logger.winston.info("Error removing the record");
    } else {
      if (req.query.local_path != "Manually Added") {
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
  getAgentModels,
  removeModel
};
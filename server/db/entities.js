const db = require('./db');
const logger = require('../util/logger');

function getAllEntities(req, res, next) {
  logger.winston.info('Entities.getAllEntities');
  db.all('select * from entities', function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function getAllEntitiesForBot(req, res, next) {
  logger.winston.info('Entities.getAllEntitiesForBot');
  db.all('select * from entities where bot_id = ?  order by entity_id desc', req.params.bot_id, function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function getSingleEntity(req, res, next) {
  logger.winston.info('Entities.getSingleEntity');
  db.get('select * from entities where entity_id = ?', req.params.entity_id, function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function createEntity(req, res, next) {
  logger.winston.info('Entities.createEntity');
  
  db.run('insert into entities(bot_id, entity_name, slot_data_type)' + 'values (?,?,?)', [req.body.bot_id, req.body.entity_name, req.body.slot_data_type], function(err) {
    if (err) {
      logger.winston.error("Error inserting a new record");
    } else {
      res.status(200).json({ status: 'success', message: 'Inserted' });
    }
  });
}

function updateEntity(req, res, next) {
  logger.winston.info('entities.updateEntity');

  db.run('update entities set entity_name = ?, slot_data_type = ? where entity_id = ?', [req.body.entity_name, req.body.slot_data_type, req.params.entity_id], function(err) {
    if (err) {
      logger.winston.error("Error updating the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Updated' });
    }
  });
}

function removeEntity(req, res, next) {
  logger.winston.info('entities.updateEntity');
  db.run('delete from entities where entity_id = ?', req.params.entity_id, function(err) {
    if (err) {
      logger.winston.error("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}

module.exports = {
  getAllEntities,
  getAllEntitiesForBot,
  getSingleEntity,
  createEntity,
  updateEntity,
  removeEntity
};

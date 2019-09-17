const db = require('./db');
const logger = require('../util/logger');

function getExpressionParametersQuery(req, res, next) {
  logger.winston.info('parameters.getExpressionParametersQuery');
  const expressionIds = req.query.expression_ids;
  var array_expressionIds = expressionIds.split(","); //Very hacky due to the node-sqlite not supporting IN from an array
  db.all("select * from expression_parameters inner join entities on expression_parameters.entity_id = entities.entity_id where expression_id in (" + array_expressionIds + ")", function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
  
}

function getIntentParameters(req, res, next) {
  logger.winston.info('parameters.getIntentParameters');
  db.all('select * from expression_parameters where intent_id = ?', req.params.intent_id, function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function getExpressionParameters(req, res, next) {
  logger.winston.info('parameters.getExpressionParameters');
  db.all('select * from expression_parameters where expression_id = ?', req.params.expression_id, function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function createExpressionParameter(req, res, next) {
  logger.winston.info('parameters.createExpressionParameter');
  db.run('insert into expression_parameters(expression_id, parameter_start, parameter_end, parameter_value, intent_id)' + 'values (?,?,?,?,?)', [req.body.expression_id, req.body.parameter_start, req.body.parameter_end, req.body.parameter_value, req.body.intent_id], function(err) {
    if (err) {
      logger.winston.error("Error inserting a new record");
    } else {
      res.status(200).json({ status: 'success', message: 'Inserted' });
    }
  });
}

function updateParameter(req, res, next) {
  //Sets the entity once a new parameter has been created
  logger.winston.info('parameters.updateParameter');
  db.run('update expression_parameters set entity_id = ? where parameter_id = ?', [req.body.entity_id, req.body.parameter_id], function(err) {
    if (err) {
      logger.winston.error("Error updating the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Updated' });
    }
  });
}

function removeExpressionParameter(req, res, next) {
  db.run('delete from expression_parameters where parameter_id = ?', req.params.parameter_id, function(err) {
    if (err) {
      logger.winston.error("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}

module.exports = {
  getExpressionParameters,
  getIntentParameters,
  createExpressionParameter,
  removeExpressionParameter,
  updateParameter,
  getExpressionParametersQuery
};

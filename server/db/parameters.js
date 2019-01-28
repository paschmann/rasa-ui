const db = require('./db');
const logger = require('../util/logger');

function getSingleParameter(req, res, next) {
  const parameterID = Number(req.params.parameter_id);
  db.one('select * from parameters where parameter_id = $1', parameterID)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getIntentParameters(req, res, next) {
  logger.winston.info('parameters.getExpressionParameters');
  const intentId = Number(req.params.intent_id);
  db.any('select * from expression_parameters where intent_id = $1', intentId)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getExpressionParametersQuery(req, res, next) {
  logger.winston.info('parameters.getExpressionParametersQuery');
  const expressionIds = req.query.expression_ids;
  const sql = `select * from expression_parameters where expression_id in (${expressionIds})`;
  db.any(sql)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function updateParameter(req, res, next) {
  logger.winston.info('parameters.updateParameter');
  db.none('update parameters set entity_id=$1 where parameter_id=$2', [
    req.body.entity_id,
    Number(req.params.parameter_id)])
    .then(function() {
      res.status(200).json({
        status: 'success',
        message: 'Updated parameter'});
    })
    .catch(function(err) {
      return next(err);
    });
}

function getExpressionParameters(req, res, next) {
  logger.winston.info('parameters.getExpressionParameters');
  const expressionId = Number(req.params.expression_id);
  db.any(
    'select * from expression_parameters where expression_id = $1',
    expressionId
  )
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function createExpressionParameter(req, res, next) {
  logger.winston.info('parameters.createExpressionParameter');
  if (!req.body.entity_id) {
    req.body.entity_id = null;
  }
  db.any(
    'insert into parameters (expression_id, parameter_end, parameter_start, parameter_value, entity_id)' +
      'values($(expression_id), $(parameter_end), $(parameter_start), $(parameter_value), $(entity_id))',
    req.body
  )
    .then(function() {
      res.status(200).json({
        status: 'success',
        message: 'Inserted'});
    })
    .catch(function(err) {
      return next(err);
    });
}

function removeParameter(req, res, next) {
  const parameterId = Number(req.params.parameter_id);
  db.result('delete from parameters where parameter_id = $1', parameterId)
    .then(function(result) {
      /* jshint ignore:start */
      res.status(200).json({
        status: 'success',
        message: `Removed ${result.rowCount}`});
      /* jshint ignore:end */
    })
    .catch(function(err) {
      return next(err);
    });
}

module.exports = {
  getSingleParameter,
  getExpressionParameters,
  getIntentParameters,
  createExpressionParameter,
  removeParameter,
  updateParameter,
  getExpressionParametersQuery};

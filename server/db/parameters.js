const db = require('./db')

function getSingleParameter(req, res, next) {
  var parameterID = parseInt(req.params.parameter_id);
  db.one('select * from parameters where parameter_id = $1', parameterID)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getIntentParameters(req, res, next) {
  console.log("parameters.getExpressionParameters");
  var intentId = parseInt(req.params.intent_id);
  db.any('select * from expression_parameters where intent_id = $1', intentId)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getExpressionParametersQuery(req, res, next) {
  console.log("parameters.getExpressionParametersQuery");
  var expressionIds = req.query.expression_ids;
  var sql = 'select * from expression_parameters where expression_id in (' + expressionIds + ')';
  db.any(sql)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function updateParameter(req, res, next) {
  console.log("parameters.updateParameter");
  console.log(req.body);
  db.none('update parameters set entity_id=$1 where parameter_id=$2',
    [req.body.entity_id, parseInt(req.params.parameter_id)])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated parameter'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function getExpressionParameters(req, res, next) {
  console.log("parameters.getExpressionParameters");
  var expressionId = parseInt(req.params.expression_id);
  db.any('select * from expression_parameters where expression_id = $1', expressionId)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function createExpressionParameter(req, res, next) {
  console.log("parameters.createExpressionParameter");
  db.any('insert into parameters (expression_id, parameter_end, parameter_start, parameter_value)' +
      'values(${expression_id}, ${parameter_end}, ${parameter_start}, ${parameter_value})',
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeParameter(req, res, next) {
  var parameterId = parseInt(req.params.parameter_id);
  db.result('delete from parameters where parameter_id = $1', parameterId)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: 'Removed ${result.rowCount}'
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}

module.exports = {
  getSingleParameter: getSingleParameter,
  getExpressionParameters: getExpressionParameters,
  getIntentParameters: getIntentParameters,
  createExpressionParameter: createExpressionParameter,
  removeParameter: removeParameter,
  updateParameter: updateParameter,
  getExpressionParametersQuery: getExpressionParametersQuery
};

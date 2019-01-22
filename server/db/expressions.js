const db = require("./db");
const logger = require("../util/logger");

function getSingleExpression(req, res, next) {
  logger.winston.info("expression.getSingleExpression");
  var intentId = Number(req.params.expression_id);
  db.one("select * from expressions where expression_id = $1", intentId)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getIntentExpressions(req, res, next) {
  logger.winston.info("expression.getIntentExpressions");
  var IntentId = Number(req.params.intent_id);
  db.any(
    "select * from expressions where intent_id = $1 order by expression_id desc",
    IntentId
  )
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getIntentExpressionQuery(req, res, next) {
  logger.winston.info("expression.getIntentExpressionQuery");
  var IntentIds = req.query.intent_ids;
  var sql = "select * from expressions where intent_id in (" + IntentIds + ")";
  db.any(sql)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function createIntentExpression(req, res, next) {
  logger.winston.info("expressions.createIntentExpression");
  db.any(
    "insert into expressions(intent_id, expression_text)" +
      "values($(intent_id), $(expression_text)) RETURNING expression_id",
    req.body
  )
    .then(function(data) {
      res.status(200).json({
        status: "success",
        message: "Inserted",
        expression_id: data[0].expression_id
      });
    })
    .catch(function(err) {
      return next(err);
    });
}

function removeExpression(req, res, next) {
  logger.winston.info("expressions.removeExpression");
  var expressionId = Number(req.params.expression_id);
  db.result("delete from expressions where expression_id = $1", expressionId)
    .then(function(result) {
      /* jshint ignore:start */
      res.status(200).json({
        status: "success",
        message: "Removed ${result.rowCount}"
      });
      /* jshint ignore:end */
    })
    .catch(function(err) {
      return next(err);
    });
}

function updateExpression(req, res, next) {
  logger.winston.info("expressions.updateExpressionEndpoint");
  db.none(
    "update expressions set intent_id=$2,expression_text=$3 where expression_id=$1",
    [
      Number(req.params.expression_id),
      req.body.intent_id,
      req.body.expression_text
    ]
  )
    .then(function() {
      res.status(200).json({
        status: "success",
        message: "Updated Expression"
      });
    })
    .catch(function(err) {
      return next(err);
    });
}

module.exports = {
  getSingleExpression: getSingleExpression,
  getIntentExpressions: getIntentExpressions,
  createIntentExpression: createIntentExpression,
  removeExpression: removeExpression,
  getIntentExpressionQuery: getIntentExpressionQuery,
  updateExpression: updateExpression
};

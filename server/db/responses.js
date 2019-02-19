const db = require('./db');
const logger = require('../util/logger');

function getIntentResponses(req, res, next) {
  logger.winston.info('responses.getIntentResponses');
  const intentID = Number(req.params.intent_id);
  logger.winston.info('responses.getIntentResponses ::intentID' + intentID);
  db.any('select * from responses where intent_id = $1', intentID)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getActionResponses(req, res, next) {
  logger.winston.info('responses.getActionResponses');
  const action_id = Number(req.params.action_id);
  db.any('select * from responses where action_id = $1', action_id)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function createActionResponse(req, res, next) {
  logger.winston.info('responses.createActionResponse');
  //using default response type
  db.any(
    'insert into responses(action_id, response_text, response_type, buttons_info, response_image_url)' +
      'values($(action_id), $(response_text),$(response_type),$(buttons_info),$(response_image_url))',
    //using default response type
    req.body
  )
    .then(function() {
      res.status(200).json({
        status: 'success',
        message: 'Inserted'});
    })
    .catch(function(err) {
      logger.winston.error(err);
      return next(err);
    });
}

function createIntentResponse(req, res, next) {
  logger.winston.info('responses.createIntentResponse');
  //using default response type
  db.any(
    'insert into responses(intent_id, response_text, response_type)' +
      'values($(intent_id), $(response_text),$(response_type))',
    //using default response type
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

function removeResponse(req, res, next) {
  const responseID = Number(req.params.response_id);
  logger.winston.info('responses.removeResponse');
  db.result('delete from responses where response_id = $1', responseID)
    .then(function(result) {
      res.status(200).json({
        status: 'success',
        message: 'Removed ' + result.rowCount});
      /* jshint ignore:end */
    })
    .catch(function(err) {
      return next(err);
    });
}

function getRandomResponseForIntent(req, res, next) {
  logger.winston.info('responses.getRandomResponseForIntent');
  db.any(
    'SELECT responses.response_text FROM responses, intents where responses.intent_id = intents.intent_id and intents.intent_name = $1 order by random() LIMIT 1',
    req.query.intent_name
  )
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getActionResponsesQuery(req, res, next) {
  logger.winston.info('responses.getActionResponsesQuery');
  const actionIds = req.query.action_ids;
  const sql = `select responses.*, actions.action_name  from responses,actions
               where actions.action_id=responses.action_id and responses.action_id in (${actionIds})`;
  logger.winston.info(sql);
  db.any(sql)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

module.exports = {
  getIntentResponses,
  removeResponse,
  createIntentResponse,
  createActionResponse,
  getRandomResponseForIntent,
  getActionResponses,
  getActionResponsesQuery};

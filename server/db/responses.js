const db = require('./db');
const logger = require('../util/logger');

function getIntentResponses(req, res, next) {
  logger.winston.info('responses.getIntentResponses');

  db.all('select * from responses where intent_id = ?', req.params.intent_id, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function getActionResponses(req, res, next) {
  logger.winston.info('responses.getActionResponses');
  db.all('select * from responses where action_id = ?', req.params.action_id, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json(data);
    }
  });
}


function createIntentResponse(req, res, next) {
  logger.winston.info('responses.createIntentResponse');
  db.run('insert into responses(intent_id, response_text, response_type)' + 'values (?,?,?)', [req.body.intent_id, req.body.response_text, req.body.response_type], function(err) {
    if (err) {
      logger.winston.info("Error inserting a new record");
    } else {
      res.status(200).json({ status: 'success', message: 'Inserted' });
    }
  });
}

function removeResponse(req, res, next) {
  logger.winston.info('responses.removeResponse');
  db.run('delete from responses where response_id = ?', req.params.response_id, function(err) {
    if (err) {
      logger.winston.info("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}

function getRandomResponseForIntent(req, res, next) {
  logger.winston.info('responses.getRandomResponseForIntent - not done');
  /*
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
    */
}

function getActionResponsesQuery(req, res, next) {
  logger.winston.info('responses.getActionResponsesQuery - not done');
  /*
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
    */
}

function createActionResponse(req, res, next) {
  logger.winston.info('responses.createActionResponse');
  /* using default response type
  const responseID = db.db_sequence('response_id_sequence');
  db.get('responses')
    .push({ response_id: responseID, action_id: req.body.action_id, response_text: req.body.response_text, response_type: req.body.response_type, buttons_info: req.body.buttons_info, response_image_url: req.body.response_image_url })
    .write()
  
    res.status(200).json({
      status: 'success',
      message: 'Inserted'});
    */
}

module.exports = {
  getIntentResponses,
  removeResponse,
  createIntentResponse,
  createActionResponse,
  getRandomResponseForIntent,
  getActionResponses,
  getActionResponsesQuery};

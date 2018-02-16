const db = require('./db')

function getIntentResponses(req, res, next) {
  console.log("responses.getIntentResponses");
  var intentID = parseInt(req.params.intent_id);
  console.log("responses.getIntentResponses ::intentID" +intentID);
  db.any('select * from responses where intent_id = $1', intentID)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getActionResponses(req, res, next) {
  console.log("responses.getActionResponses");
  var action_id = parseInt(req.params.action_id);
  db.any('select * from responses where action_id = $1', action_id)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function createActionResponse(req, res, next) {
  console.log("responses.createActionResponse");
  //using default response type
  db.any('insert into responses(action_id, response_text, response_type, buttons_info, response_image_url)' +
      'values(${action_id}, ${response_text},${response_type},${buttons_info},${response_image_url})',
      //using default response type
    req.body)
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Inserted'
        });
    })
    .catch(function (err) {
      console.log(err);
      return next(err);
    });
}

function createIntentResponse(req, res, next) {
  console.log("responses.createIntentResponse");
  //using default response type
  db.any('insert into responses(intent_id, response_text, response_type)' +
      'values(${intent_id}, ${response_text},${response_type})',
      //using default response type
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

function removeResponse(req, res, next) {
  var responseID = parseInt(req.params.response_id);
  console.log("responses.removeResponse");
  db.result('delete from responses where response_id = $1', responseID)
    .then(function (result) {

      res.status(200)
        .json({
          status: 'success',
          message: 'Removed ' +result.rowCount
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}

function getRandomResponseForIntent(req, res, next) {
  console.log("responses.getRandomResponseForIntent");
  db.any('SELECT responses.response_text FROM responses, intents where responses.intent_id = intents.intent_id and intents.intent_name = $1 order by random() LIMIT 1', req.query.intent_name)
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getActionResponsesQuery(req, res, next) {
  console.log("responses.getActionResponsesQuery");
  var actionIds = req.query.action_ids;
  var sql = 'select responses.*, actions.action_name  from responses,actions where actions.action_id=responses.action_id and responses.action_id in (' + actionIds + ')';
  console.log(sql);
  db.any(sql)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

module.exports = {
  getIntentResponses: getIntentResponses,
  removeResponse: removeResponse,
  createIntentResponse: createIntentResponse,
  createActionResponse: createActionResponse,
  getRandomResponseForIntent:getRandomResponseForIntent,
  getActionResponses: getActionResponses,
  getActionResponsesQuery: getActionResponsesQuery
};

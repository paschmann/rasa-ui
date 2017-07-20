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

function removeIntentResponse(req, res, next) {
  var responseID = parseInt(req.params.response_id);
  console.log("responses.removeIntentResponse");
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
  db.result('SELECT * FROM responses, intents where responses.intent_id= intents.intent_id and intents.intent_name=$1', req.query.intent_name)
    .then(function (data) {
      //pick random one if there are multiple.
      if(data.length>1){
        //pick one
        res.status(200).json(data[Math.random() * (data.length - 1) + 1]);
      }
      res.status(200).json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

module.exports = {
  getIntentResponses: getIntentResponses,
  removeIntentResponse: removeIntentResponse,
  createIntentResponse: createIntentResponse,
  getRandomResponseForIntent:getRandomResponseForIntent
};

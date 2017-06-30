const db = require('./db')

module.exports = {
  getLogs: getLogs,
  getRequestUsageTotal: getRequestUsageTotal,
  getIntentUsageTotal: getIntentUsageTotal,
  getIntentUsageByDay: getIntentUsageByDay,
  getAvgIntentUsageByDay: getAvgIntentUsageByDay
};

function getLogs(req, res, next) {
  console.log("logs.getLogs");
  var query = req.params.query;
  console.log("logs.getLogs - " + query);
  db.any('select * from nlu_log where event_type = $1 order by timestamp desc LIMIT 100', query)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getAvgIntentUsageByDay(req, res, next) {
  console.log("logs.getAvgIntentUsageByDay");
  db.any('select round(avg(count)) as avg from intent_usage_by_day')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getIntentUsageByDay(req, res, next) {
  console.log("logs.getIntentUsageByDay");
  db.any('select * from intent_usage_by_day')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getIntentUsageTotal(req, res, next) {
  console.log("logs.getIntentUsageTotal");
  db.any('select * from intent_usage_total')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getRequestUsageTotal(req, res, next) {
  console.log("logs.getRequestUsageTotal");
  db.any('select * from request_usage_total')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

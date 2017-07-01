const db = require('./db')

module.exports = {
  getLogs: getLogs,
  getRequestUsageTotal: getRequestUsageTotal,
  getIntentUsageTotal: getIntentUsageTotal,
  getIntentUsageByDay: getIntentUsageByDay,
  getAvgIntentUsageByDay: getAvgIntentUsageByDay
};

function getLogs(req, res, next) {
  var query = req.params.query;
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
  db.any('select * from request_usage_total')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

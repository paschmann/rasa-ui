const db = require('./db');

module.exports = {
  getLogs,
  getRequestUsageTotal,
  getIntentUsageTotal,
  getIntentUsageByDay,
  getAvgIntentUsageByDay,
  getNluParseLogByAgent,
  getAgentsByIntentConfidencePct,
  getIntentsMostUsed,
  getAvgNluResponseTimesLast30Days,
  getAvgUserResponseTimesLast30Days,
  getActiveUserCountLast12Months,
  getActiveUserCountLast30Days,
};

function getActiveUserCountLast30Days(req, res, next){
  db.any('select * from active_user_count_30_days')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getActiveUserCountLast12Months(req, res, next){
  db.any('select * from active_user_count_12_months')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getAvgUserResponseTimesLast30Days(req, res, next){
  db.any('select * from avg_user_response_times_30_days')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getAvgNluResponseTimesLast30Days(req, res, next){
  db.any('select * from avg_nlu_response_times_30_days')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getIntentsMostUsed(req, res, next){
  db.any('select * from intents_most_used')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getAgentsByIntentConfidencePct(req, res, next){
  db.any('select count(*),intent_confidence_pct, agents.agent_id, agents.agent_name from nlu_parse_log, agents, messages '
         +' where messages.agent_id = agents.agent_id and messages.messages_id=nlu_parse_log.messages_id '
         +' group by intent_confidence_pct, agents.agent_id, agents.agent_name ')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getNluParseLogByAgent(req, res, next) {
  const agent_id = req.params.agent_id;
  db.any('select * from nlu_parse_log where agent_id = $1 order by timestamp desc', agent_id)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}
function getLogs(req, res, next) {
  const query = req.params.query;
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

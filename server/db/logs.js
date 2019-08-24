const db = require('./db');
const logger = require('../util/logger');

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
  getTotalLogEntries,
  logRequest
};

function logRequest(req, type, data) {
  try {
    const obj = {};
    obj.ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    obj.query = req.originalUrl;
    obj.event_type = type;
    obj.event_data = JSON.stringify(data);
    
    db.run('insert into nlu_log (ip_address, query, event_type, event_data)' + 'values (?,?,?,?)', [obj.ip_address, obj.query, obj.event_type, obj.event_data], function(err) {
      if (err) {
        logger.winston.info("Error inserting a new record");
      }
    });
  } catch (err) {
    logger.winston.info('Error: ' + err);
  }
}

function getLogs(req, res, next) {
  db.all('select * from nlu_log where event_type = ? order by timestamp desc', req.params.query, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function getRequestUsageTotal(req, res, next) {
  db.get("select count(*) from nlu_log where event_type = 'parse'", req.params.query, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json({total_request_usage: data['count(*)']});
    }
  });
}

function getTotalLogEntries(req, res, next) {
  db.get("select count(*) from nlu_log", req.params.query, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json({total_log_entries: data['count(*)']});
    }
  });
}

function getIntentUsageByDay(req, res, next) {
  db.all("select strftime('%m/%d', timestamp) as day, count(*) as cnt from nlu_log group by strftime('%m/%d', timestamp)", req.params.query, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json(data);
    }
  });
}


/* Not used yet */

function getIntentUsageTotal(req, res, next) {
  const data = db.get('nlu_log')
    .filter({ event_type: 'parse' })
    .size()
    .value()
  res.status(200).json({intent_usage: data});
}

function getActiveUserCountLast30Days(req, res, next) {
  db.any('select * from active_user_count_30_days')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getActiveUserCountLast12Months(req, res, next) {
  db.any('select * from active_user_count_12_months')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getAvgUserResponseTimesLast30Days(req, res, next) {
  db.any('select * from avg_user_response_times_30_days')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getAvgNluResponseTimesLast30Days(req, res, next) {
  db.any('select * from avg_nlu_response_times_30_days')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getIntentsMostUsed(req, res, next) {
  const agent_id = req.params.agent_id;
  db.any('select * from intents_most_used where agent_id=$1', agent_id)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getAgentsByIntentConfidencePct(req, res, next) {
  const agent_id = req.params.agent_id;
  db.any('select count(*),intent_confidence_pct, agents.agent_id, agents.agent_name from nlu_parse_log, agents, messages '
    + ' where messages.agent_id = agents.agent_id and messages.messages_id=nlu_parse_log.messages_id '
    + ' and agents.agent_id=$1 group by intent_confidence_pct, agents.agent_id, agents.agent_name ', agent_id)
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



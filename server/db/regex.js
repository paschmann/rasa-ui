const db = require("./db");
const logger = require("../util/logger");

function getAgentRegex(req, res, next) {
  logger.winston.info("regex.getAgentRegex");
  var agentId = parseInt(req.params.agent_id);
  db.any("select * from regex where agent_id = $1", agentId)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getSingleRegex(req, res, next) {
  logger.winston.info("regex.getSingleRegex");
  var regexID = parseInt(req.params.regex_id);
  db.one("select * from regex where regex_id = $1", regexID)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function createRegex(req, res, next) {
  logger.winston.info("regex.createRegex");
  db.any(
    "insert into regex(regex_name, regex_pattern, agent_id) values($(regex_name), $(regex_pattern), $(agent_id)) RETURNING regex_id",
    req.body
  )
    .then(function(data) {
      res.status(200).json({
        status: "success",
        message: "Inserted",
        regex_id: data[0].regex_id
      });
    })
    .catch(function(err) {
      return next(err);
    });
}

function updateRegex(req, res, next) {
  db.none(
    "update regex set regex_name=$1, regex_pattern=$3 where regex_id=$2",
    [req.body.regex_name, parseInt(req.params.regex_id), req.body.regex_pattern]
  )
    .then(function() {
      res.status(200).json({
        status: "success",
        message: "Updated regex"
      });
    })
    .catch(function(err) {
      return next(err);
    });
}

function removeRegex(req, res, next) {
  var regexID = parseInt(req.params.regex_id);
  db.result("delete from regex where regex_id = $1", regexID)
    .then(function(result) {
      /* jshint ignore:start */
      res.status(200).json({
        status: "success",
        message: `Removed ${result.rowCount}`
      });
      /* jshint ignore:end */
    })
    .catch(function(err) {
      return next(err);
    });
}

module.exports = {
  getAgentRegex: getAgentRegex,
  getSingleRegex: getSingleRegex,
  createRegex: createRegex,
  updateRegex: updateRegex,
  removeRegex: removeRegex
};

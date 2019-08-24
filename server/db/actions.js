const db = require('./db');
const logger = require('../util/logger');

function getSingleAction(req, res, next) {
  const  action_id = Number(req.params.action_id);
  logger.winston.info('actions.getSingleAction');
  db.one('select * from actions where action_id = $1', action_id)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getAgentActions(req, res, next) {
  logger.winston.info('actions.getAgentActions');
  const AgentID = Number(req.params.agent_id);
  db.any('select * from actions where agent_id = $1 order by action_id', AgentID)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function createAgentAction(req, res, next) {
  logger.winston.info('actions.createAgentAction');
  db.any(
    'insert into actions(agent_id, action_name)' +
      'values($(agent_id), $(action_name))',
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

function removeAction(req, res, next) {
  logger.winston.info('actions.removeAction');
  const action_id = Number(req.params.action_id);
  db.result('delete from actions where action_id = $1', action_id)
    .then(function(result) {
      /* jshint ignore:start */
      res.status(200).json({
        status: 'success',
        message: `Removed ${result.rowCount}`});
      /* jshint ignore:end */
    })
    .catch(function(err) {
      return next(err);
    });
}

function updateAction(req, res, next) {
  logger.winston.info('actions.updateAction');
  db.none('update actions set action_name=$2 where action_id=$1', [
    Number(req.params.action_id),
    req.body.action_name])
    .then(function() {
      res.status(200).json({
        status: 'success',
        message: 'Updated Action'});
    })
    .catch(function(err) {
      return next(err);
    });
}

module.exports = {
  getSingleAction,
  getAgentActions,
  createAgentAction,
  updateAction,
  removeAction};

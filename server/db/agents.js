const db = require('./db')

function getAllAgents(req, res, next) {
  db.any('select * from agents')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getSingleAgent(req, res, next) {
  var agentID = parseInt(req.params.agent_id);
  db.one('select * from agents where agent_id = $1', agentID)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function createAgent(req, res, next) {
  console.log("Agent.createAgent");
  db.none('insert into agents(agent_name)' +
      'values(${agent_name})',
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

function updateAgent(req, res, next) {
  db.none('update agents set agent_name=$1 where id=$2',
    [req.body.agent_name, parseInt(req.params.agent_id)])
    .then(function () {
      res.status(200)
        .json({
          status: 'success',
          message: 'Updated agent'
        });
    })
    .catch(function (err) {
      return next(err);
    });
}

function removeAgent(req, res, next) {
  var agentID = parseInt(req.params.agent_id);
  db.result('delete from agents where agent_id = $1', agentID)
    .then(function (result) {
      /* jshint ignore:start */
      res.status(200)
        .json({
          status: 'success',
          message: 'Removed ${result.rowCount}'
        });
      /* jshint ignore:end */
    })
    .catch(function (err) {
      return next(err);
    });
}

module.exports = {
  getSingleAgent: getSingleAgent,
  getAllAgents: getAllAgents,
  createAgent: createAgent,
  updateAgent: updateAgent,
  removeAgent: removeAgent
};

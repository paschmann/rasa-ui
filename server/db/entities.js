const db = require('./db')

function getAllEntities(req, res, next) {
  console.log("Entities.getAllEntities");
  db.any('select * from entities')
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getAllEntitiesForAgent(req, res, next) {
  console.log("Entities.getAllEntitiesForAgent");
  var agentId = parseInt(req.params.agent_id);
  db.any('select * from entities where agent_id=$1', agentId)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getSingleEntity(req, res, next) {
  console.log("Entities.getSingleEntity");
  var entityID = parseInt(req.params.entity_id);
  db.one('select * from entities where entity_id = $1', entityID)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function createEntity(req, res, next) {
  console.log("Entities.createEntity");
  req.body.agent_id =req.body.agent.agent_id;
  db.none('insert into entities(entity_name, agent_id, slot_data_type) values(${entity_name},${agent_id},${slot_data_type})',
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

function updateEntity(req, res, next) {
  db.none('update entities set entity_name=$1, agent_id=$3, slot_data_type=$4 where entity_id=$2',
    [req.body.entity_name, parseInt(req.params.entity_id),parseInt(req.body.agent.agent_id), req.body.slot_data_type])
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

function removeEntity(req, res, next) {
<<<<<<< HEAD
  var entityId = parseInt(req.params.entity_id);
  db.result('delete from entities where entity_id = $1', entityId)
=======
  var entityID = parseInt(req.params.entity_id);
  db.result('delete from entities where entity_id = $1', entityID)
>>>>>>> origin/master
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
  getAllEntities: getAllEntities,
  getAllEntitiesForAgent: getAllEntitiesForAgent,
  getSingleEntity: getSingleEntity,
  createEntity: createEntity,
  updateEntity: updateEntity,
  removeEntity: removeEntity
};

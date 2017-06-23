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
  db.none('insert into entities(entity_name)' +
      'values(${entity_name})',
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

function updateEntity(req, res, next) {
  db.none('update entities set entity_name=$1 where entity_id=$2',
    [req.body.entity_name, parseInt(req.params.entity_id)])
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
  var agentID = parseInt(req.params.entity_id);
  db.result('delete from entities where entity_id = $1', agentID)
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
  getSingleEntity: getSingleEntity,
  createEntity: createEntity,
  updateEntity: updateEntity,
  removeEntity: removeEntity
};

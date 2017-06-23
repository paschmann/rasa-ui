const db = require('./db')

function getSingleSynonym(req, res, next) {
  console.log("synonym.getSingleSynonym");
  var synonymId = parseInt(req.params.synonym_id);
  db.one('select * from synonyms where synonym_id = $1', synonymId)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getEntitySynonyms(req, res, next) {
  console.log("synonym.getEntitySynonyms");
  var entityId = parseInt(req.params.entity_id);
  db.any('select * from synonyms where entity_id = $1', entityId)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function createEntitySynonym(req, res, next) {
  console.log("synonym.createEntitySynonym");
  db.any('insert into synonyms(entity_id, synonym_reference)' +
      'values(${entity_id}, ${synonym_reference})',
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

function removeSynonym(req, res, next) {
  console.log("synonym.removeExpression");
  var synonymId = parseInt(req.params.synonym_id);
  db.result('delete from synonyms where synonym_id = $1', synonymId)
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
  getSingleSynonym: getSingleSynonym,
  getEntitySynonyms: getEntitySynonyms,
  createEntitySynonym: createEntitySynonym,
  removeSynonym: removeSynonym
};

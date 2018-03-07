const db = require('./db')

function getSingleVariant(req, res, next) {
  console.log("variants.getSingleVariant");
  var synonymVariantId = parseInt(req.params.synonym_variant_id);
  db.any('select * from synonym_variant where synonym_variant_id = 51', synonymVariantId)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getEntitySynonymVariants(req, res, next) {
  console.log("variants.getSynonymVariants");
  var synonymId = parseInt(req.params.synonym_id);
  db.any('select * from entity_synonym_variants where synonym_id = $1', synonymId)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function getEntitySynonymVariantsQuery(req, res, next) {
  console.log("variants.getEntitySynonymVariantsQuery");
  var entityIds = req.query.entity_ids;
  var sql = 'select * from entity_synonym_variants where entity_id in (' + entityIds + ')';
  db.any(sql)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      return next(err);
    });
}

function createVariant(req, res, next) {
  console.log("variants.createVariant");
  db.any('insert into synonym_variant(synonym_id, synonym_value)' +
      'values(${synonym_id}, ${synonym_value})',
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

function removeVariant(req, res, next) {
  console.log("variants.removeVariant");
  var variantId = parseInt(req.params.synonym_variant_id);
  db.result('delete from synonym_variant where synonym_variant_id = $1', variantId)
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

function removeSynonymVariants(req, res, next) {
  console.log("variants.removeSynonymVariants");
  var synonymId = parseInt(req.params.synonym_id);
  db.result('delete from synonym_variant where synonym_id = $1', synonymId)
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
  getSingleVariant: getSingleVariant,
  getEntitySynonymVariants: getEntitySynonymVariants,
  createVariant: createVariant,
  removeVariant: removeVariant,
  removeSynonymVariants: removeSynonymVariants,
  getEntitySynonymVariantsQuery: getEntitySynonymVariantsQuery
};

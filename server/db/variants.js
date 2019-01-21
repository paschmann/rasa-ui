const db = require("./db");
const logger = require("../util/logger");

function getSingleVariant(req, res, next) {
  logger.winston.info("variants.getSingleVariant");
  var synonymVariantId = parseInt(req.params.synonym_variant_id);
  db.any(
    "select * from synonym_variant where synonym_variant_id = $1",
    synonymVariantId
  )
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getSynonymVariants(req, res, next) {
  logger.winston.info("variants.getSynonymVariants");
  var synonymId = parseInt(req.params.synonym_id);
  db.any("select * from synonym_variant where synonym_id = $1", synonymId)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getSynonymsVariants(req, res, next) {
  logger.winston.info("variants.getSynonymVariants");
  let synonymsId = req.params.synonyms_id;
  db.any(
    "select * from synonym_variant where synonym_id in (" + synonymsId + ")"
  )
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getAllSynonymVariants(req, res, next) {
  logger.winston.info("variants.getAllSynonymVariants");

  db.any(
    "select synonym_reference as value, '[' || string_agg('\"' || synonym_value || '\"', ', ') || ']' as synonyms from entity_synonym_variants group by 1"
  )
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function createVariant(req, res, next) {
  logger.winston.info("variants.createVariant");
  db.any(
    "insert into synonym_variant(synonym_id, synonym_value)" +
      "values(${synonym_id}, ${synonym_value})",
    req.body
  )
    .then(function() {
      res.status(200).json({
        status: "success",
        message: "Inserted"
      });
    })
    .catch(function(err) {
      return next(err);
    });
}

function removeVariant(req, res, next) {
  logger.winston.info("variants.removeVariant");
  var variantId = parseInt(req.params.synonym_variant_id);
  db.result(
    "delete from synonym_variant where synonym_variant_id = $1",
    variantId
  )
    .then(function(result) {
      /* jshint ignore:start */
      res.status(200).json({
        status: "success",
        message: "Removed ${result.rowCount}"
      });
      /* jshint ignore:end */
    })
    .catch(function(err) {
      return next(err);
    });
}

function removeSynonymVariants(req, res, next) {
  logger.winston.info("variants.removeSynonymVariants");
  var synonymId = parseInt(req.params.synonym_id);
  db.result("delete from synonym_variant where synonym_id = $1", synonymId)
    .then(function(result) {
      /* jshint ignore:start */
      res.status(200).json({
        status: "success",
        message: "Removed ${result.rowCount}"
      });
      /* jshint ignore:end */
    })
    .catch(function(err) {
      return next(err);
    });
}

module.exports = {
  getSingleVariant: getSingleVariant,
  getSynonymVariants: getSynonymVariants,
  createVariant: createVariant,
  removeVariant: removeVariant,
  removeSynonymVariants: removeSynonymVariants,
  getSynonymsVariants: getSynonymsVariants,
  getAllSynonymVariants: getAllSynonymVariants
};

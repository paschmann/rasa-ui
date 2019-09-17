const db = require('./db');
const logger = require('../util/logger');

function getSingleVariant(req, res, next) {
  logger.winston.info('variants.getSingleVariant');
  db.get('select * from synonym_variants where synonym_variant_id = ?', req.params.synonym_variant_id, function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function getSynonymVariants(req, res, next) {
  logger.winston.info('variants.getSynonymVariants');
  db.all('select * from synonym_variants where synonym_id = ? order by synonym_variant_id desc', req.params.synonym_id, function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function getSynonymsVariants(req, res, next) {
  logger.winston.info('variants.getSynonymVariants');
  const synonymsId = req.params.synonyms_id;
  var array_synonymIds = synonymsId.split(","); //Very hacky due to the node-sqlite not supporting IN from an array
  db.all('select * from synonym_variants where synonym_id in (' + array_synonymIds + ')', function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function createVariant(req, res, next) {
  logger.winston.info('variants.createVariant');
  db.run('insert into synonym_variants (synonym_id, synonym_value)' + 'values (?, ?)', [req.body.synonym_id, req.body.synonym_value], function(err) {
    if (err) {
      logger.winston.error("Error inserting a new record");
    } else {
      db.get('SELECT last_insert_rowid()', function(err, data) {
        if (err) {
          res.status(500).json({ status: 'error', message: '' });
        } else {
          res.status(200).json({ status: 'success', message: 'Inserted', synonym_variant_id: data['last_insert_rowid()'] });
        }
      });
    }
  });
}

function removeVariant(req, res, next) {
  logger.winston.info('variants.removeVariant');
  db.run('delete from synonym_variants where synonym_variant_id = ?', req.params.synonym_variant_id, function(err) {
    if (err) {
      logger.winston.error("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}

function removeSynonymVariants(req, res, next) {
  logger.winston.info('variants.removeSynonymVariants');
  db.run('delete from synonym_variants where synonym_id = ?', req.params.synonym_id, function(err) {
    if (err) {
      logger.winston.error("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}

module.exports = {
  getSingleVariant,
  getSynonymVariants,
  createVariant,
  removeVariant,
  removeSynonymVariants,
  getSynonymsVariants
};

const db = require('./db');
const logger = require('../util/logger');

function getSingleSynonym(req, res, next) {
  logger.winston.info('synonym.getSingleSynonym');
  db.get('select * from synonyms where synonym_id = ?', req.params.synonym_id, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function getBotSynonyms(req, res, next) {
  logger.winston.info('synonym.getBotSynonyms');

  db.all('select * from synonyms where bot_id = ?', req.params.bot_id, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function createBotSynonym(req, res, next) {
  logger.winston.info('synonym.createBotSynonym');
  db.run('insert into synonyms(bot_id, synonym_reference, regex_pattern)' + 'values (?,?,?)', [req.body.bot_id, req.body.synonym_reference, req.body.regex_pattern], function(err) {
    if (err) {
      logger.winston.info("Error inserting a new record");
    } else {
      db.get('SELECT last_insert_rowid()', function(err, data) {
        if (err) {
          res.status(500).json({ status: 'error', message: '' });
        } else {
          res.status(200).json({ status: 'success', message: 'Inserted', synonym_id: data['last_insert_rowid()'] });
        }
      });
    }
  });
}

function removeSynonym(req, res, next) {
  logger.winston.info('synonym.removeExpression');
  db.run("delete from synonym_variants where synonym_id = ?", req.params.synonym_id);
  db.run('delete from synonyms where synonym_id = ?', req.params.synonym_id, function(err) {
    if (err) {
      logger.winston.info("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}

module.exports = {
  getSingleSynonym,
  getBotSynonyms,
  createBotSynonym,
  removeSynonym};

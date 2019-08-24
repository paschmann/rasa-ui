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

function getAgentSynonyms(req, res, next) {
  logger.winston.info('synonym.getAgentSynonyms');

  db.all('select * from synonyms where agent_id = ?', req.params.agent_id, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function createAgentSynonym(req, res, next) {
  logger.winston.info('synonym.createAgentSynonym');
  db.run('insert into synonyms(agent_id, synonym_reference, regex_pattern)' + 'values (?,?,?)', [req.body.agent_id, req.body.synonym_reference, req.body.regex_pattern], function(err) {
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
  db.run('delete from synonyms where agent_id = ?', req.params.synonym_id, function(err) {
    if (err) {
      logger.winston.info("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed', synonym_id: data });
    }
  });
}

module.exports = {
  getSingleSynonym,
  getAgentSynonyms,
  createAgentSynonym,
  removeSynonym};

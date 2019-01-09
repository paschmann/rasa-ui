const db = require("./db");

function getSingleSynonym(req, res, next) {
  console.log("synonym.getSingleSynonym");
  var synonymId = parseInt(req.params.synonym_id);
  db.one("select * from synonyms where synonym_id = $1", synonymId)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getAgentSynonyms(req, res, next) {
  console.log("synonym.getAgentSynonyms");
  var agentId = parseInt(req.params.agent_id);
  db.any("select * from synonyms where agent_id = $1", agentId)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function createAgentSynonym(req, res, next) {
  console.log("synonym.createAgentSynonym");
  db.any(
    "insert into synonyms(agent_id, synonym_reference)" +
      "values(${agent_id}, ${synonym_reference}) RETURNING synonym_id",
    req.body
  )
    .then(function(data) {
      res.status(200).json({
        status: "success",
        message: "Inserted",
        synonym_id: data[0].synonym_id
      });
    })
    .catch(function(err) {
      return next(err);
    });
}

function removeSynonym(req, res, next) {
  console.log("synonym.removeExpression");
  var synonymId = parseInt(req.params.synonym_id);
  db.result("delete from synonyms where synonym_id = $1", synonymId)
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
  getSingleSynonym: getSingleSynonym,
  getAgentSynonyms: getAgentSynonyms,
  createAgentSynonym: createAgentSynonym,
  removeSynonym: removeSynonym
};

const db = require('./db')


function uploadAgentFromFile(req, res, next) {
  console.log("On server request" + JSON.stringify(req.body));

  //agent, intent,expressions, entities, , parameters(expression id, entity id)
  var intents_map = new Map();
  var entities_map = new Map();
  var entities_set = new Set();;
  var nlu_data_arr = req.body.data.rasa_nlu_data.common_examples;
  //modify the data structure for db queries
  console.log("Starting upload... Array Length :" + nlu_data_arr.length);
  for (var i = 0; i < nlu_data_arr.length; i++) {
    console.log("Iteration No : " + i + " Intenet: " + nlu_data_arr[i].intent);
    var expressions_arr;
    if (intents_map.has(nlu_data_arr[i].intent)) {
      expressions_arr = intents_map.get(nlu_data_arr[i].intent);
    } else {
      expressions_arr = [];
    }
    var expressionObj = new Object();
    expressionObj.text = nlu_data_arr[i].text;
    expressionObj.paramArray = [];
    var intentEntities = nlu_data_arr[i].entities;
    var entities_query_arr = [];
    for (j = 0; j < intentEntities.length; j++) {
      var entityObj = intentEntities[j];
      entities_set.add(entityObj.entity);
      var parameterObj = new Object();
      parameterObj.entity = entityObj.entity;
      parameterObj.entity_id = -1;
      parameterObj.parameter_value = entityObj.value;
      parameterObj.start = entityObj.start;
      parameterObj.end = entityObj.end;
      expressionObj.paramArray.push(parameterObj);
      console.log("Adding param for " + parameterObj.parameter_value);
    }

    expressions_arr.push(expressionObj);
    intents_map.set(nlu_data_arr[i].intent, expressions_arr);
  }
  console.log("Done Iterations. Inserting Entites now ... with json");

  db.tx(function (t) {
    var entity_queries_arr = [];
    entities_set.forEach(function (entity) {
      var entity_query = t.one('insert into entities(entity_name) values($1) RETURNING entity_id', entity)
        .then(function (return_entity) {
          console.log("Entity Inserted. Updating map for " + entity);
          entities_map.set(entity, return_entity.entity_id);
        }).catch(function (err) {
          console.log("Error occured while inserting entities: " + err);
        });
      entity_queries_arr.push(entity_query);
    });
    return t.batch(entity_queries_arr);
  }).then(data => {
    // success
    // data = as returned from the transaction's callback
    console.log("All Entites Inserted. Proceeding with other data inserts");
    db.tx(function (t) {
      // t.ctx = transaction context object
      return t.one('insert into agents(agent_name) values($1) RETURNING agent_id', [req.body.agent_name])
        .then(agent => {
          console.log("Agent Inserted");
          var intents_query_arr = [];
          intents_map.forEach(function (expressionsArray, key, map) {
            console.log("Inserting Intent " + key);
            var intent_query = t.one('insert into intents(agent_id, intent_name) VALUES($1, $2) RETURNING intent_id', [agent.agent_id, key])
              .then(intent => {
                var expressions_query_arr = [];
                expressionsArray.forEach(function (expressionObjVal) {
                  console.log("Inserting Expression " + expressionObjVal.text);
                  var expressions_query = t.one('insert into expressions(intent_id, expression_text) values($1, $2) RETURNING expression_id', [intent.intent_id, expressionObjVal.text])
                    .then(expression => {
                      var parameters_query_arr = [];
                      var p_arr = expressionObjVal.paramArray;
                      for (var j = 0; j < p_arr.length; j++) {
                        var paramObj = p_arr[j];
                        if (paramObj.entity_id == -1) {
                          //updated entityid
                          paramObj.entity_id = entities_map.get(paramObj.entity);
                        }
                        console.log("Inserting Parameter for " + paramObj.parameter_value + " ,Mapping to Entity: " + paramObj.entity + " ,with key" + paramObj.entity_id);
                        var params_query = t.none('insert into parameters (expression_id, parameter_end, parameter_start, parameter_value,entity_id) values($1,$2,$3,$4,$5)',
                          [expression.expression_id, paramObj.end, paramObj.start, paramObj.parameter_value, paramObj.entity_id]);
                        parameters_query_arr.push(params_query);
                      }
                      return t.batch(parameters_query_arr);
                    });
                  expressions_query_arr.push(expressions_query);
                });
                return t.batch(expressions_query_arr);
              });
            intents_query_arr.push(intent_query);
          });
          return t.batch(intents_query_arr);
        });
    }).then(data => {
      // success
      // data = as returned from the transaction's callback
      console.log("All Data inserted");
      return res.status(200).json({});
    })
      .catch(error => {
        // error should rollback
        //delete entites as well
        console.log("Error occured. Rollbacking all: " + error);
        var entityIds;
        entities_map.forEach(function (value, key, map) {
          entityIds = entityIds + ', ' + value;
        });
        entityIds = entityIds.substring(1, entityIds.length);
        db.none('delete from entities where entity_id in (' + entityIds + ')')
          .then(function () {
            console.log("Entites deleted successfully");
          })
          .catch(function (err) {
            return next(err);
          });
        return res.status(500).json({ "Error": "Error Occurred" });
      });
  }).catch(error => {
    console.log("Error when uploading entites" + error);
    return res.status(500).json({ "Error": "Error Occurred" });
  });
}

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
    }).catch(function (err) {
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
  console.log("Agent.updateAgent");
  db.none('update agents set agent_name=$2, endpoint_enabled=$3, endpoint_url=$4, basic_auth_username=$5, basic_auth_password=$6 where agent_id=$1',
    [parseInt(req.params.agent_id), req.body.agent_name, req.body.endpoint_enabled, req.body.endpoint_url, req.body.basic_auth_username, req.body.basic_auth_password])
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
  removeAgent: removeAgent,
  uploadAgentFromFile: uploadAgentFromFile
};

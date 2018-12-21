/*
  RasaCore (Event Brokers) events are outputted to RabbitMQ
  This route is dedicated to rasa core events logging
    Conversation history
    RasaCore called actions

  Logstash can transfert from RabbitMQ input to RasaUI /rasa/logEvents route:
    With that logstash/pipeline/logstash.conf:
    input {
        rabbitmq {
            queue => "queue"
            host => "rabbitmq"
            durable => true
            user => "admin"
            password => "admin"
        }
     }

    output {
    http {
        url => "http://rasa_ui:5001/api/v2/rasa/logEvents"
        http_method => "post"
        headers => {
        "Authorization" => "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwidXNlcl9mdWxsbmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.mwUCpY096a34ttMYoNnE0ShY0sHJdRJUJSt9RiIoLpQ"
        "Accept" => "application/json"
        }
        format=>"json"
    }


  Let RasaUI fill the proper DB for its consistency:
    messages
    nlu_log
    nlu_parse_log

*/
const db = require('../db/db')
var async = require('asyncawait/async');
var await = require('asyncawait/await');

/*
  RasaCore user message contains project name field with which we can retrieve the agentId
  If not found or undefined, set it to default 0
*/
var getAgentIdFromName = async(function (message) {
    console.log("getAgentIdFromName");

    db.any('SELECT agent_id FROM agents WHERE agent_name=${agent_name}', message)
      .then(function (data) {
        console.log(data);
        if (data[0] != undefined) {
            message.agent_id = data[0].agent_id;
        }
      })
      .catch(function (err) {
        console.log("Error in DB call" + err);
      });
});

/*
  RasaCore bot message does not contain "project" field and has no field to retrieve it
  The common information with the sender is the sender_id
*/
var getAgentIdFromBotMessage = async(function (message) {
    console.log("getAgentIdFromBotMessage");

    db.any("SELECT agent_id FROM messages WHERE user_id=${user_id} and user_name='user' ORDER BY timestamp DESC LIMIT 1", message)
      .then(function (data) {
        console.log(data);
        if (data[0] != undefined) {
            message.agent_id = data[0].agent_id;
        }
      })
      .catch(function (err) {
        console.log("Error in DB call" + err);
      });
});

var insertNLUParseLogDB = async(function (nlulogData){
    db.none('INSERT INTO nlu_parse_log(messages_id, intent_name, entity_data, intent_confidence_pct, user_response_time_ms, nlu_response_time_ms) VALUES (${messages_id}, ${intent_name}, ${entity_data}, ${intent_confidence_pct},${user_response_time_ms},${nlu_response_time_ms})', nlulogData)
      .then(function () {
          console.log("Cache inserted into NLU db");
      })
      .catch(function (err) {
        console.log("Exception while inserting NLU Parse log");
        console.log(err);
      });
});

insertMessagesEntitiesDB = async(function (messagesEntitiesDataItem){
    db.none('INSERT INTO messages_entities(message_id, entity_id, entity_start, entity_end, entity_confidence) VALUES (${message_id}, ${entity_id}, ${entity_start}, ${entity_end},${entity_confidence})', messagesEntitiesDataItem)
      .then(function () {
          console.log("Cache inserted into MessagesEntities db");
      })
      .catch(function (err) {
        console.log("Exception while inserting MessagesEntities db");
        console.log(err);
      });
});

var processAllEntitiesFromExpressionId = async(function (messagesEntitiesData) {
    console.log("processAllEntitiesFromExpressionId");
    console.log(messagesEntitiesData);
    db.any("SELECT entity_id, parameter_start, parameter_end FROM parameters WHERE expression_id=${expression_id}", messagesEntitiesData)
      .then(function (data) {
        console.log(data);
        for (var i = 0; i < data.length; i++) {
            messagesEntitiesDataItem = new Object();
            messagesEntitiesDataItem.message_id = messagesEntitiesData.message_id;
            messagesEntitiesDataItem.entity_id = data[i].entity_id;
            messagesEntitiesDataItem.entity_start = data[i].parameter_start;
            messagesEntitiesDataItem.entity_end = data[i].parameter_end;
            messagesEntitiesDataItem.entity_confidence = 0;

            insertMessagesEntitiesDB(messagesEntitiesDataItem);
        }
      })
      .catch(function (err) {
        console.log("Error in DB call" + err);
        messagesEntitiesData.expression_id = null;
      });
});

processInsertMessagesEntitiesDB = async(function (messagesEntitiesData){
    console.log("processInsertMessagesEntitiesDB");
    console.log(messagesEntitiesData);
    db.any("SELECT expression_id FROM expressions WHERE LOWER(expression_text)=LOWER(${message_text})", messagesEntitiesData)
      .then(function (data) {
        console.log(data);
        if (data[0] != undefined) {
            messagesEntitiesData.expression_id = data[0].expression_id;
            processAllEntitiesFromExpressionId(messagesEntitiesData);
        } else {
            messagesEntitiesData.expression_id = null;
        }
      })
      .catch(function (err) {
        console.log("Error in DB call" + err);
        messagesEntitiesData.expression_id = null;
      });
});

async function insertlogEventMessageToDB(message, corelogData, nlulogData, messagesEntitiesData) {
    db.any('INSERT INTO messages(timestamp, agent_id, user_id, user_name, message_text, message_rich, user_message_ind, intent_id)' +
    ' VALUES(${timestamp}, ${agent_id}, ${user_id},${user_name}, ${message_text}, ${message_rich}, ${user_message_ind}, (SELECT intent_id FROM intents WHERE intent_name=${intent_name})) RETURNING messages_id', message)

      .then(function (response) {
        console.log("Message Inserted with Id: " + response[0].messages_id);

        //corelogData.messages_id = response[0].messages_id;
        if ((nlulogData != undefined) && (nlulogData !== null)) {
            nlulogData.messages_id = response[0].messages_id;
            //insertCoreParseLogDB(corelogData);
            insertNLUParseLogDB(nlulogData);
        }

        if ((messagesEntitiesData !== undefined) && (messagesEntitiesData !== null)) {
            messagesEntitiesData.message_id = response[0].messages_id;
            messagesEntitiesData.message_text = message.message_text;
            processInsertMessagesEntitiesDB(messagesEntitiesData)
        }

      }).catch(function (err) {
          console.log("Exception while inserting inserting to DB");
          console.log(err);
        });
};

async function processLogEventsToDBs(message, corelogData, nlulogData, messagesEntitiesData) {
    console.log("processLogEventsToDBs");
    sqlCommand = "";

    if (message.event == "user") {
        sqlCommand = 'SELECT agent_id FROM agents WHERE agent_name=${agent_name}';
    } else if (message.event == "bot") {
        sqlCommand = "SELECT agent_id FROM messages WHERE user_id=${user_id} and user_name='user' ORDER BY timestamp DESC LIMIT 1";
    }

    db.any(sqlCommand, message)
      .then(function (data) {
        console.log(data);
        if (data[0] != undefined) {
            message.agent_id = data[0].agent_id;

            insertlogEventMessageToDB(message, corelogData, nlulogData, messagesEntitiesData);
        }
      })
      .catch(function (err) {
        console.log("Error in DB call" + err);
      });
}


async function logEventsRoute(req, res, next) {
    var rasaCoreEvent = req.body;

    logEvents(rasaCoreEvent, function() {
        res.status(200)
        .json({
            status: 'success',
            message: 'Inserted'
        });
    }, function() {
        res.status(500)
        .json({ "Error logEvents": err });
    });
};

async function logEvents(rasaCoreEvent, success_callback, failure_callback) {

    var message = new Object();
    var nluLogData = null;
    if ((rasaCoreEvent != undefined)
    && ((rasaCoreEvent.event == 'user') || (rasaCoreEvent.event == 'bot'))) {
        console.log("user or bot event");
        console.log(rasaCoreEvent);

        message.timestamp = rasaCoreEvent["@timestamp"];
        message.user_id = rasaCoreEvent.sender_id;

        message.user_name = rasaCoreEvent.event;
        message.message_text = rasaCoreEvent.text;
        message.agent_id = 0;

        if (rasaCoreEvent.event == 'user') {
            message.event = rasaCoreEvent.event;
            message.user_message_ind = true;
            message.message_rich = rasaCoreEvent.parse_data;
            message.agent_name = rasaCoreEvent.parse_data.project;
            message.intent_name = rasaCoreEvent.parse_data.intent.name;
        } else {
            message.event = rasaCoreEvent.event;
            message.user_message_ind = false;
            message.message_rich = rasaCoreEvent.data;
            message.agent_name = "";
            message.intent_name = "";

            if ((rasaCoreEvent.data.elements) && (rasaCoreEvent.data.elements[0].text)) {
                // RasaCore logs for custom message has the text inside that field
                message.message_text = rasaCoreEvent.data.elements[0].text;
            }
        }

        //console.log(message);

        if (rasaCoreEvent.event == 'user') {
            nluLogData = new Object();
            nluLogData.intent_name = rasaCoreEvent.parse_data.intent.name;
            nluLogData.entity_data = JSON.stringify(rasaCoreEvent.parse_data.entities);
            nluLogData.intent_confidence_pct = rasaCoreEvent.parse_data.intent.confidence.toFixed(2)*100;
            nluLogData.user_response_time_ms = 0;
            nluLogData.nlu_response_time_ms = 0;

            //console.log(nluLogData);
            messagesEntitiesData = new Object();

        } else {
            nluLogData = null;
            messagesEntitiesData = null;
        }

        try {
            await(processLogEventsToDBs(message, null, nluLogData, messagesEntitiesData));
            success_callback();

      } catch(err) {
          console.log("Exception while inserting inserting to DB");
          console.log(err);
          failure_callback();
        };
    } else {
        //console.log("NO user or bot event");
        success_callback();
    }
}


module.exports = {
    logEventsRoute: logEventsRoute
}
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
function getAgentIdFromName(agentName) {
    console.log("getAgentIdFromName");
    db.any('select agent_id from agents where agent_name=$1', agentName)
      .then(function (data) {
        if (data[0] != undefined) {
            return data[0].agent_id;
        } else {
            return 0;
        }
      })
      .catch(function (err) {
        console.log("Error in DB call" + err);
        return 0;
      });
}

/*
  RasaCore bot message does not contain "project" field and has no field to retrieve it
  The common information with the sender is the sender_id
*/
function getAgentIdFromBotMessage(senderId) {
    var agentId = 0;
    console.log("getAgentIdFromBotMessage");
    db.any("select agent_id from messages where user_id=$1 and user_name='user' order by timestamp desc limit 1", senderId)
      .then(function (data) {
        if (data[0] != undefined) {
            return data[0].agent_id;
        } else {
            return 0;
        }
      })
      .catch(function (err) {
        console.log("Error in DB call" + err);
        return 0;
      });
}

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
    db.any("select entity_id, parameter_start, parameter_end from parameters where expression_id=${expression_id}", messagesEntitiesData)
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
    db.any("select expression_id from expressions where expression_text=${message_text}", messagesEntitiesData)
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
    db.any('insert into messages(timestamp, agent_id, user_id, user_name, message_text, message_rich, user_message_ind)' +
    ' values(${timestamp}, ${agent_id}, ${user_id},${user_name}, ${message_text}, ${message_rich}, ${user_message_ind}) RETURNING messages_id', message)

      .then(function (response) {
        console.log("Message Inserted with Id: " + response[0].messages_id);

        //corelogData.messages_id = response[0].messages_id;
        if (nlulogData !== null) {
            nlulogData.messages_id = response[0].messages_id;
            //insertCoreParseLogDB(corelogData);
            insertNLUParseLogDB(nlulogData);
        }

        if (messagesEntitiesData !== null) {
            messagesEntitiesData.message_id = response[0].messages_id;
            messagesEntitiesData.message_text = message.message_text;
            processInsertMessagesEntitiesDB(messagesEntitiesData)
        }

      }).catch(function (err) {
          console.log("Exception while inserting inserting to DB");
          console.log(err);
        });
};

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

        if (rasaCoreEvent.event == 'user') {
            message.user_message_ind = true;
            message.message_rich = rasaCoreEvent.parse_data;
            message.agent_id = getAgentIdFromName(rasaCoreEvent.parse_data.project);
        } else {
            message.user_message_ind = false;
            message.message_rich = rasaCoreEvent.data;
            message.agent_id = getAgentIdFromBotMessage(rasaCoreEvent.sender_id);

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

        }

        try {
            await(insertlogEventMessageToDB(message, null, nluLogData, messagesEntitiesData));
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
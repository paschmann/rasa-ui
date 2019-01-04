const db = require("./db");

//agent/:agent_id/messages
function getRecent9UniqueUsersList(req, res, next) {
  var agent_id = parseInt(req.params.agent_id);
  console.log("messages.getRecent9UniqueUsersList");
  db.any(
    "select user_id,user_name, MAX(timestamp) as recent_active from messages where agent_id=$1 group by user_id,user_name order by recent_active desc  limit 9 ",
    agent_id
  )
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      console.log("Error in DB Call" + err);
      return next(err);
    });
}

//agent/:agent_id/messages
function getUniqueUsersList(req, res, next) {
  console.log("messages.getUniqueUsersList");
  var agent_id = parseInt(req.params.agent_id);
  var limit = req.query.limit ? parseInt(req.query.limit) : 10;
  db.any(
    "select user_id, MAX(timestamp) as recent_active  from messages_expressions where agent_id=$1 group by user_id order by recent_active desc limit $2",
    [agent_id, limit]
  )
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      console.log("Error in DB Call" + err);
      return next(err);
    });
}

function getMessagesListByUser(req, res, next) {
  console.log("messages.getMessagesListByUser");
  db.any(
    `select * 
    from messages_expressions
    where agent_id=$1 and user_id=$2 order by timestamp asc`,
    [req.body.agent_id, req.body.user_id]
  )
    .then(messages => {
      let promises = [];

      messages.forEach(message => {
        promises.push(getMessageEntities(message.messages_id));
      });
      Promise.all(promises).then(messagesEntities => {
        for (let i = 0; i < messagesEntities.length; i++) {
          const messagesEntity = messagesEntities[i];

          for (let index = 0; index < messagesEntity.length; index++) {
            const entity = messagesEntity[index];

            if (entity.messages_id) {
              let message = messages.find(message => {
                return message.messages_id === entity.messages_id;
              });

              if (!message.entities) {
                message.entities = [];
              }
              message.entities = message.entities.concat(entity);
            }
          }
        }
        res.status(200).json(messages);
      });
    })
    .catch(function(err) {
      console.log("Error in DB Call" + err);
      return next(err);
    });
}

function getMessageEntities(message_id) {
  console.log("messages.getMessageEntities");
  return db.any(
    `select *
    from entities_parameters
    where messages_id=$1 and entity_id IS NOT NULL and parameter_id IS NOT NULL`,
    [message_id]
  );
}

function deleteMessageEntities(req, res, next) {
  console.log("messages.deleteMessageEntities");
  db.any(
    `delete from messages_entities
    where message_id=$1 and entity_value=$2`,
    [req.params.message_id, req.body.parameter_value]
  )
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      console.log("Error in DB Call" + err);
      return next(err);
    });
}
function updateMessageEntities(req, res, next) {
  console.log("messages.updateMessageEntities");
  db.any(
    `select *
    from entities_parameters
    where agent_id=$1 and parameter_id=$2`,
    [req.body.agent_id, req.body.parameter_id]
  )
    .then(entitiesParameters => {
      let messageIds = [];
      entitiesParameters.forEach(entitiyParameter => {
        messageIds.push(entitiyParameter.messages_id);
      });

      db.any(
        `update messages_entities
        set entity_id=$4, entity_value=$3
        where message_id IN ($1:list) and entity_id=$2`,
        [
          messageIds,
          req.params.entity_id,
          req.body.parameter_value,
          req.body.entity_id
        ]
      )
        .then(data => {
          res.status(200).json(data);
        })
        .catch(err => {
          console.log("Error in DB Call" + err);
          return next(err);
        });
    })
    .catch(function(err) {
      console.log("Error in DB Call" + err);
      return next(err);
    });
}

function addMessageEntities(req, res, next) {
  console.log("messages.addMessageEntities");
  db.any(
    "insert into messages_entities(message_id, entity_id, entity_start, entity_end, entity_value, entity_confidence)" +
      " values($1, $2, $3, $4, $5, 0)",
    [
      req.params.message_id,
      req.body.entity_id,
      req.body.entity_start,
      req.body.entity_end,
      req.body.entity_value
    ]
  )
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      console.log("Error in DB Call" + err);
      return next(err);
    });
}
//this returns the details about nlu and core
//messages/:messages_id
function getMessageDetails(req, res, next) {
  console.log("messages.getMessageDetails");
  db.task("get-message-details", async t => {
    const msgDetails = await t.any(
      "select * from core_parse_log FULL JOIN nlu_parse_log ON core_parse_log.messages_id=nlu_parse_log.messages_id where core_parse_log.messages_id=$1",
      parseInt(req.params.messages_id)
    );
    if (msgDetails.length < 1) {
      const msgDetails = await t.any(
        "select * from nlu_parse_log where nlu_parse_log.messages_id=$1",
        parseInt(req.params.messages_id)
      );
      return msgDetails;
    }
    return msgDetails;
  })
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      console.log("Error in DB Call" + err);
      return next(err);
    });
}

function createMessage(messageObj) {
  if (messageObj != undefined && messageObj.agent_id != undefined) {
    console.log("Messages.createUserMessage");
    db.any(
      "insert into messages(agent_id, user_id, user_name, message_text, message_rich, user_message_ind)" +
        " values(${agent_id}, ${user_id},${user_name}, ${message_text},${message_rich}, ${user_message_ind})",
      messageObj
    )
      .then(function(messages_id) {
        console.log("Message created successfully!!!");
        return;
      })
      .catch(function(err) {
        console.log("Error in createMessage" + err);
        //res.status(500).json(err);
        return;
      });
  } else {
    return;
  }
}
function updateMessage(req, res, next) {
  console.log("Messages.updateMessage");

  if (req.body.intent_id != undefined && req.params.messages_id != undefined) {
    db.none("update messages set intent_id=$1 where messages_id=$2", [
      parseInt(req.body.intent_id),
      parseInt(req.params.messages_id)
    ])
      .then(function() {
        res.status(200).json({
          status: "success",
          message: "Updated message"
        });
      })
      .catch(function(err) {
        return next(err);
      });
  } else {
    return;
  }
}

module.exports = {
  getUniqueUsersList: getUniqueUsersList,
  getMessagesListByUser: getMessagesListByUser,
  getMessageDetails: getMessageDetails,
  createMessage: createMessage,
  updateMessage: updateMessage,
  getRecent9UniqueUsersList: getRecent9UniqueUsersList,
  getMessageEntities: getMessageEntities,
  deleteMessageEntities: deleteMessageEntities,
  updateMessageEntities: updateMessageEntities,
  addMessageEntities: addMessageEntities
};

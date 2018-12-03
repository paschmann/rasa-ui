const db = require('./db')

//agent/:agent_id/messages
function getRecent9UniqueUsersList(req, res, next) {
  var agent_id = parseInt(req.params.agent_id);
  console.log("messages.getRecent9UniqueUsersList");
  db.any('select user_id,user_name, MAX(timestamp) as recent_active from messages where agent_id=$1 group by user_id,user_name order by recent_active desc  limit 9 ',agent_id)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      console.log("Error in DB Call" + err);
      return next(err);
    });
}

//agent/:agent_id/messages
function getUniqueUsersList(req, res, next) {
  var agent_id = parseInt(req.params.agent_id);
  console.log("messages.getUniqueUsers");
  db.any('select distinct(user_id) from messages where agent_id=$1',agent_id)
    .then(function (data) {
      res.status(200)
        .json(data);
    })
    .catch(function (err) {
      console.log("Error in DB Call" + err);
      return next(err);
    });
}

function getMessagesListByUser(req, res, next) {
  console.log("messages.getMessagesListByUser");
  db.any('select * from messages where agent_id=$1 and user_id=$2 order by timestamp asc',[req.body.agent_id,req.body.user_id])
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      console.log("Error in DB Call" + err);
      return next(err);
    });
}

//this returns the details about nlu and core
//messages/:messages_id
function getMessageDetails(req, res, next) {
  console.log("messages.getMessageDetails"+ req.params.messages_id);
  db.task('get-message-details', async t => {
    const msgDetails = await t.any('select * from core_parse_log FULL JOIN nlu_parse_log ON core_parse_log.messages_id=nlu_parse_log.messages_id where core_parse_log.messages_id=$1', parseInt(req.params.messages_id));
    if(msgDetails.length < 1) {
        const msgDetails = await t.any('select * from nlu_parse_log where nlu_parse_log.messages_id=$1', parseInt(req.params.messages_id))
        return msgDetails;
    }
    return msgDetails;
  })
    .then(function (data) {
      res.status(200).json(data);
    })
    .catch(function (err) {
      console.log("Error in DB Call" + err);
      return next(err);
    });
}

function createMessage(messageObj) {
  if (messageObj != undefined && messageObj.agent_id != undefined) {
    console.log("Messages.createUserMessage");
    db.any('insert into messages(agent_id, user_id, user_name, message_text, message_rich, user_message_ind)' +
        ' values(${agent_id}, ${user_id},${user_name}, ${message_text},${message_rich}, ${user_message_ind})', messageObj)
      .then(function (messages_id) {
        console.log("Message created successfully!!!");
        return;
      })
      .catch(function (err) {
        console.log("Error in createMessage" + err);
        //res.status(500).json(err);
        return;
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
  getRecent9UniqueUsersList:getRecent9UniqueUsersList
};

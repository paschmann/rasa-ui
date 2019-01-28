const db = require('./db');
const logger = require('../util/logger');

//agent/:agent_id/messages
function getRecent9UniqueUsersList(req, res, next) {
  const agent_id = Number(req.params.agent_id);
  logger.winston.info('messages.getRecent9UniqueUsersList');
  db.any(
    'select user_id,user_name, MAX(timestamp) as recent_active from messages where agent_id=$1 group by user_id,user_name order by recent_active desc  limit 9 ',
    agent_id
  )
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      logger.winston.info('Error in DB Call' + err);
      return next(err);
    });
}

//agent/:agent_id/messages
async function getUniqueUsersList(req, res, next) {
  logger.winston.info('messages.getUniqueUsersList');
  const agent_id = Number(req.params.agent_id);
  const itemsPerPage = req.query.itemsPerPage
    ? Number(req.query.itemsPerPage)
    : 10;
  const page = req.query.page ? Number(req.query.page) : 1;
  const offset = (page - 1) * itemsPerPage;

  const total = await db.any(
    'SELECT COUNT(DISTINCT user_id) FROM messages_expressions where agent_id=$1 and user_id IS NOT NULL;',
    [agent_id]
  );
  db.any(
    `select user_id, MAX(timestamp) as recent_active
    FROM messages_expressions
    WHERE agent_id=$1 and user_id IS NOT NULL
    group by user_id order by recent_active desc
    LIMIT $2
    OFFSET $3`,
    [agent_id, itemsPerPage, offset]
  )
    .then(function(conversations) {
      const intentsCountPromises = [];
      conversations.forEach(conversation => {
        intentsCountPromises.push(
          db.any(
            `SELECT ( 
              SELECT count(messages_id)
              FROM messages_expressions
              WHERE agent_id=$1
              AND user_id=$2
              AND intent_id IS NOT NULL
              AND user_name = 'user'
            ) as intentsCount,
            (
              SELECT count(messages_id)
              FROM messages_expressions
              WHERE agent_id=$1
              AND user_id=$2
              AND intent_id IS NULL
              AND user_name = 'user'
            ) as noMatchCount`,
            [agent_id, conversation.user_id]
          )
        );
      });

      Promise.all(intentsCountPromises)
        .then(counts => {
          for (let index = 0; index < counts.length; index++) {
            conversations[index].intentsCount = counts[index][0].intentscount;
            conversations[index].noMatchCount = counts[index][0].nomatchcount;
          }

          res.status(200).json({
            conversations,
            meta: {
              total: total[0].count,
              page,
              itemsPerPage: itemsPerPage},
          });
        })
        .catch(error => {
          res.status(200).json(error);
        });
    })
    .catch(function(err) {
      logger.winston.info('Error in DB Call' + err);
      return next(err);
    });
}

function getMessagesListByUser(req, res, next) {
  logger.winston.info('messages.getMessagesListByUser');
  db.any(
    `select *
    from messages_expressions
    where agent_id=$1 and user_id=$2 order by timestamp asc`,
    [req.body.agent_id, req.body.user_id]
  )
    .then(messages => {
      const promises = [];
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
      logger.winston.info('Error in DB Call' + err);
      return next(err);
    });
}

function getMessageEntities(message_id) {
  logger.winston.info('messages.getMessageEntities');
  return db.any(
    `select *
    from entities_parameters
    where messages_id=$1 and entity_id IS NOT NULL and parameter_id IS NOT NULL`,
    [message_id]
  );
}

function deleteMessageEntities(req, res, next) {
  logger.winston.info('messages.deleteMessageEntities');
  db.any(
    `delete from messages_entities
    where message_id=$1 and entity_value=$2`,
    [req.params.message_id, req.body.parameter_value]
  )
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      logger.winston.info('Error in DB Call' + err);
      return next(err);
    });
}
function updateMessageEntities(req, res, next) {
  logger.winston.info('messages.updateMessageEntities');
  db.any(
    `select *
    from entities_parameters
    where agent_id=$1 and parameter_id=$2`,
    [req.body.agent_id, req.body.parameter_id]
  )
    .then(entitiesParameters => {
      const messageIds = [];
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
          req.body.entity_id]
      )
        .then(data => {
          res.status(200).json(data);
        })
        .catch(err => {
          logger.winston.info('Error in DB Call' + err);
          return next(err);
        });
    })
    .catch(function(err) {
      logger.winston.info('Error in DB Call' + err);
      return next(err);
    });
}

function addMessageEntities(req, res, next) {
  logger.winston.info('messages.addMessageEntities');
  db.any(
    'insert into messages_entities(message_id, entity_id, entity_start, entity_end, entity_value, entity_confidence)' +
      ' values($1, $2, $3, $4, $5, 0)',
    [
      req.params.message_id,
      req.body.entity_id,
      req.body.entity_start,
      req.body.entity_end,
      req.body.entity_value]
  )
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      logger.winston.info('Error in DB Call' + err);
      return next(err);
    });
}
//this returns the details about nlu and core
//messages/:messages_id
function getMessageDetails(req, res, next) {
  logger.winston.info('messages.getMessageDetails');
  db.task('get-message-details', async t => {
    const msgDetails = await t.any(
      'select * from core_parse_log FULL JOIN nlu_parse_log ON core_parse_log.messages_id=nlu_parse_log.messages_id where core_parse_log.messages_id=$1',
      Number(req.params.messages_id)
    );
    if (msgDetails.length < 1) {
      return await t.any(
          'select * from nlu_parse_log where nlu_parse_log.messages_id=$1',
          Number(req.params.messages_id)
      );
    }
    return msgDetails;
  })
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      logger.winston.info('Error in DB Call' + err);
      return next(err);
    });
}

function createMessage(messageObj) {
  if (messageObj !== undefined && messageObj.agent_id !== undefined) {
    logger.winston.info('Messages.createUserMessage');
    db.any(
      'insert into messages(agent_id, user_id, user_name, message_text, message_rich, user_message_ind)' +
        ' values($(agent_id), $(user_id),$(user_name), $(message_text),$(message_rich), $(user_message_ind))',
      messageObj
    )
      .then(function() {
        logger.winston.info('Message created successfully!!!');
        return;
      })
      .catch(function(err) {
        logger.winston.info('Error in createMessage' + err);
        return;
      });
  } else {
    return;
  }
}
function updateMessage(req, res, next) {
  logger.winston.info('Messages.updateMessage');

  if (req.body.intent_id !== undefined && req.params.messages_id !== undefined) {
    db.none('update messages set intent_id=$1 where messages_id=$2', [
      Number(req.body.intent_id),
      Number(req.params.messages_id)])
      .then(function() {
        res.status(200).json({
          status: 'success',
          message: 'Updated message'});
      })
      .catch(function(err) {
        return next(err);
      });
  } else {
    return;
  }
}

module.exports = {
  getUniqueUsersList,
  getMessagesListByUser,
  getMessageDetails,
  createMessage,
  updateMessage,
  getRecent9UniqueUsersList,
  getMessageEntities,
  deleteMessageEntities,
  updateMessageEntities,
  addMessageEntities};

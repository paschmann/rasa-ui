const db = require('./db');
const logger = require('../util/logger');

function getAllBotStories(req, res, next) {
  logger.winston.info('Stories.getAllStories');
  db.all('select * from stories where bot_id = ? order by story_id desc', req.params.bot_id, function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function createStory(req, res, next) {
  logger.winston.info('Stories.createStory');
  db.run('insert into stories(story_name, story, bot_id)' + 'values (?,?,?)', [req.body.story_name, req.body.story, req.body.bot_id], function(err) {
    if (err) {
      logger.winston.error("Error inserting a new record");
    } else {
      res.status(200).json({ status: 'success', message: 'Inserted' });
    }
  });
}

function updateStory(req, res, next) {
  logger.winston.info('Stories.updateStory');
  db.run('update stories set story = ? where story_id = ?', [req.body.story, req.body.story_id], function(err) {
    if (err) {
      logger.winston.error("Error updating the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Updated' });
    }
  });
}

function removeStory(req, res) {
  logger.winston.info('Stories.updateStory');
  db.run('delete from stories where story_id = ?', req.query.story_id, function(err) {
    if (err) {
      logger.winston.error("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}

function searchStoryAttributes(req, res, next) {
  logger.winston.info('Stories.searchStoryAttributes');
  var search_string = "%" + req.query.search_text + "%";
  db.all("select * from intents where intent_name like ? and bot_id = ?", [search_string, req.params.bot_id], function(err, intents) {
    if (err) {
      logger.winston.error(err);
    } else {
      db.all("select * from entities where entity_name like ? and bot_id = ?", [search_string, req.params.bot_id], function(err, entities) {
        if (err) {
          logger.winston.error(err);
        } else {
          db.all("select * from actions where action_name like ? and bot_id = ?", [search_string, req.params.bot_id], function(err, actions) {
            if (err) {
              logger.winston.error(err);
            } else {
              var data = [];
              try {
                for (action of actions) {
                  data.push({text: action.action_name, type: "action"});
                }
              } catch (err) {
                logger.winston.error(err);
              }
              try {
                for (entity of entities) {
                  data.push({text: entity.entity_name, type: "entity"});
                }
              } catch (err) {
                logger.winston.error(err);
              }
              try {
                for (intent of intents) {
                  data.push({text: intent.intent_name, type: "intent"});
                }
              } catch (err) {
                logger.winston.error(err);
              }
              res.status(200).json(data);
            }
          });
        }
      });
    }
  });
}

module.exports = {
  searchStoryAttributes,
  getAllBotStories,
  createStory,
  updateStory,
  removeStory
};
const db = require('./db');
const logger = require('../util/logger');

function getAllBotStories(req, res, next) {
  logger.winston.info('Stories.getAllStories');
  db.all('select * from stories where bot_id = ? order by story_id desc', req.params.bot_id, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function getSingleStory(req, res, next) {
  logger.winston.info('Stories.getSingleStory');
  db.get('select * from stories where story_id = ?', req.params.story_id, function(err, data) {
    if (err) {
      logger.winston.info(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function createStory(req, res, next) {
  logger.winston.info('Stories.createStory');
  console.log(req.body);
  db.run('insert into stories(story_name, story, bot_id)' + 'values (?,?,?)', [req.body.story_name, req.body.story, req.body.bot_id], function(err) {
    if (err) {
      logger.winston.info("Error inserting a new record");
    } else {
      res.status(200).json({ status: 'success', message: 'Inserted' });
    }
  });
}

function updateStory(req, res, next) {
  logger.winston.info('Stories.updateStory');
  db.run('update stories set story = ? where story_id = ?', [req.body.story, req.body.story_id], function(err) {
    if (err) {
      logger.winston.info("Error updating the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Updated' });
    }
  });
}

function removeStory(req, res) {
  logger.winston.info('Stories.updateStory');
  db.run('delete from stories where story_id = ?', req.query.story_id, function(err) {
    if (err) {
      logger.winston.info("Error removing the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}

module.exports = {
  getSingleStory,
  getAllBotStories,
  createStory,
  updateStory,
  removeStory
};
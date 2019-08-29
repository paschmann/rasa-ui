const db = require('./db');
const logger = require('../util/logger');

if (!String.prototype.splice) {
  /**
   * {JSDoc}
   *
   * The splice() method changes the content of a string by removing a range of
   * characters and/or adding new characters.
   *
   * @this {String}
   * @param {number} start Index at which to start changing the string.
   * @param {number} delCount An integer indicating the number of old chars to remove.
   * @param {string} newSubStr The String that is spliced in.
   * @return {string} A new string with the spliced substring.
   */
  String.prototype.splice = function(start, delCount, newSubStr) {
      return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
  };
}

function getBotActionsAndResponses(req, res, next) {
  logger.winston.info('actions.getBotActions');
  db.all('select * from actions where bot_id = ? order by action_id desc', req.query.bot_id, function(err, actions) {
    if (err) {
      logger.winston.info(err);
    } else {
      var actionIds = [];
      for (var i = 0; i < actions.length; i++) {
        actionIds.push(actions[i].action_id);
      }
      if (actionIds.length > 0) {
        db.all('select * from responses where action_id in (' + actionIds.splice(",") + ')  order by action_id desc', function(err, responses) {
          if (err) {
            logger.winston.info(err);
          } else {
            res.status(200).json([{actions: actions, responses: responses}]);
          }
        });
      } else {
        res.status(200).json([{actions: actions, responses: []}]);
      }
    }
  });
}

function createAction(req, res, next) {
  logger.winston.info('actions.createAction');
  db.run('insert into actions (action_name, bot_id)' + 'values (?,?)', [req.body.action_name, req.body.bot_id], function(err) {
    if (err) {
      logger.winston.info("Error inserting a new record");
    } else {
      res.status(200).json({ status: 'success', message: 'Inserted' });
    }
  });
}


function removeAction(req, res, next) {
  logger.winston.info('actions..removeAction');
  db.run('delete from actions where action_id = ?', req.query.action_id, function(err) {
    if (err) {
      logger.winston.info("Error removing the record");
    } else {
      db.run('delete from responses where action_id = ?', req.query.action_id);
      res.status(200).json({ status: 'success', message: 'Removed' });
    }
  });
}


function updateAction(req, res, next) {
  logger.winston.info('actions.updateAction');
  db.run('update actions set action_name = ? where action_id = ?', [req.body.action_name, req.body.bot_id], function(err) {
    if (err) {
      logger.winston.info("Error updating the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Updated' });
    }
  });
}

module.exports = {
  getBotActionsAndResponses,
  createAction,
  updateAction,
  removeAction
};

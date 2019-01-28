const db = require('./db');
const logger = require('../util/logger');

function getSingleSetting(req, res, next) {
  logger.winston.info('settings.getSingleSetting');
  const settingName = req.params.setting_name;
  db.one('select * from settings where setting_name = $1', settingName)
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function getSettings(req, res, next) {
  logger.winston.info('settings.getSettings');
  db.any('select * from settings')
    .then(function(data) {
      res.status(200).json(data);
    })
    .catch(function(err) {
      return next(err);
    });
}

function updateSetting(req, res, next) {
  logger.winston.info('settings.updateSetting');
  db.none('update settings set setting_value=$1 where setting_name=$2', [
    req.body.setting_value,
    req.params.setting_name
  ])
    .then(function() {
      res.status(200).json({
        status: 'success',
        message: 'Updated setting',
      });
    })
    .catch(function(err) {
      return next(err);
    });
}

module.exports = {
  getSingleSetting,
  getSettings,
  updateSetting,
};

const db = require('./db');
const logger = require('../util/logger');

function getSingleSetting(req, res, next) {
  logger.winston.info('settings.getSingleSetting');
  const settingName = req.params.setting_name;

  db.get('select * from settings where setting_name = ?', settingName, function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function getSettings(req, res, next) {
  logger.winston.info('settings.getSettings');
  db.all('select * from settings', function(err, settings) {
    if (err) {
      logger.winston.error(err);
    } else {
      db.all('select * from version', function(err, version) {
        settings.push({ 'ui_version': version[0].version }); 
        res.status(200).json(settings);
      });
    }
  });
}

function updateSetting(req, res, next) {
  logger.winston.info('settings.updateSetting');
  db.run('update settings set setting_value = ? where setting_name = ?', [req.body.setting_value, req.body.setting_name], function(err) {
    if (err) {
      logger.winston.error("Error updating the record");
    } else {
      res.status(200).json({ status: 'success', message: 'Updated' });
    }
  });
}

module.exports = {
  getSingleSetting,
  getSettings,
  updateSetting};

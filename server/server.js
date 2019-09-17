// Global Variables
global.rasa_endpoint =  process.env.rasa_endpoint || process.env.npm_package_config_rasa_endpoint;
global.jwtsecret = process.env.jwtsecret || process.env.npm_package_config_jwtsecret;
global.loglevel = process.env.loglevel || process.env.npm_package_config_loglevel;
global.admin_username = process.env.admin_username || process.env.npm_package_config_admin_username;
global.admin_password = process.env.admin_password || process.env.npm_package_config_admin_password;
global.db_schema = process.env.db_schema || process.env.npm_package_config_db_schema;
global.db_autoupdate = process.env.db_autoupdate || process.env.npm_package_config_db_autoupdate;

const express = require('express');
const proxy = require('http-proxy-middleware');
const bodyParser = require('body-parser');
var app = express();
const request = require('request');
const routes = require('./routes/index');
const db = require('./db/db');

const logger = require('./util/logger');

app.use(
  bodyParser.urlencoded({
    parameterLimit: 10000,
    limit: '2mb',
    extended: true
  })
);
app.use(bodyParser.json({ limit: '2mb' }));

/** Serve static files for UI website on root / */
app.use('/', express.static('web/src/'));
app.use('/scripts', express.static('node_modules/'));

const server = require('http').createServer(app);
 
app.use('/api/v2/', routes);

if (app.get('env') === 'development') {
  // error handlers
  // development error handler
  // will print stacktrace
  app.use(function(err, req, res, next) {
    res.status(err.code || 500).json({
      status: 'error',
      message: err
    });
  });
} else {
  // production error handler
  // no stacktraces leaked to user
  app.use(function(err, req, res, next) {
    res.status(err.status || 500).json({
      status: 'error',
      message: err
    });
  });
}

const listener = server.listen(5001);

checkRasaUI();
checkRasa();

function checkRasaUI() {
  logger.winston.info(
    'Rasa UI Server: http://localhost:' + listener.address().port
  );
}

function checkRasa() {
  request(global.rasa_endpoint + '/status', {timeout: 12000}, function(error, response, body) {
    try {
      logger.winston.info('Rasa Server: ' + global.rasa_endpoint);
      if (body !== undefined) {
        logger.winston.info('--> Connected');
      }
      if (error !== null) {
        logger.winston.error('--> Unable to connect to Rasa Server: ' + error);
      }
    } catch (err) {
      logger.winston.error('Rasa Connection Error: ' + err);
    }
  });
}

module.exports = server
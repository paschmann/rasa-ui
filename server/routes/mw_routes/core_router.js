let request = require('request');
const logger = require('../../util/logger');

//only for Error cases.
function sendHTTPResponse(http_code, res, body) {
  res.writeHead(http_code, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'});
  if (body != null && body !== '') {
    res.write(body);
  }
  res.end();
}

function restartRasaCoreConversation(req, res) {
  logger.winston.info(
    'Rasa Core Restart Request -> ' + global.rasacoreendpoint
  );
  try {
    request(
      {
        method: 'POST',
        uri:
          global.rasacoreendpoint +
          '/conversations/' +
          req.jwt.username +
          '/continue',
        body: JSON.stringify({ events: [{ event: 'restart' }] })},
      function(error, response, body) {
        if (error) {
          logger.winston.info(error);
          sendHTTPResponse(500, res, '{"error" : "Exception caught !!"}');
          return;
        }
        logger.winston.info('Restart Response' + JSON.stringify(body));
        sendHTTPResponse(200, res, body);
      }
    );
  } catch (err) {
    logger.winston.info(err);
    sendHTTPResponse(500, res, '{"error" : "Exception caught !!"}');
  }
}

function getRasaCoreVersion() {
  logger.winston.info(
    'Rasa Core Version Request -> ' + global.rasacoreendpoint + '/version'
  );
  return new Promise(function(resolve, reject) {
    request(`${global.rasacoreendpoint}/version`, function(error, res, body) {
      if (!error && res.statusCode === 200) {
        resolve(body);
      } else {
        reject(error);
      }
    });
  });
}

module.exports = {
  getRasaCoreVersion,
  restartRasaCoreConversation};

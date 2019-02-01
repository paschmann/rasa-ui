const request = require('request');
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
          `${global.rasacoreendpoint}/conversations/${req.jwt.username}/tracker/events`,
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

function parseRequest(req, res, next, agentObj) {
    // Allow to add a project name and a conversation id in your rasa core url
    const path_core = global.rasacorerequestpath
      .replace('{id}', req.jwt.username)
      .replace('{project}', req.body.project);
    let core_url = global.rasacoreendpoint + path_core;
    if (global.coresecuritytoken !== '') {
      core_url = core_url + '?token=' + global.coresecuritytoken;
    }
    try {
      request(
        {
          headers: {
            Authorization: 'Bearer ' + global.corejwttoken
          },
          method: 'POST',
          uri: core_url,
          body: { query: req.body.q },
          json: true},
        function(error, response, body) {
          if (error) {
            logger.winston.info(error);
            sendHTTPResponse(
              500,
              res,
              '{"error" : "A problem has occurred"}'
            );
            return;
          }
          if (
            response.status !== 200 &&
            typeof response.status !== 'undefined'
          ) {
            sendHTTPResponse(response.statusCode, res, body);
          } else {
            // If the status is 200, only display the text for the moment
            // TODO Display images
            let response = '';

            body.forEach(function(element) {
              response += element.text + ' \r\n';
              logger.winston.info('Réponse : ', response);
              if (element.hasOwnProperty('buttons')) {
                logger.winston.info('Has property : ', element);
                element.buttons.forEach(function(button) {
                  logger.winston.info('Button : ', button);
                  response += `- '${button.title}\r\n`;
                });
              }
            });

            sendHTTPResponse(200, res, response);
          }
        }
      );
    } catch (err) {
      logger.winston.info(err);
      sendHTTPResponse(
        500,
        res,
        '{"error" : "A problem has occurred"}'
      );
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
  parseRequest,
  restartRasaCoreConversation};

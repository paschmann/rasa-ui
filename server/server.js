var express = require('express');
var proxy = require('http-proxy-middleware');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var routes = require('./routes/index')
var cors = require('cors')
const db = require('./db/db')

app.use(cors())

const url = require('url');

app.use(bodyParser.json());

/** Serve static files for UI website on root / */
app.use('/', express.static('web/src/'));

app.use('/api/v2/', routes);

/** Middleware layer for logging and then shuttling requests to the Rasa API */
app.use('/api/v2/rasa/', function(req, res) {
  try {
    //Strip /api off request
    var request_url = req.originalUrl.split('/rasa')[1];

    console.log(req.method + ": " + request_url + " -> " + process.env.npm_package_config_rasaserver + request_url);

    var path = url.parse(req.url).pathname.split('/').pop();

    if (req.method === 'GET') {
      rasa_response = "";
      response_text = "";

      request(process.env.npm_package_config_rasaserver + request_url, function (error, response, body) {
        try {
          if (body !== undefined) {
            if (path == 'parse') {
              rasa_response = body;
              getResponseText(JSON.parse(rasa_response).intent.name, res);
              augmentParse(res);
            } else {
              sendOutput(200, res, body);
            }
            // TODO: Check that the response includes the required fields, otherwise, return the incomplete flag? Maybe this should rather be in the backend
          } else {
            sendOutput(404, res, '{"error" : "Server Error"}');
          }
          //res.end();
        } catch (err) {
          console.log(err);
        }
      });
    } else if (req.method === 'OPTIONS') {
      try {
        sendOutput(200, res);
      } catch (err) {
        console.log(err);
      }
    } else {
      request({
        method: req.method,
        uri: process.env.npm_package_config_rasaserver + request_url,
        body: JSON.stringify(req.body),
        headers: req.headers
      }, function (error, response, body) {
        try {
          sendOutput(200, res, "");
          console.log(response);
        } catch (err) {
          console.log(err);
        }
      });
    }

    if (path == 'parse') {
      var model = getParameterByName('model', request_url) !== undefined ? getParameterByName('model', request_url) : "default";
      logRequest(req, path, {model: model, intent: '', query: getParameterByName('q', request_url)});
    } else {
      logRequest(req, path);
    }
  } catch (err) {
    console.log("Error: " + err);
  }
});

function augmentParse(res){
  if (rasa_response !== '' && response_text !== '') {
    var objResponse = JSON.parse(rasa_response);
    objResponse.response_text = response_text;
    sendOutput(200, res, JSON.stringify(objResponse));
  }
}

function sendOutput(http_code, res, body) {
  res.writeHead(http_code, {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json'
  });
  if (body !== "") {
    res.write(body);
  }
  res.end();
}

function getResponseText(intent_name, res) {
  db.any('SELECT responses.response_text FROM responses, intents where responses.intent_id = intents.intent_id and intents.intent_name = $1 order by random() LIMIT 1', intent_name)
    .then(function (data) {
      if (data.length > 0) {
        response_text = data[0].response_text;
      } else {
        response_text = undefined;
      }
      augmentParse(res);
    })
    .catch(function (err) {
      //res.write(err);
      console.log(err);
    });
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
  results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function logRequest(req, type, data) {
  try {
    var obj = {};
    obj.ip_address = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    obj.query = req.originalUrl;
    obj.event_type = type;
    obj.event_data = data;

    db.any('insert into nlu_log(ip_address, query, event_type, event_data)' +
      'values(${ip_address}, ${query}, ${event_type}, ${event_data})',
      obj)
      .catch(function (err) {
        console.log(err);
      });
  } catch (err) {
    console.log("Error: " + err);
  }
}

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status( err.code || 500 )
    .json({
      status: 'error',
      message: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500)
  .json({
    status: 'error',
    message: err.message
  });
});

app.listen(5001);

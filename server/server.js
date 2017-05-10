var express = require('express');
var proxy = require('http-proxy-middleware');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
const url = require('url');

app.use(bodyParser.json());

/** Serve static files for UI website on root / */
app.use('/', express.static('web/src/'));

/** Middleware layer for shuttling requests to both Postgres DB (via Postgrest) and to the Rasa API */
app.use('/api', function(req, res) {
  try {
    //Strip /api off request
    var request_url = req.originalUrl.split('/api')[1];

    console.log(req.method + ": " + request_url + " -> " + process.env.npm_package_config_rasaserver + request_url);

    if (req.method === 'GET') {
      request(process.env.npm_package_config_rasaserver + request_url, function (error, response, body) {
        try {
          if (body !== undefined) {
            res.writeHead(200, {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            });
            res.write(body);
          } else {
            res.writeHead(404, {
              'Access-Control-Allow-Origin': '*',
              'Content-Type': 'application/json'
            });
            res.write('{"error" : "Server Error"}');
          }
          res.end();
        } catch (err) {
          console.log(err);
        }
      });
    } else if (req.method === 'OPTIONS') {
      try {
        res.writeHead(200, {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type'
        });
        res.end();
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
          res.writeHead(200, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
          res.end();
        } catch (err) {
          console.log(err);
        }
      });
    }

    var path = url.parse(req.url).pathname.split('/').pop();
    if (path == '/parse') {
      logRequest(req, path, {model: 'unknown', intent: '', query: getParameterByName('q', request_url)});
      // TODO: Check that the response includes the required fields, otherwise, return the incomplete flag
    } else {
      logRequest(req, path, {model: 'unknown', intent: '', query: getParameterByName('q', request_url)});
    }
  } catch (err) {
    console.log("Error: " + err);
  }
});

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

    var postrequest = {
      uri: process.env.npm_package_config_postgrestserver + '/nlu_log',
      method: 'post',
      json: true,
      body: obj,
      headers: { 'Content-Type': 'application/json' }
    };

    request.post(postrequest, function (error, response, body) {
      if (error === undefined) {
        console.log("Error: " + error);
      }
    });
  } catch (err) {
    console.log("Error: " + err);
  }
}

app.listen(5001);

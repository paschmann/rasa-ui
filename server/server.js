var express = require('express');
var proxy = require('http-proxy-middleware');
var bodyParser = require('body-parser');
var app = express();
var request = require('request');
var routes = require('./routes/index')
var cors = require('cors')
var jwt = require('jsonwebtoken');

const db = require('./db/db')
const url = require('url');

app.use(cors())
app.use(bodyParser.urlencoded({
    parameterLimit: 10000,
    limit: '2mb',
    extended: true
  }));
app.use(bodyParser.json({ limit: '2mb' }));
/** Serve static files for UI website on root / */
app.use('/', express.static('web/src/'));

// route middleware to verify a token
app.use(function(req, res, next) {
  if(!req.headers.authorization) {
    if(req.originalUrl.endsWith('auth') || req.originalUrl.endsWith('authclient')){
      console.log("No Token, but got an Auth request. Allowing it");
      next();
    }else{
      return  res.status(401).send({
          success: false,
          message: 'No Authorization header.'
      });
    }
  }else {
    // read token and check it
    if (req.headers.authorization.split(' ')[0] === 'Bearer'){
        var token = req.headers.authorization.split(' ')[1];
        // verifies secret and checks exp
        jwt.verify(token, process.env.npm_package_config_jwtsecret, function(err, decoded) {
          if (err) {
            return res.json({ success: false, message: 'Failed to authenticate token.' });
          } else {
            // if everything is good, save to request for use in other routes
            req.jwt = decoded;
            req.original_token=token;
            next();
          }
        });
    }else{
      // if there is no token send error..angularjs/ chat clients  will figure how to create the token.
      return res.status(401).send({
          success: false,
          message: 'No token provided.'
      });
    }
  }
});

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

// Socket.io Communication
io.sockets.on('connection', function (socket) {
  app.set('socket', socket);
});

app.use('/api/v2/', routes);

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

server.listen(5001, function () {
  console.log('Express server listening on port ' + 5001);
});

checkDB();
checkRasaNLU();
//checkRasaCore();

function checkDB() {
  db.one('select current_database(), current_schema(), inet_server_port(), inet_server_addr()')
    .then(function (data) {
      console.log('');
      console.log('DB Connected');
      console.log('Postgres Server: ' + data["inet_server_addr"] + ':' + data["inet_server_port"]);
      console.log('Database:' + data["current_database"]);
      console.log('Schema:' + data["current_schema"]);
      console.log('');
    })
    .catch(function (err) {
      console.log('DB Connection Error: ' + err)
    });
}

function checkRasaNLU() {
  request(process.env.npm_package_config_rasaserver + '/config', function (error, response, body) {
    try {
      if (body !== undefined) {
        console.log('');
        console.log('Rasa NLU Connected');
        console.log('Rasa NLU Server: ' + process.env.npm_package_config_rasaserver);
      }
      if (error !== null) {
        console.log('');
        console.log('Rasa NLU Error: ' + error);
      }
      console.log('');
    } catch (err) {
      console.log('Rasa Connection Error: ' + err);
    }
  });
}

function checkRasaCore() {
  request(process.env.npm_package_config_rasacoreendpoint + '/config', function (error, response, body) {
    try {
      if (body !== undefined) {
        console.log('');
        console.log('Rasa Core Connected');
        console.log('Rasa Core Server: ' + process.env.npm_package_config_rasacoreendpoint);
      }
      if (error !== null) {
        console.log('');
        console.log('Rasa Core Error: ' + error);
      }
      console.log('');
    } catch (err) {
      console.log('Rasa Connection Error: ' + err);
    }
  });
}

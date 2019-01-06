// Global Variables
global.postgresserver = process.env.postgresserver || process.env.npm_package_config_postgresserver;
global.rasanluendpoint = process.env.rasanluendpoint || process.env.npm_package_config_rasanluendpoint;
global.rasacoreendpoint = process.env.rasacoreendpoint || process.env.npm_package_config_rasacoreendpoint;
global.jwtsecret = process.env.jwtsecret || process.env.npm_package_config_jwtsecret;
global.coresecuritytoken= process.env.coresecuritytoken || process.env.npm_package_config_coresecuritytoken;
global.corejwttoken= process.env.corejwttoken || process.env.npm_package_config_corejwttoken;
global.nlusecuritytoken= process.env.nlusecuritytoken || process.env.npm_package_config_nlusecuritytoken;
global.cacheagents= process.env.cacheagents || process.env.npm_package_config_cacheagents;
global.rasacorerequestpath = process.env.rasacorerequestpath || process.env.npm_package_config_rasacorerequestpath;
global.azureadauthentication = process.env.azureadauthentication || process.env.npm_package_config_azureadauthentication;
global.azureadtenantid = process.env.azureadtenantid || process.env.npm_package_config_azureadtenantid;
global.azureddclientid = process.env.azureddclientid || process.env.npm_package_config_azureddclientid;

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


if (global.azureadauthentication) {
  // Passport for Azure AD
  var passport = require('passport');
  var OIDCBearerStrategy = require('passport-azure-ad').BearerStrategy;

  var options = {
      // Metadata/Azure AD tenantID/clientID
      identityMetadata: 'https://login.microsoftonline.com/' + global.azureadtenantid + '/.well-known/openid-configuration',
      clientID: global.azureddclientid,
      // Validate issuer
      validateIssuer: true,
      issuer: 'https://sts.windows.net/' + global.azureadtenantid + "/",
      //passReqToCallback: false,
      loggingLevel: 'error'
  };

  var bearerStrategy = new OIDCBearerStrategy(options,
    function(token, done) {
        //console.log(token, 'was the token retrieved');
        if (!token.oid)
            done(new Error('oid is not found in token'));
        else {
            owner = token.oid;
            done(null, token);
        }
    }
  );

  app.use(passport.initialize());
  passport.use(bearerStrategy);
}

app.use(cors())
app.use(bodyParser.urlencoded({
    parameterLimit: 10000,
    limit: '2mb',
    extended: true
  }));
app.use(bodyParser.json({ limit: '2mb' }));
/** Serve static files for UI website on root / */
app.use('/', express.static('web/src/'));
app.use('/scripts', express.static('node_modules/'));

// route middleware to verify a token
app.use(function(req, res, next) {
  if(req.originalUrl.endsWith('health')) {
    next();
  } else {

    if ((global.azureadauthentication == "true") && (!req.originalUrl.endsWith('logEvents'))) {

      // Azure AD authentication
      passport.authenticate('oauth-bearer', function(err, user, info) {

        if (err) {
          console.error('ERROR passport.authenticate oauth-bearer');
          return res.status(401).send({
            success: false,
            message: 'No token provided.'
          });
          // return next(err); 
        }

        if (!user) {
          console.error("ERROR JWT token verify failed");
          return res.status(401).send({
            success: false,
            message: 'No token provided.'
          });
        }
        next();
  
      }) (req, res, next);

    } else {

      // Basic Authentication
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
      } else {
        // read token and check it
        if (req.headers.authorization.split(' ')[0] === 'Bearer') {
          var token = req.headers.authorization.split(' ')[1];
          // verifies secret and checks exp
          jwt.verify(token, global.jwtsecret, function(err, decoded) {
            if (err) {
              return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
              // if everything is good, save to request for use in other routes
              req.jwt = decoded;
              req.original_token=token;
              next();
            }
          });
        } else {
          // if there is no token send error..angularjs/ chat clients  will figure how to create the token.
          return res.status(401).send({
              success: false,
              message: 'No token provided.'
          });
        }
      }

    }
  }
});

var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

const NodeCache = require( "node-cache" );
//https://github.com/mpneuried/nodecache
const socketCache =  new NodeCache({useClones: false});
app.set("socketCache",socketCache);
// Socket.io Communication
io.sockets.on('connection', function (socket) {
  var jwt0='';
  //console.log("All Cookies: " + socket.request.headers.cookie);
  try{
    var cookieArr =socket.request.headers.cookie.split(";");
    for (var i=0;i<cookieArr.length;i++){
      if(cookieArr[i].split("=")[0].trim()==='loggedinjwt'){
        jwt0=(cookieArr[i].split("=")[1]).split(".")[0];
        break;
      }
    }
  //console.log("Adding Socket to Sockets List");
  app.get("socketCache").set(jwt0, socket);
  }catch (err) {
    console.log('Problem when parsing the cookies. Ignoring socket' + err);
  }

  socket.on('disconnect', function(){
    //console.log("Disconnecting All Cookies: "); // + socket.request.headers.cookie);
    //console.log('Socket disconnected');
    var discjwt0='';
    try{
      var cookieArr =socket.request.headers.cookie.split(";");
      for (var i=0;i<cookieArr.length;i++){
        if(cookieArr[i].split("=")[0].trim()==='loggedinjwt'){
          discjwt0=(cookieArr[i].split("=")[1]).split(".")[0];
          break;
        }
      }
      //console.log("Removing SOCKET: " + discjwt0 + " from List: "+ JSON.stringify(app.get("socketCache").keys()));
      app.get("socketCache").del(jwt0);
    }catch (err) {
      console.log('Problem when parsing the cookies. Unable to delete socket' + err);
    }
  });
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

var listener = server.listen(5001);

checkRasaUI();
checkDB();
checkRasaNLU();
checkRasaCore();

function checkRasaUI() {
  console.log('Rasa UI Server: http://localhost:' + listener.address().port);
  console.log('');
}

function checkDB() {
  var dbconn = process.env.postgresserver != undefined ? 'process.env.postgresserver' : 'package.json';
  db.one('select current_database(), current_schema(), inet_server_port(), inet_server_addr()')
    .then(function (data) {
      console.log('');
      console.log('Postgres DB Connected');
      console.log('Using connection string from: ' + dbconn);
      console.log('Postgres Server: ' + data["inet_server_addr"] + ':' + data["inet_server_port"]);
      console.log('Database:' + data["current_database"]);
      console.log('Schema:' + data["current_schema"]);
      console.log('');
    })
    .catch(function (err) {
      console.log('Postgres DB Connection Error: ' + err);
      console.log('Using connection string from: ' + dbconn);
    });
}

function checkRasaNLU() {
  var rasaconn = process.env.rasanluendpoint != undefined ? 'process.env.rasanluendpoint' : 'package.json';
  request(global.rasanluendpoint + '/config', function (error, response, body) {
    try {
      if (body !== undefined) {
        console.log('');
        console.log('Rasa NLU Connected');
        console.log('Using connection string from: ' + rasaconn);
        console.log('Rasa NLU Server: ' + global.rasanluendpoint);
      }
      if (error !== null) {

        console.log('');
        console.log('Rasa NLU Error: ' + error);
        console.log('Using connection string from: ' + rasaconn);
      }
      console.log('');
    } catch (err) {
      console.log('Rasa Connection Error: ' + err);
    }
  });
}

function checkRasaCore() {
  var rasacoreconn = process.env.rasacoreendpoint != undefined ? 'process.env.rasacoreendpoint' : 'package.json';
  request(global.rasacoreendpoint + '/version', function (error, response, body) {
    try {
      if (body !== undefined) {
        console.log('');
        console.log('Rasa Core Connected');
        console.log('Using connection string from: ' + rasacoreconn);
        console.log('Rasa Core Server: ' + global.rasacoreendpoint);
      }
      if (error !== null) {
        console.log('');
        console.log('Rasa Core Error: ' + error);
        console.log('Using connection string from: ' + rasacoreconn);
      }
      console.log('');
    } catch (err) {
      console.log('Rasa Connection Error: ' + err);
    }
  });
}

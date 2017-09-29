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
app.use(bodyParser.json());
/** Serve static files for UI website on root / */
app.use('/', express.static('web/src/'));

// route middleware to verify a token
app.use(function(req, res, next) {
  if(!req.headers.authorization) {
    if(req.originalUrl.endsWith('auth')){
      console.log("NO Token, but got an Auth request. Allowing it");
      next();
    }else{
      return  res.status(401).send({
          success: false,
          message: 'No Autherization header.'
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

app.listen(5001);

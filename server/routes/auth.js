var jwt = require('jsonwebtoken');
const db = require('../db/db');
const config = require("../config");

function authenticateUser(req, res, next) {
  //authenticate user
  console.log("Authenticate User");
  if(req.body.username =='admin' && req.body.password=='admin'){
    //create token and send it back
    var tokenData = {username:'admin',name: 'Portal Administrator'};
    // if user is found and password is right
    // create a token
    var token = jwt.sign(tokenData, config.jwtsecret);
    // return the information including token as JSON
    res.json({username: 'admin',token: token});
  }else{
    console.log("Information didnt match or not provided.")
    return res.status(401).send({
        success: false,
        message: 'Username and password didnt match.'
    });
  }
}

function authenticateClient(req, res, next) {
  //authenticate client based on client secret key
  //username,user_fullname,agent_name,client_secret_key should all be present in the body
  console.log("Authenticate Client");
  db.one('select * from agents where agent_name = $1 and client_secret_key=$2', [req.body.agent_name,req.body.client_secret_key])
    .then(function (data) {
      var tokenData = {username:req.body.username,name: req.body.user_fullname};
      // if user is found and password is right
      // create a token
      var token = jwt.sign(tokenData, config.jwtsecret);
      // return the information including token as JSON
      res.status(200).json({username:req.body.username,token: token});
    }).catch(function (err) {
      console.log("Client Authentication error: "+ err);
      return res.status(401).send({
          success: false,
          message: 'Client Authentication failed.'
      });
    });
}

module.exports = {
  authenticateUser: authenticateUser,
  authenticateClient:authenticateClient
};

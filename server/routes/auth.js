const jwt = require('jsonwebtoken');
const db = require('../db/db');
const logger = require('../util/logger');

function authenticateUser(req, res, next) {
  //authenticate user
  logger.winston.info('Authenticate User');
  if (req.body.username === global.admin_username && req.body.password === global.admin_password) {
    //create token and send it back
    const tokenData = { username: 'admin', name: 'Portal Administrator' };
    // if user is found and password is right
    // create a token]
    var token = ""
    try {
      token = jwt.sign(tokenData, global.jwtsecret);
    } catch (err) {
      logger.winston.error(err);
    };
    // return the information including token as JSON
    res.json({ username: 'admin', token: token });
  } else {
    logger.winston.error('Information didnt match or not provided.');
    return res.status(401).send({
      success: false,
      message: 'Username and password didnt match.'});
  }
}

function authenticateClient(req, res, next) {
  //authenticate client based on client secret key
  //username,user_fullname,bot_name,client_secret_key should all be present in the body
  logger.winston.info('Authenticate Client');
  db.one(
    'select * from bots where bot_name = $1 and client_secret_key=$2',
    [req.body.bot_name, req.body.client_secret_key]
  )
    .then(function(data) {
      const tokenData = {
        username: req.body.username,
        name: req.body.user_fullname};
      // if user is found and password is right
      // create a token
      try {
        const token = jwt.sign(tokenData, global.jwtsecret);
      } catch (err) {
        logger.winston.error(err);
      };
      // return the information including token as JSON
      res.status(200).json({ username: req.body.username, token: token });
    })
    .catch(function(err) {
      logger.winston.error('Client Authentication error: ' + err);
      return res.status(401).send({
        success: false,
        message: 'Client Authentication failed.'});
    });
}

module.exports = {
  authenticateUser: authenticateUser,
  authenticateClient: authenticateClient
};

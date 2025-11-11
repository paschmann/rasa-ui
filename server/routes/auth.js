const jwt = require('jsonwebtoken');
const db = require('../db/db');
const logger = require('../util/logger');
const { verifyPassword, isHashedPassword } = require('../util/password');

async function authenticateUser(req, res, next) {
  //authenticate user
  logger.winston.info('Authenticate User');

  try {
    // Check username first
    if (req.body.username !== global.admin_username) {
      logger.winston.warn('Authentication failed: Invalid username');
      return res.status(401).send({
        success: false,
        message: 'Username and password didnt match.'
      });
    }

    // Verify password (supports both plain text for backward compatibility and hashed)
    let isPasswordValid = false;

    if (isHashedPassword(global.admin_password)) {
      // Password is hashed - use bcrypt to verify
      isPasswordValid = await verifyPassword(req.body.password, global.admin_password);
    } else {
      // Legacy plain text password comparison (for backward compatibility)
      logger.winston.warn('WARNING: Admin password is not hashed. Please hash it using the provided script.');
      isPasswordValid = (req.body.password === global.admin_password);
    }

    if (isPasswordValid) {
      //create token and send it back
      const tokenData = { username: 'admin', name: 'Portal Administrator' };
      // if user is found and password is right, create a token with expiration
      let token = "";
      try {
        token = jwt.sign(tokenData, global.jwtsecret, { expiresIn: '24h' });
      } catch (err) {
        logger.winston.error('Error creating JWT token:', err);
        return res.status(500).send({
          success: false,
          message: 'Error creating authentication token.'
        });
      }
      // return the information including token as JSON
      res.json({ username: 'admin', token: token });
    } else {
      logger.winston.warn('Authentication failed: Invalid password');
      return res.status(401).send({
        success: false,
        message: 'Username and password didnt match.'
      });
    }
  } catch (error) {
    logger.winston.error('Authentication error:', error);
    return res.status(500).send({
      success: false,
      message: 'Authentication error occurred.'
    });
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
      // create a token with expiration
      let token = "";
      try {
        token = jwt.sign(tokenData, global.jwtsecret, { expiresIn: '24h' });
      } catch (err) {
        logger.winston.error('Error creating JWT token:', err);
        return res.status(500).send({
          success: false,
          message: 'Error creating authentication token.'
        });
      }
      // return the information including token as JSON
      res.status(200).json({ username: req.body.username, token: token });
    })
    .catch(function(err) {
      logger.winston.error('Client Authentication error:', err);
      return res.status(401).send({
        success: false,
        message: 'Client Authentication failed.'});
    });
}

module.exports = {
  authenticateUser: authenticateUser,
  authenticateClient: authenticateClient
};

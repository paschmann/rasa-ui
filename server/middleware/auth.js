const jwt = require('jsonwebtoken');
const logger = require('../util/logger');

/**
 * Middleware to verify JWT tokens on protected routes
 *
 * This middleware checks for a JWT token in the Authorization header
 * and verifies it against the configured JWT secret. If valid, the
 * decoded token data is attached to req.user for use in route handlers.
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function verifyToken(req, res, next) {
  // Get token from Authorization header
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    logger.winston.warn('Authentication failed: No authorization header provided');
    return res.status(401).json({
      success: false,
      message: 'No authentication token provided.'
    });
  }

  // Authorization header format: "Bearer <token>"
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    logger.winston.warn('Authentication failed: Invalid authorization header format');
    return res.status(401).json({
      success: false,
      message: 'Invalid authorization header format. Use: Bearer <token>'
    });
  }

  const token = parts[1];

  // Verify the token
  jwt.verify(token, global.jwtsecret, (err, decoded) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        logger.winston.warn('Authentication failed: Token expired');
        return res.status(401).json({
          success: false,
          message: 'Authentication token has expired. Please login again.'
        });
      } else if (err.name === 'JsonWebTokenError') {
        logger.winston.warn('Authentication failed: Invalid token');
        return res.status(401).json({
          success: false,
          message: 'Invalid authentication token.'
        });
      } else {
        logger.winston.error('JWT verification error:', err);
        return res.status(500).json({
          success: false,
          message: 'Error verifying authentication token.'
        });
      }
    }

    // Token is valid, attach user info to request
    req.user = decoded;
    logger.winston.debug('Token verified for user:', decoded.username);
    next();
  });
}

/**
 * Middleware to optionally verify JWT tokens
 * If a token is present and valid, req.user is populated
 * If no token or invalid token, the request continues without req.user
 *
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    // No token provided, continue without authentication
    return next();
  }

  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    // Invalid format, continue without authentication
    return next();
  }

  const token = parts[1];

  jwt.verify(token, global.jwtsecret, (err, decoded) => {
    if (!err) {
      // Token is valid, attach user info
      req.user = decoded;
    }
    // Continue regardless of token validity
    next();
  });
}

module.exports = {
  verifyToken,
  optionalAuth
};

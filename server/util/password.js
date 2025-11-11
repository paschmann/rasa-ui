const bcrypt = require('bcrypt');
const logger = require('./logger');

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password using bcrypt
 * @param {string} plainPassword - The plain text password to hash
 * @returns {Promise<string>} The hashed password
 */
async function hashPassword(plainPassword) {
  try {
    const hash = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hash;
  } catch (error) {
    logger.winston.error('Error hashing password:', error);
    throw error;
  }
}

/**
 * Verify a plain text password against a hash
 * @param {string} plainPassword - The plain text password to verify
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} True if password matches, false otherwise
 */
async function verifyPassword(plainPassword, hashedPassword) {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    logger.winston.error('Error verifying password:', error);
    throw error;
  }
}

/**
 * Check if a string is already a bcrypt hash
 * @param {string} str - The string to check
 * @returns {boolean} True if the string is a bcrypt hash
 */
function isHashedPassword(str) {
  // Bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
  return /^\$2[aby]\$\d{2}\$.{53}$/.test(str);
}

module.exports = {
  hashPassword,
  verifyPassword,
  isHashedPassword
};

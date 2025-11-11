const db = require('./db');
const logger = require('../util/logger');
const fs = require('fs');
const path = require('path');

// Define the allowed base directory for model files
const MODELS_BASE_DIR = path.resolve(__dirname, '../data/models');

/**
 * Validates that a file path is safe and within the allowed directory
 * @param {string} filePath - The file path to validate
 * @returns {Object} - { isValid: boolean, resolvedPath: string, error: string }
 */
function validateFilePath(filePath) {
  if (!filePath || typeof filePath !== 'string') {
    return { isValid: false, error: 'Invalid file path provided' };
  }

  // Decode URL encoding to prevent bypasses like ..%2f
  let decodedPath = filePath;
  try {
    decodedPath = decodeURIComponent(filePath);
  } catch (e) {
    // If decoding fails, use original path
  }

  // Resolve the absolute path
  const resolvedPath = path.resolve(decodedPath);

  // Check if the resolved path is within the allowed base directory
  if (!resolvedPath.startsWith(MODELS_BASE_DIR)) {
    logger.winston.warn('Path traversal attempt detected:', filePath, 'resolved to:', resolvedPath);
    return {
      isValid: false,
      error: 'Access denied: Path is outside allowed directory',
      resolvedPath
    };
  }

  // Additional security checks
  // Prevent paths with null bytes
  if (filePath.indexOf('\0') !== -1) {
    return { isValid: false, error: 'Invalid characters in path' };
  }

  // Check if file exists and is a file (not a directory)
  try {
    const stats = fs.statSync(resolvedPath);
    if (!stats.isFile()) {
      return { isValid: false, error: 'Path is not a file' };
    }
  } catch (err) {
    // File doesn't exist - this is okay, we might be trying to delete it
    if (err.code !== 'ENOENT') {
      return { isValid: false, error: 'Error accessing file: ' + err.message };
    }
  }

  return { isValid: true, resolvedPath };
}

function getBotModels(req, res, next) {
  logger.winston.info('Model.getBotModels');
  db.all('select * from models where bot_id = ?  order by model_id desc', req.params.bot_id, function(err, data) {
    if (err) {
      logger.winston.error(err);
    } else {
      res.status(200).json(data);
    }
  });
}

function createModel(req, res, next) {
  logger.winston.info('Bot.createModel');
  db.run('insert into models(model_name, comment, bot_id, server_path, local_path)' + 'values (?,?,?,?,?)', [req.body.file_name, req.body.comment, req.body.bot_id, req.body.server_path, 'Manually added'], function (err) {
    if (err) {
      logger.winston.error("Error inserting a new record: " + err);
    } else {
      logger.winston.info("Model saved to models table");
      res.status(200).json({ status: 'success', message: 'Inserted' });
    }
  });
}

function removeModel(req, res, next) {
  logger.winston.info('Model.removeModel');
  db.run('delete from models where model_id = ?', req.query.model_id, function(err) {
    if (err) {
      logger.winston.error("Error removing the record:", err);
      return res.status(500).json({ status: 'error', message: 'Failed to remove model from database' });
    }

    // Only attempt to delete file if local_path is provided and not manually added
    if (req.query.local_path && req.query.local_path !== "Manually Added") {
      // Validate the file path before deletion
      const validation = validateFilePath(req.query.local_path);

      if (!validation.isValid) {
        logger.winston.error('Invalid file path for deletion:', validation.error);
        // Model deleted from DB, but file deletion failed - inform user
        return res.status(200).json({
          status: 'partial_success',
          message: 'Model removed from database, but file could not be deleted: ' + validation.error
        });
      }

      // Path is valid, proceed with deletion
      fs.unlink(validation.resolvedPath, (err) => {
        if (err) {
          logger.winston.error('Error deleting model file:', err);
          return res.status(200).json({
            status: 'partial_success',
            message: 'Model removed from database, but file deletion failed: ' + err.message
          });
        }
        logger.winston.info('Model file deleted successfully:', validation.resolvedPath);
        res.status(200).json({ status: 'success', message: 'Model and file removed successfully' });
      });
    } else {
      // No file to delete, just return success
      res.status(200).json({ status: 'success', message: 'Model removed from database' });
    }
  });
}

module.exports = {
  getBotModels,
  removeModel,
  createModel
};
/**
 * Error Handler Service
 * Provides centralized error handling for API calls
 */
angular.module('app').factory('ErrorHandler', ['$rootScope', '$timeout', function($rootScope, $timeout) {

  var service = {
    handleError: handleError,
    formatErrorMessage: formatErrorMessage,
    showError: showError,
    clearError: clearError
  };

  /**
   * Main error handling function
   * @param {Object} error - Error object from API call
   * @param {String} context - Context/operation that failed (e.g., "saving bot")
   * @returns {String} Formatted error message
   */
  function handleError(error, context) {
    var message = formatErrorMessage(error, context);
    showError(message);
    return message;
  }

  /**
   * Format error message based on error type
   * @param {Object} error - Error object
   * @param {String} context - Context/operation
   * @returns {String} Formatted message
   */
  function formatErrorMessage(error, context) {
    var prefix = context ? 'Error ' + context + ': ' : 'Error: ';

    // Check if error has data with message
    if (error && error.data) {
      if (error.data.message) {
        return prefix + error.data.message;
      }
      if (error.data.error) {
        return prefix + error.data.error;
      }
      if (typeof error.data === 'string') {
        return prefix + error.data;
      }
    }

    // Handle HTTP status codes
    if (error && error.status) {
      switch (error.status) {
        case 400:
          return prefix + 'Invalid request. Please check your input.';
        case 401:
          return 'Your session has expired. Please log in again.';
        case 403:
          return prefix + 'You don\'t have permission to perform this action.';
        case 404:
          return prefix + 'The requested resource was not found.';
        case 409:
          return prefix + 'A conflict occurred. This item may already exist.';
        case 422:
          return prefix + 'Validation failed. Please check your input.';
        case 500:
          return prefix + 'Server error. Please try again later.';
        case 503:
          return prefix + 'Service unavailable. Please try again later.';
        case -1:
        case 0:
          return prefix + 'Network error. Please check your connection.';
        default:
          return prefix + 'An unexpected error occurred (Status: ' + error.status + ').';
      }
    }

    // Handle network errors
    if (error && error.statusText) {
      if (error.statusText === 'timeout') {
        return prefix + 'Request timed out. Please try again.';
      }
      return prefix + error.statusText;
    }

    // Fallback for unknown errors
    return prefix + 'An unexpected error occurred.';
  }

  /**
   * Display error message to user
   * @param {String} message - Error message to display
   * @param {Number} duration - How long to display (milliseconds)
   */
  function showError(message, duration) {
    duration = duration || 5000; // Default 5 seconds

    $rootScope.errorMessage = {
      text: message,
      type: 'danger',
      visible: true
    };

    // Auto-hide after duration
    $timeout(function() {
      clearError();
    }, duration);
  }

  /**
   * Clear/hide error message
   */
  function clearError() {
    if ($rootScope.errorMessage) {
      $rootScope.errorMessage.visible = false;
    }
  }

  return service;
}]);

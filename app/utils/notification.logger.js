const { createLogger } = require('../config/logger.config');

// Create a logger instance
const logger = createLogger();

/**
 * Notification Logger Utility
 * Provides trace-level debug logging for notification operations
 * Respects log level configuration and maintains backward compatibility
 */
class NotificationLogger {
  constructor() {
    this.logger = logger;
  }

  /**
   * Log trace information for debugging (maps to debug level)
   * @param {string} operation - The operation being performed
   * @param {string} message - The log message
   * @param {Object} metadata - Additional metadata
   */
  trace(operation, message, metadata = {}) {
    this.logger.debug(message, {
      service: 'notification',
      operation,
      level: 'trace',
      ...metadata
    });
  }

  /**
   * Log debug information
   * @param {string} operation - The operation being performed
   * @param {string} message - The log message
   * @param {Object} metadata - Additional metadata
   */
  debug(operation, message, metadata = {}) {
    this.logger.debug(message, {
      service: 'notification',
      operation,
      ...metadata
    });
  }

  /**
   * Log info level messages
   * @param {string} operation - The operation being performed
   * @param {string} message - The log message
   * @param {Object} metadata - Additional metadata
   */
  info(operation, message, metadata = {}) {
    this.logger.info(message, {
      service: 'notification',
      operation,
      ...metadata
    });
  }

  /**
   * Log warning messages
   * @param {string} operation - The operation being performed
   * @param {string} message - The log message
   * @param {Object} metadata - Additional metadata
   */
  warn(operation, message, metadata = {}) {
    this.logger.warn(message, {
      service: 'notification',
      operation,
      ...metadata
    });
  }

  /**
   * Log error messages
   * @param {string} operation - The operation being performed
   * @param {string} message - The log message
   * @param {Object} metadata - Additional metadata
   */
  error(operation, message, metadata = {}) {
    this.logger.error(message, {
      service: 'notification',
      operation,
      ...metadata
    });
  }

  /**
   * Log customer operation events (backward compatible with existing console.log)
   * @param {string} operation - The operation being performed (create, update, delete, etc.)
   * @param {string} message - The log message
   * @param {Object} data - The data being processed
   */
  logCustomerOperation(operation, message, data = null) {
    // Trace level logging for detailed debugging
    this.trace(operation, `Customer operation: ${message}`, {
      customerData: data,
      timestamp: new Date().toISOString()
    });

    // Also log at info level for general operation tracking
    this.info(operation, message, data ? { customerId: data.id } : {});

    // Backward compatibility: still log to console if LOG_LEVEL is not set or is 'console'
    if (!process.env.LOG_LEVEL || process.env.LOG_LEVEL === 'console') {
      console.log(message, data || '');
    }
  }

  /**
   * Log database operation events with trace-level details
   * @param {string} operation - The database operation (SELECT, INSERT, UPDATE, DELETE)
   * @param {string} query - The SQL query being executed
   * @param {Object} params - Query parameters
   * @param {Object} result - Query result
   * @param {Error} error - Any error that occurred
   */
  logDatabaseOperation(operation, query, params = null, result = null, error = null) {
    const metadata = {
      query: query.replace(/\s+/g, ' ').trim(), // Clean up query formatting
      params,
      resultCount: result && result.length ? result.length : (result && result.affectedRows ? result.affectedRows : 0),
      timestamp: new Date().toISOString()
    };

    if (error) {
      this.error(operation, `Database operation failed: ${error.message}`, {
        ...metadata,
        error: error.message,
        stack: error.stack
      });
    } else {
      // Trace level for detailed database operations
      this.trace(operation, `Database operation executed successfully`, metadata);
      
      // Info level for operation summary
      this.info(operation, `${operation} operation completed`, {
        resultCount: metadata.resultCount
      });
    }

    // Backward compatibility for existing console.log statements
    if (!process.env.LOG_LEVEL || process.env.LOG_LEVEL === 'console') {
      if (error) {
        console.log('error: ', error);
      } else if (result) {
        console.log(`${operation.toLowerCase()} result: `, result);
      }
    }
  }

  /**
   * Log API request/response events
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} requestData - Request data
   * @param {Object} responseData - Response data
   * @param {number} statusCode - HTTP status code
   * @param {Error} error - Any error that occurred
   */
  logApiOperation(method, endpoint, requestData = null, responseData = null, statusCode = null, error = null) {
    const operation = `${method.toUpperCase()}_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
    
    const metadata = {
      method,
      endpoint,
      statusCode,
      requestData: requestData ? JSON.stringify(requestData) : null,
      responseSize: responseData ? JSON.stringify(responseData).length : 0,
      timestamp: new Date().toISOString()
    };

    if (error) {
      this.error(operation, `API operation failed: ${error.message}`, {
        ...metadata,
        error: error.message
      });
    } else {
      // Trace level for detailed API operations
      this.trace(operation, `API request processed`, {
        ...metadata,
        responseData: responseData ? JSON.stringify(responseData) : null
      });
      
      // Info level for API operation summary
      this.info(operation, `${method} ${endpoint} - ${statusCode}`, {
        statusCode,
        responseSize: metadata.responseSize
      });
    }
  }
}

// Export singleton instance
const notificationLogger = new NotificationLogger();

module.exports = notificationLogger;
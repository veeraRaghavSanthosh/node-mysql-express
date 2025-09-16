// Logger configuration with support for different log levels
// Maintains backward compatibility with existing console.log statements

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1, 
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

const LOG_LEVEL_NAMES = {
  0: 'ERROR',
  1: 'WARN', 
  2: 'INFO',
  3: 'DEBUG',
  4: 'TRACE'
};

class Logger {
  constructor() {
    // Log level will be determined dynamically from environment
  }

  _getCurrentLogLevel() {
    // Get log level from environment variable or default to INFO
    if (!process.env.LOG_LEVEL) {
      return LOG_LEVELS.INFO;
    }
    
    const levelName = process.env.LOG_LEVEL.toUpperCase();
    const level = LOG_LEVELS[levelName];
    
    // Check if level exists (including 0 for ERROR)
    return level !== undefined ? level : LOG_LEVELS.INFO;
  }

  _shouldLog(level) {
    return level <= this._getCurrentLogLevel();
  }

  _formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const levelName = LOG_LEVEL_NAMES[level];
    
    if (typeof message === 'object') {
      message = JSON.stringify(message, null, 2);
    }

    let formattedMessage = `[${timestamp}] [${levelName}] ${message}`;
    
    if (Object.keys(meta).length > 0) {
      formattedMessage += ` | Meta: ${JSON.stringify(meta)}`;
    }

    return formattedMessage;
  }

  error(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.ERROR)) {
      console.error(this._formatMessage(LOG_LEVELS.ERROR, message, meta));
    }
  }

  warn(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this._formatMessage(LOG_LEVELS.WARN, message, meta));
    }
  }

  info(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.INFO)) {
      console.info(this._formatMessage(LOG_LEVELS.INFO, message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(this._formatMessage(LOG_LEVELS.DEBUG, message, meta));
    }
  }

  trace(message, meta = {}) {
    if (this._shouldLog(LOG_LEVELS.TRACE)) {
      console.log(this._formatMessage(LOG_LEVELS.TRACE, message, meta));
    }
  }

  // Backward compatibility method that behaves like console.log
  log(message, meta = {}) {
    // Default to INFO level for backward compatibility
    this.info(message, meta);
  }
}

// Create singleton instance
const logger = new Logger();

// Export both the instance and the class for flexibility
module.exports = {
  logger,
  Logger,
  LOG_LEVELS
};

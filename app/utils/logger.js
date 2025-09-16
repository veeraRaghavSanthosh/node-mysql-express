const util = require('util');

/**
 * Configurable Logger with support for different log levels
 * Maintains backward compatibility while adding structured logging
 */
class Logger {
  constructor(options = {}) {
    this.level = options.level || process.env.LOG_LEVEL || 'info';
    this.enableColors = options.colors !== false;
    this.enableTimestamps = options.timestamps !== false;
    
    // Log levels in order of severity
    this.levels = {
      trace: 0,
      debug: 1,
      info: 2,
      warn: 3,
      error: 4,
      fatal: 5
    };

    // Color codes for different log levels
    this.colors = {
      trace: '\x1b[37m', // white
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
      fatal: '\x1b[35m', // magenta
      reset: '\x1b[0m'   // reset
    };
  }

  /**
   * Check if a log level should be output based on current configuration
   */
  shouldLog(level) {
    return this.levels[level] >= this.levels[this.level];
  }

  /**
   * Format log message with timestamp and level
   */
  formatMessage(level, message, meta = {}) {
    let formatted = '';
    
    // Add timestamp if enabled
    if (this.enableTimestamps) {
      formatted += `[${new Date().toISOString()}] `;
    }
    
    // Add colored level if colors enabled
    if (this.enableColors) {
      formatted += `${this.colors[level]}${level.toUpperCase()}${this.colors.reset} `;
    } else {
      formatted += `${level.toUpperCase()} `;
    }
    
    // Add the main message
    formatted += message;
    
    // Add metadata if provided
    if (Object.keys(meta).length > 0) {
      formatted += ` ${util.inspect(meta, { colors: this.enableColors, depth: 2 })}`;
    }
    
    return formatted;
  }

  /**
   * Generic log method
   */
  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) {
      return;
    }

    const formatted = this.formatMessage(level, message, meta);
    
    // Use appropriate console method based on level
    if (level === 'error' || level === 'fatal') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }

  /**
   * Trace level logging - most verbose, typically for debugging flow
   */
  trace(message, meta = {}) {
    this.log('trace', message, meta);
  }

  /**
   * Debug level logging - for debugging information
   */
  debug(message, meta = {}) {
    this.log('debug', message, meta);
  }

  /**
   * Info level logging - general information
   */
  info(message, meta = {}) {
    this.log('info', message, meta);
  }

  /**
   * Warning level logging
   */
  warn(message, meta = {}) {
    this.log('warn', message, meta);
  }

  /**
   * Error level logging
   */
  error(message, meta = {}) {
    this.log('error', message, meta);
  }

  /**
   * Fatal level logging - for critical errors
   */
  fatal(message, meta = {}) {
    this.log('fatal', message, meta);
  }

  /**
   * Create a child logger with additional context
   */
  child(context = {}) {
    const childLogger = new Logger({
      level: this.level,
      colors: this.enableColors,
      timestamps: this.enableTimestamps
    });
    
    // Override log method to include context
    const originalLog = childLogger.log.bind(childLogger);
    childLogger.log = (level, message, meta = {}) => {
      const combinedMeta = { ...context, ...meta };
      originalLog(level, message, combinedMeta);
    };
    
    return childLogger;
  }

  /**
   * Set log level dynamically
   */
  setLevel(level) {
    if (this.levels.hasOwnProperty(level)) {
      this.level = level;
    } else {
      this.warn('Invalid log level', { attempted: level, valid: Object.keys(this.levels) });
    }
  }
}

// Create default logger instance
const defaultLogger = new Logger();

// Export both the class and default instance for flexibility
module.exports = {
  Logger,
  logger: defaultLogger,
  // Backward compatibility - expose methods directly
  trace: defaultLogger.trace.bind(defaultLogger),
  debug: defaultLogger.debug.bind(defaultLogger),
  info: defaultLogger.info.bind(defaultLogger),
  warn: defaultLogger.warn.bind(defaultLogger),
  error: defaultLogger.error.bind(defaultLogger),
  fatal: defaultLogger.fatal.bind(defaultLogger),
  setLevel: defaultLogger.setLevel.bind(defaultLogger)
};
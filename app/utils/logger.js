const LOG_LEVELS = {
  TRACE: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  FATAL: 5
};

class Logger {
  constructor() {
    // Default log level is INFO, can be overridden by environment variable
    this.logLevel = process.env.LOG_LEVEL ? 
      LOG_LEVELS[process.env.LOG_LEVEL.toUpperCase()] : 
      LOG_LEVELS.INFO;
  }

  setLogLevel(level) {
    if (typeof level === 'string') {
      this.logLevel = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
    } else {
      this.logLevel = level;
    }
  }

  _log(level, message, data = null) {
    if (level < this.logLevel) {
      return;
    }

    const timestamp = new Date().toISOString();
    const levelName = Object.keys(LOG_LEVELS)[level];
    
    let logMessage = `[${timestamp}] [${levelName}] ${message}`;
    
    if (data) {
      logMessage += ` ${JSON.stringify(data)}`;
    }

    console.log(logMessage);
  }

  trace(message, data = null) {
    this._log(LOG_LEVELS.TRACE, message, data);
  }

  debug(message, data = null) {
    this._log(LOG_LEVELS.DEBUG, message, data);
  }

  info(message, data = null) {
    this._log(LOG_LEVELS.INFO, message, data);
  }

  warn(message, data = null) {
    this._log(LOG_LEVELS.WARN, message, data);
  }

  error(message, data = null) {
    this._log(LOG_LEVELS.ERROR, message, data);
  }

  fatal(message, data = null) {
    this._log(LOG_LEVELS.FATAL, message, data);
  }
}

module.exports = new Logger();

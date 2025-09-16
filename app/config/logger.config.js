const winston = require('winston');

// Define log levels (winston uses npm log levels by default)
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  verbose: 4,
  debug: 5,
  silly: 6
};

// Define colors for each log level
const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  verbose: 'grey',
  debug: 'blue',
  silly: 'cyan'
};

// Add colors to winston
winston.addColors(logColors);

// Create the logger configuration
const createLogger = () => {
  // Get log level from environment variable or default to 'info'
  const logLevel = process.env.LOG_LEVEL || 'info';
  
  // Define log format
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, service, operation, ...meta }) => {
      let logMessage = `${timestamp} [${level.toUpperCase()}]`;
      
      if (service) {
        logMessage += ` [${service}]`;
      }
      
      if (operation) {
        logMessage += ` [${operation}]`;
      }
      
      logMessage += `: ${message}`;
      
      // Add metadata if present
      if (Object.keys(meta).length > 0) {
        logMessage += ` | ${JSON.stringify(meta)}`;
      }
      
      return logMessage;
    })
  );

  // Define console format (more readable for development)
  const consoleFormat = winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, service, operation, ...meta }) => {
      let logMessage = `${timestamp} [${level}]`;
      
      if (service) {
        logMessage += ` [${service}]`;
      }
      
      if (operation) {
        logMessage += ` [${operation}]`;
      }
      
      logMessage += `: ${message}`;
      
      // Add metadata if present (for console, show in a more readable format)
      if (Object.keys(meta).length > 0) {
        logMessage += `\n  Metadata: ${JSON.stringify(meta, null, 2)}`;
      }
      
      return logMessage;
    })
  );

  const logger = winston.createLogger({
    level: logLevel,
    levels: logLevels,
    defaultMeta: { service: 'nodejs-express-mysql' },
    transports: [
      // Console transport for development
      new winston.transports.Console({
        format: consoleFormat
      }),
      
      // File transport for errors
      new winston.transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: logFormat
      }),
      
      // File transport for all logs
      new winston.transports.File({
        filename: 'logs/combined.log',
        format: logFormat
      })
    ]
  });

  return logger;
};

module.exports = { createLogger, logLevels };
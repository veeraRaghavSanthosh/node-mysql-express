/**
 * Logging Configuration
 * Centralized configuration for logging behavior
 */

module.exports = {
  // Default log level - can be overridden by LOG_LEVEL environment variable
  level: process.env.LOG_LEVEL || 'info',
  
  // Enable/disable colored output
  colors: process.env.LOG_COLORS !== 'false',
  
  // Enable/disable timestamps
  timestamps: process.env.LOG_TIMESTAMPS !== 'false',
  
  // Log levels in order of severity (lower numbers = more verbose)
  levels: {
    trace: 0,   // Most verbose - detailed execution flow
    debug: 1,   // Debug information
    info: 2,    // General information (default)
    warn: 3,    // Warning messages
    error: 4,   // Error messages
    fatal: 5    // Critical errors
  },
  
  // Component-specific log levels (optional)
  componentLevels: {
    auth: process.env.AUTH_LOG_LEVEL || undefined,
    db: process.env.DB_LOG_LEVEL || undefined,
    api: process.env.API_LOG_LEVEL || undefined
  },
  
  // Security settings
  security: {
    // Whether to log sensitive data (tokens, passwords, etc.)
    logSensitiveData: process.env.LOG_SENSITIVE_DATA === 'true',
    
    // Maximum length of token prefix to log
    tokenPrefixLength: 10,
    
    // Fields to redact in request/response logging
    redactFields: ['password', 'token', 'secret', 'key', 'authorization']
  },
  
  // Performance settings
  performance: {
    // Whether to log request timing
    logTiming: process.env.LOG_TIMING !== 'false',
    
    // Threshold for slow request logging (milliseconds)
    slowRequestThreshold: parseInt(process.env.SLOW_REQUEST_THRESHOLD) || 1000
  }
};
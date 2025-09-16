#!/usr/bin/env node

// Demo script to showcase the payment logging system
const Payment = require('./app/models/payment.model');
const logger = require('./app/config/logger.config');

console.log('=== Payment Logging Demo ===');
console.log(`Current log level: ${process.env.LOG_LEVEL || 'info (default)'}`);
console.log('Available log levels: error, warn, info, debug, trace');
console.log('Set LOG_LEVEL environment variable to change log level');
console.log('');

// Demonstrate different log levels
logger.error('This is an ERROR level message', { 
  error: 'Sample error', 
  code: 500 
});

logger.warn('This is a WARN level message', { 
  warning: 'Sample warning',
  action: 'review_required'
});

logger.info('This is an INFO level message', { 
  operation: 'payment_processed',
  amount: 100.50,
  customer_id: 1
});

logger.debug('This is a DEBUG level message', { 
  debug_info: 'detailed_operation_info',
  query: 'SELECT * FROM payments WHERE id = ?',
  params: [123]
});

logger.trace('This is a TRACE level message', { 
  trace_info: 'function_entry_exit',
  function: 'processPayment',
  args: { customer_id: 1, amount: 100.50 }
});

console.log('\n=== Log Level Visibility ===');
console.log('ERROR: Always visible');
console.log('WARN:  Visible when LOG_LEVEL is warn, info, debug, or trace');
console.log('INFO:  Visible when LOG_LEVEL is info, debug, or trace');  
console.log('DEBUG: Visible when LOG_LEVEL is debug or trace');
console.log('TRACE: Only visible when LOG_LEVEL is trace');

console.log('\n=== Example Usage ===');
console.log('LOG_LEVEL=trace node demo-logging.js  # See all logs');
console.log('LOG_LEVEL=debug node demo-logging.js  # See error, warn, info, debug');
console.log('LOG_LEVEL=info node demo-logging.js   # See error, warn, info');
console.log('LOG_LEVEL=warn node demo-logging.js   # See error, warn');
console.log('LOG_LEVEL=error node demo-logging.js  # See only error');

console.log('\n=== Payment System Logging Features ===');
console.log('✓ Comprehensive trace logging for function entry/exit');
console.log('✓ Debug logging for database operations and processing steps');
console.log('✓ Info logging for successful operations with key metrics');
console.log('✓ Warn logging for business logic issues (not found, validation)');
console.log('✓ Error logging for system errors with full stack traces');
console.log('✓ Request context logging (IP addresses, user agents)');
console.log('✓ Structured JSON logging with timestamps');
console.log('✓ File-based logging (logs/error.log, logs/combined.log)');
console.log('✓ Environment-based log level configuration');
console.log('✓ Production-ready with console transport disabled in production');

console.log('\n=== Log Files ===');
console.log('Error logs: logs/error.log');
console.log('All logs: logs/combined.log');
console.log('Console: Enabled in non-production environments only');
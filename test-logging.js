#!/usr/bin/env node

/**
 * Test script to demonstrate the enhanced logging system
 */

const { logger } = require('./app/utils/logger');

console.log('='.repeat(60));
console.log('Enhanced Logging System Test');
console.log('='.repeat(60));

// Show current configuration
console.log(`Current log level: ${logger.level}`);
console.log('');

// Test all log levels
console.log('Testing all log levels:');
console.log('-'.repeat(30));

logger.trace('This is a TRACE message', { detail: 'most verbose level' });
logger.debug('This is a DEBUG message', { user: 'testuser', action: 'login' });
logger.info('This is an INFO message', { status: 'server started', port: 3000 });
logger.warn('This is a WARN message', { warning: 'rate limit approaching' });
logger.error('This is an ERROR message', { error: 'authentication failed' });
logger.fatal('This is a FATAL message', { critical: 'database connection lost' });

console.log('');

// Test child logger
console.log('Testing child logger with context:');
console.log('-'.repeat(30));

const authLogger = logger.child({ component: 'auth', requestId: 'req-12345' });
authLogger.trace('Authentication process started');
authLogger.debug('Token validation in progress');
authLogger.info('User authenticated successfully');

console.log('');
console.log('Test completed. Try running with different LOG_LEVEL values:');
console.log('  LOG_LEVEL=trace node test-logging.js');
console.log('  LOG_LEVEL=debug node test-logging.js');
console.log('  LOG_LEVEL=warn node test-logging.js');
console.log('='.repeat(60));
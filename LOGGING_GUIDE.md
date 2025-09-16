# Enhanced Logging System

This document describes the enhanced logging system added to the Node.js Express MySQL application with comprehensive authentication logging.

## Features

- **Configurable Log Levels**: trace, debug, info, warn, error, fatal
- **Authentication Logging**: Detailed trace-level logging for auth flow
- **Backward Compatibility**: Maintains existing console.log behavior
- **Environment Configuration**: Control via environment variables
- **Structured Logging**: JSON-formatted log entries with metadata
- **Request Tracking**: Unique request IDs for tracing
- **Security**: Sensitive data redaction

## Log Levels

| Level | Description | Usage |
|-------|-------------|-------|
| `trace` | Most verbose, detailed execution flow | Authentication steps, middleware flow |
| `debug` | Debug information | Development debugging, detailed operations |
| `info` | General information (default) | Application events, startup messages |
| `warn` | Warning messages | Non-critical issues, missing optional data |
| `error` | Error messages | Handled errors, authentication failures |
| `fatal` | Critical errors | Unhandled exceptions, system failures |

## Environment Configuration

Control logging behavior with these environment variables:

```bash
# Set log level (default: info)
export LOG_LEVEL=debug

# Enable/disable colors (default: true)
export LOG_COLORS=true

# Enable/disable timestamps (default: true)
export LOG_TIMESTAMPS=true

# Component-specific log levels
export AUTH_LOG_LEVEL=trace
export DB_LOG_LEVEL=debug
export API_LOG_LEVEL=info

# Security settings
export LOG_SENSITIVE_DATA=false
export SLOW_REQUEST_THRESHOLD=1000
```

## Usage Examples

### Basic Usage

```javascript
const { logger } = require('./app/utils/logger');

// Different log levels
logger.trace('Detailed execution step');
logger.debug('Debug information', { userId: 123 });
logger.info('User logged in', { userId: 123, timestamp: new Date() });
logger.warn('Rate limit approaching', { current: 95, limit: 100 });
logger.error('Authentication failed', { reason: 'invalid token' });
logger.fatal('Database connection lost');
```

### Authentication Logging

The enhanced authentication middleware automatically logs:

- **Trace Level**: Entry/exit points, token parsing, validation steps
- **Debug Level**: Authentication attempts, successful authentications
- **Warn Level**: Authentication failures, security events
- **Error Level**: Unexpected errors during authentication

### Child Loggers

Create contextual loggers for specific components:

```javascript
const { logger } = require('./app/utils/logger');

// Create a child logger with context
const authLogger = logger.child({ component: 'auth', requestId: 'req-123' });
authLogger.debug('Processing authentication'); // Includes context automatically
```

## Testing the Logging System

### 1. Start with Different Log Levels

```bash
# Show only info and above (default)
npm start

# Show debug and above
LOG_LEVEL=debug npm start

# Show everything including trace
LOG_LEVEL=trace npm start

# Show only warnings and errors
LOG_LEVEL=warn npm start
```

### 2. Test Authentication Logging

```bash
# Test with valid token (trace level)
LOG_LEVEL=trace npm start &
curl -H "Authorization: Bearer validtoken123456789" http://localhost:3000/api/test

# Test with invalid token
curl -H "Authorization: Bearer invalid" http://localhost:3000/api/test

# Test without token
curl http://localhost:3000/api/test
```

### 3. Test Public Routes

```bash
# Health check (should not require auth)
curl http://localhost:3000/health

# Status endpoint
curl http://localhost:3000/status
```

## Log Output Examples

### Trace Level Authentication

```
[2025-09-16T14:30:15.123Z] TRACE Authentication middleware invoked {
  component: 'auth',
  requestId: 'abc123def456',
  method: 'GET',
  url: '/api/customers',
  ip: '127.0.0.1'
}

[2025-09-16T14:30:15.124Z] TRACE Authorization header present, parsing token {
  component: 'auth',
  requestId: 'abc123def456'
}

[2025-09-16T14:30:15.125Z] TRACE Token extracted, validating {
  component: 'auth',
  requestId: 'abc123def456',
  tokenLength: 20,
  tokenPrefix: 'validtoken...'
}
```

### Debug Level Operations

```
[2025-09-16T14:30:15.126Z] DEBUG Authentication successful {
  component: 'auth',
  requestId: 'abc123def456',
  path: '/api/customers',
  userId: 'unknown'
}
```

### Warning Level Security Events

```
[2025-09-16T14:30:15.127Z] WARN Authentication failed - missing authorization header {
  component: 'auth',
  requestId: 'xyz789abc123',
  path: '/api/customers',
  ip: '192.168.1.100'
}
```

## Backward Compatibility

The system maintains full backward compatibility:

- Existing `console.log` statements continue to work
- Original middleware behavior is preserved
- No breaking changes to existing API
- Environment variables are optional

## Production Considerations

### Recommended Settings

```bash
# Production environment
export NODE_ENV=production
export LOG_LEVEL=warn
export LOG_COLORS=false
export LOG_SENSITIVE_DATA=false
```

### Log Rotation

Consider using process managers like PM2 for log rotation:

```json
{
  "name": "app",
  "script": "server.js",
  "log_file": "logs/app.log",
  "error_file": "logs/error.log",
  "max_size": "10M",
  "max_files": 10
}
```

## Security Notes

- Sensitive data (passwords, full tokens) is automatically redacted
- Only token prefixes are logged for debugging
- IP addresses are logged for security monitoring
- Set `LOG_SENSITIVE_DATA=false` in production

## Troubleshooting

### Common Issues

1. **Logs not appearing**: Check LOG_LEVEL setting
2. **Too verbose**: Increase log level (debug → info → warn)
3. **Missing colors**: Set LOG_COLORS=true
4. **No timestamps**: Set LOG_TIMESTAMPS=true

### Debug Commands

```bash
# Test logger directly
node -e "const {logger} = require('./app/utils/logger'); logger.info('Test message');"

# Check current log level
node -e "const {logger} = require('./app/utils/logger'); console.log('Current level:', logger.level);"
```

## Migration from Console.log

To migrate existing console.log statements:

```javascript
// Old
console.log('User created:', user);

// New
logger.info('User created', { user });

// Debug information
console.log('Debug info:', debugData);
logger.debug('Debug info', { debugData });
```
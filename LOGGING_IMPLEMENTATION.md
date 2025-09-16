# Logging Implementation for Node.js Express MySQL Application

This document describes the comprehensive logging implementation added to the notification system with trace-level debug logging that respects log level configuration while maintaining backward compatibility.

## Overview

The logging system has been enhanced with:
- **Winston** logging library for structured, configurable logging
- **Trace-level debug logging** for detailed operation tracking
- **Log level configuration** that respects environment variables
- **Backward compatibility** with existing console.log statements
- **Notification-specific logging utilities** for consistent logging across the application

## Components Added

### 1. Logger Configuration (`app/config/logger.config.js`)

- Configurable log levels (error, warn, info, http, verbose, debug, silly)
- Environment-based log level configuration via `LOG_LEVEL` environment variable
- Multiple transport options (console, file logging)
- Structured log formatting with timestamps, service names, and operations
- Color-coded console output for development
- Separate error log file for error-level messages

### 2. Notification Logger Utility (`app/utils/notification.logger.js`)

A comprehensive logging utility that provides:

#### Core Logging Methods:
- `trace(operation, message, metadata)` - Maps to debug level for detailed tracing
- `debug(operation, message, metadata)` - Debug level logging
- `info(operation, message, metadata)` - Info level logging
- `warn(operation, message, metadata)` - Warning level logging
- `error(operation, message, metadata)` - Error level logging

#### Specialized Logging Methods:
- `logCustomerOperation()` - Logs customer-related operations with backward compatibility
- `logDatabaseOperation()` - Logs database operations with query details and results
- `logApiOperation()` - Logs API requests/responses with HTTP details

### 3. Enhanced Customer Model (`app/models/customer.model.js`)

All database operations now include:
- **Trace logging** for operation start/completion
- **Database operation logging** with query details, parameters, and results
- **Error logging** with full error context and stack traces
- **Backward compatibility** with existing console.log statements
- **Detailed metadata** including affected rows, query execution details

### 4. Enhanced Customer Controller (`app/controllers/customer.controller.js`)

All API endpoints now include:
- **Trace logging** for request processing start
- **API operation logging** with request/response details
- **Error logging** with HTTP status codes and error context
- **Backward compatibility** with existing console.log statements
- **Request/response metadata** including status codes, data sizes

### 5. Enhanced Server (`server.js`)

Server initialization includes:
- **Logging system initialization**
- **Server startup logging** with configuration details
- **Middleware logging** for authentication and request processing
- **Log directory creation** if not exists
- **Backward compatibility** with existing console output

## Configuration

### Environment Variables

- `LOG_LEVEL`: Controls the logging level (default: 'info')
  - `error`: Only error messages
  - `warn`: Warning and error messages
  - `info`: Info, warning, and error messages (default)
  - `debug`: Debug, info, warning, and error messages (includes trace)
  - `silly`: All log levels

- `NODE_ENV`: Environment indicator (development/production)

### Log Levels Hierarchy

1. **error** (0) - Critical errors and failures
2. **warn** (1) - Warning conditions
3. **info** (2) - General information messages
4. **http** (3) - HTTP request logging
5. **verbose** (4) - Verbose information
6. **debug** (5) - Debug information (includes trace-level logging)
7. **silly** (6) - Very detailed debug information

## Usage Examples

### Setting Log Level for Trace Debugging

```bash
# Enable trace-level logging (debug level)
export LOG_LEVEL=debug
node server.js

# Enable only error logging
export LOG_LEVEL=error
node server.js

# Use default info level
node server.js
```

### Log Output Examples

#### Trace-level Debug Logging:
```
2023-12-07 10:30:15 [DEBUG] [notification] [customer_create]: Starting customer creation
  Metadata: {
    "customerEmail": "test@example.com",
    "customerName": "Test User",
    "customerActive": true
  }
```

#### Database Operation Logging:
```
2023-12-07 10:30:15 [DEBUG] [notification] [INSERT]: Database operation executed successfully
  Metadata: {
    "query": "INSERT INTO customers SET ?",
    "params": {"email":"test@example.com","name":"Test User","active":true},
    "resultCount": 1,
    "timestamp": "2023-12-07T10:30:15.123Z"
  }
```

#### API Operation Logging:
```
2023-12-07 10:30:15 [DEBUG] [notification] [POST_customers]: API request processed
  Metadata: {
    "method": "POST",
    "endpoint": "/customers",
    "statusCode": 200,
    "responseSize": 156,
    "timestamp": "2023-12-07T10:30:15.123Z"
  }
```

## Log Files

- `logs/combined.log`: All log messages
- `logs/error.log`: Error-level messages only
- Console output: Formatted for development with colors

## Backward Compatibility

The implementation maintains full backward compatibility:

1. **Existing console.log statements** are preserved and still function
2. **When LOG_LEVEL is not set or set to 'console'**, original console.log behavior is maintained
3. **No breaking changes** to existing API or database functionality
4. **All original functionality** remains intact

## Benefits

1. **Comprehensive Tracing**: Detailed trace logging for debugging complex issues
2. **Configurable Verbosity**: Control log output based on environment needs
3. **Structured Logging**: Consistent, parseable log format for monitoring tools
4. **Performance Monitoring**: Track API response times and database query performance
5. **Error Tracking**: Detailed error context with stack traces
6. **Audit Trail**: Complete operation history for compliance and debugging
7. **Development Friendly**: Color-coded console output with readable formatting
8. **Production Ready**: File-based logging with rotation capabilities

## Installation

The logging system requires the Winston library:

```bash
npm install winston@^3.8.2
```

This has been added to the package.json dependencies.

## Testing the Implementation

1. Start the server:
   ```bash
   LOG_LEVEL=debug node server.js
   ```

2. Make API calls to see trace logging:
   ```bash
   # Create a customer
   curl -X POST http://localhost:3000/customers \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","active":true}'
   
   # Get all customers
   curl http://localhost:3000/customers
   ```

3. Check log files:
   ```bash
   tail -f logs/combined.log
   tail -f logs/error.log
   ```

The logging system provides comprehensive visibility into application operations while maintaining full backward compatibility with the existing codebase.
# Payment Logging System

This document describes the comprehensive logging system added to the payment functionality, including trace-level debugging and log level configuration.

## Features

### ✅ Comprehensive Payment Logging
- **Trace-level logging** for detailed debugging
- **Request tracking** with unique request IDs
- **Database operation logging** with query details
- **Error logging** with stack traces
- **Performance monitoring** with timestamps

### ✅ Configurable Log Levels
- **ERROR** (0): Only critical errors
- **WARN** (1): Warnings and errors
- **INFO** (2): General information, warnings, and errors (default)
- **DEBUG** (3): Debug information and above
- **TRACE** (4): Detailed trace information and above

### ✅ Backward Compatibility
- Existing `console.log()` statements continue to work
- No breaking changes to existing API
- Logger provides `.log()` method for compatibility

## Configuration

### Environment Variables

Set the `LOG_LEVEL` environment variable to control logging verbosity:

```bash
# Production (minimal logging)
export LOG_LEVEL=ERROR

# Development (standard logging)
export LOG_LEVEL=INFO

# Debugging (detailed logging)
export LOG_LEVEL=DEBUG

# Trace debugging (maximum verbosity)
export LOG_LEVEL=TRACE
```

### Examples

```bash
# Start server with trace logging
LOG_LEVEL=TRACE node server.js

# Start server with error logging only
LOG_LEVEL=ERROR node server.js

# Default (INFO level)
node server.js
```

## Payment API Endpoints

### 1. Create Payment
```http
POST /payments
Content-Type: application/json

{
  "customer_id": 1,
  "amount": 99.99,
  "currency": "USD",
  "payment_method": "credit_card",
  "description": "Monthly subscription",
  "metadata": {
    "subscription_id": "sub_123",
    "plan": "premium"
  }
}
```

### 2. List Payments
```http
GET /payments?customer_id=1&status=pending&limit=10&offset=0
```

### 3. Get Payment by ID
```http
GET /payments/1
```

### 4. Update Payment Status
```http
PUT /payments/1/status
Content-Type: application/json

{
  "status": "completed"
}
```

### 5. Process Payment
```http
POST /payments/1/process
```

### 6. Get Payment Statistics
```http
GET /payments/stats
```

## Logging Examples

### TRACE Level (LOG_LEVEL=TRACE)
```
[2025-09-16T10:30:00.123Z] [TRACE] Payment creation request received | Meta: {"request_id":"abc123","body":{"customer_id":1,"amount":99.99},"ip":"127.0.0.1"}
[2025-09-16T10:30:00.124Z] [DEBUG] Creating payment with validated data | Meta: {"request_id":"abc123","customer_id":1,"amount":99.99}
[2025-09-16T10:30:00.125Z] [TRACE] Payment.create called | Meta: {"payment":{"customer_id":1,"amount":99.99},"timestamp":"2025-09-16T10:30:00.125Z"}
[2025-09-16T10:30:00.130Z] [DEBUG] Executing payment creation query | Meta: {"query":"INSERT INTO payments SET ?","payment_data":{"customer_id":1}}
[2025-09-16T10:30:00.145Z] [INFO] Payment created successfully | Meta: {"payment_id":1,"customer_id":1,"amount":99.99}
[2025-09-16T10:30:00.146Z] [TRACE] Payment creation completed | Meta: {"created_payment":{"id":1},"affected_rows":1}
```

### INFO Level (LOG_LEVEL=INFO) - Default
```
[2025-09-16T10:30:00.145Z] [INFO] Payment created successfully | Meta: {"payment_id":1,"customer_id":1,"amount":99.99}
[2025-09-16T10:30:00.200Z] [INFO] Payment processing completed | Meta: {"payment_id":1,"final_status":"completed"}
```

### ERROR Level (LOG_LEVEL=ERROR) - Production
```
[2025-09-16T10:30:00.150Z] [ERROR] Payment creation failed | Meta: {"error":"Connection refused","code":"ECONNREFUSED","stack":"..."}
```

## Database Setup

Run the SQL script to create the payments table:

```sql
-- Run database/payments_table.sql
mysql -u username -p database_name < database/payments_table.sql
```

## Code Integration

### Using the Logger in New Code

```javascript
const { logger } = require("../config/logger.config.js");

// Different log levels
logger.error("Critical error occurred", { user_id: 123, error: err });
logger.warn("Warning message", { context: "payment_processing" });
logger.info("Payment processed", { payment_id: 456 });
logger.debug("Debug information", { query: "SELECT * FROM payments" });
logger.trace("Detailed trace", { step: "validation", data: requestData });
```

### Backward Compatibility

Existing code continues to work without changes:

```javascript
// This still works exactly as before
console.log("Server is running on port", PORT);

// Or use the compatibility method
logger.log("This behaves like console.log but respects log levels");
```

## Benefits

1. **Detailed Debugging**: Trace-level logging provides comprehensive insights into payment processing
2. **Production Ready**: Configurable log levels allow minimal logging in production
3. **Request Tracking**: Unique request IDs help track requests across multiple log entries
4. **Structured Logging**: JSON metadata makes logs machine-readable
5. **Performance Monitoring**: Timestamps help identify bottlenecks
6. **Error Analysis**: Stack traces and error codes aid in troubleshooting

## Migration Notes

- **No breaking changes**: All existing functionality continues to work
- **Optional adoption**: New logging can be adopted gradually
- **Environment-based**: Log levels can be configured per environment
- **Performance**: Logs are only formatted when they will be output (respects log levels)

## Log Level Recommendations

- **Production**: `ERROR` or `WARN`
- **Staging**: `INFO`
- **Development**: `DEBUG` 
- **Troubleshooting**: `TRACE`
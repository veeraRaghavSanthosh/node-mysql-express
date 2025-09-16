# Security Implementation Guide

This document describes the security enhancements added to the Node.js Express MySQL application to prevent abuse while maintaining backward compatibility.

## Overview

The security implementation includes:
- **Input Sanitization**: Validates and sanitizes all user inputs
- **Rate Limiting**: Prevents API abuse with configurable limits
- **Speed Limiting**: Slows down excessive requests
- **Security Headers**: Adds protective HTTP headers
- **Enhanced Error Handling**: Prevents information leakage
- **Backward Compatibility**: Existing clients continue to work

## Files Added

### Core Security Files
- `app/middleware/security.js` - Main security middleware
- `app/routes/customer.routes.secure.js` - Enhanced routes with validation
- `app/controllers/customer.controller.secure.js` - Enhanced controller with better error handling

### Dependencies Added to package.json
```json
{
  "express-rate-limit": "^6.7.0",
  "express-validator": "^6.15.0", 
  "helmet": "^6.1.5",
  "express-slow-down": "^1.6.0"
}
```

## Security Features

### 1. Rate Limiting
Different limits for different operations:
- **Create operations**: 20 requests per 15 minutes
- **Update operations**: 30 requests per 15 minutes  
- **Delete operations**: 10 requests per 15 minutes
- **Read operations**: 100 requests per 15 minutes
- **General API**: 200 requests per 15 minutes

### 2. Input Validation
- Email validation and normalization
- Name validation (1-255 chars, alphanumeric + safe chars)
- Boolean validation for active field
- Parameter validation for customer IDs
- XSS prevention through input sanitization

### 3. Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Cache control for sensitive operations

### 4. Enhanced Error Handling
- Standardized error responses
- No internal error details in production
- Proper HTTP status codes
- Logging for monitoring

## Implementation Steps

### Step 1: Install Dependencies
```bash
npm install express-rate-limit express-validator helmet express-slow-down
```

### Step 2: Update server.js
Add security middleware to your server.js:

```javascript
const { securityHeaders, sanitizeInput, speedLimiters, rateLimiters } = require("./app/middleware/security");

// Apply security middleware
app.use(securityHeaders);
app.use(rateLimiters.general);
app.use(speedLimiters.api);

// After body parsing
app.use(sanitizeInput);
```

### Step 3: Update Routes
Replace the customer routes import in server.js:
```javascript
// Old
require("./app/routes/customer.routes.js")(app);

// New
require("./app/routes/customer.routes.secure.js")(app);
```

### Step 4: Update Controller (Optional)
For enhanced error handling, update the controller import in routes:
```javascript
const customers = require("../controllers/customer.controller.secure.js");
```

## Backward Compatibility

### Approach 1: Gradual Migration
The implementation maintains backward compatibility by:
- Not breaking existing API contracts
- Adding validation as middleware (can be made optional)
- Using sensible rate limits that shouldn't affect normal usage
- Preserving all existing endpoints and responses

### Approach 2: Conditional Security
Clients can opt into enhanced security by sending:
- Header: `X-Use-Security: true`
- Query parameter: `?security=true`
- Environment variable: `FORCE_SECURITY=true`

## Configuration

### Rate Limiting Configuration
Modify `app/middleware/security.js` to adjust limits:

```javascript
const rateLimiters = {
  create: createRateLimiter(15 * 60 * 1000, 20, 'Too many create requests'),
  // Adjust windowMs (time window) and max (request limit)
};
```

### Validation Rules
Customize validation in `customerValidationRules`:

```javascript
body('name')
  .isLength({ min: 1, max: 255 })
  .matches(/^[a-zA-Z0-9\s\-_.]+$/)
  // Adjust regex pattern and length limits
```

## Testing

### Test Rate Limiting
```bash
# Test create endpoint
for i in {1..25}; do curl -X POST http://localhost:3000/customers -H "Content-Type: application/json" -d '{"name":"test"}'; done
```

### Test Validation
```bash
# Test invalid email
curl -X POST http://localhost:3000/customers -H "Content-Type: application/json" -d '{"email":"invalid-email","name":"test"}'

# Test invalid customer ID
curl http://localhost:3000/customers/invalid-id
```

### Test Security Headers
```bash
curl -I http://localhost:3000/customers
```

## Monitoring

### Rate Limit Monitoring
Rate limit information is included in responses:
```json
{
  "error": "Too many requests",
  "retryAfter": 900
}
```

### Validation Error Monitoring
Validation errors are structured:
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be valid",
      "value": "invalid-email"
    }
  ]
}
```

## Production Considerations

1. **Environment Variables**:
   - Set `NODE_ENV=production` to hide error details
   - Set `FORCE_SECURITY=true` to enforce security for all clients

2. **Database Security**:
   - Use parameterized queries (already implemented in the model)
   - Regular security updates for MySQL

3. **Logging**:
   - Implement structured logging
   - Monitor rate limit violations
   - Track validation failures

4. **Performance**:
   - Rate limiting uses memory by default
   - Consider Redis for distributed rate limiting
   - Monitor response times

## Troubleshooting

### Common Issues

1. **Too Many Requests Error**:
   - Check if rate limits are too restrictive
   - Verify client behavior
   - Consider IP whitelisting for trusted clients

2. **Validation Failures**:
   - Check input format matches validation rules
   - Verify Content-Type headers
   - Review validation error messages

3. **Backward Compatibility Issues**:
   - Ensure existing clients don't send invalid data
   - Consider making validation warnings instead of errors
   - Test with actual client applications

## Security Best Practices

1. **Regular Updates**: Keep security dependencies updated
2. **Monitoring**: Implement logging and monitoring
3. **Testing**: Regular security testing and penetration testing
4. **Documentation**: Keep security documentation updated
5. **Training**: Ensure team understands security implications

## Future Enhancements

1. **Authentication**: Add JWT or session-based authentication
2. **Authorization**: Implement role-based access control
3. **Audit Logging**: Track all data modifications
4. **Data Encryption**: Encrypt sensitive data at rest
5. **API Versioning**: Version APIs for better compatibility management
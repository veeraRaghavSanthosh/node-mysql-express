# Security Implementation

This document outlines the security enhancements implemented in the Node.js MySQL Express service to prevent abuse while maintaining backward compatibility.

## Security Features Implemented

### 1. Rate Limiting

Three levels of rate limiting have been implemented:

- **General Rate Limit**: 100 requests per 15 minutes for all endpoints
- **Strict Rate Limit**: 20 requests per 15 minutes for write operations (POST, PUT)
- **Delete Rate Limit**: 5 requests per 15 minutes for delete operations

### 2. Input Validation and Sanitization

Using `express-validator` for comprehensive input validation:

- **Email validation**: Must be valid email format, normalized, max 255 characters
- **Name validation**: Required for creation, 1-255 characters, alphanumeric with spaces, hyphens, underscores, and dots only
- **Active field**: Must be boolean if provided
- **Customer ID validation**: Must be positive integer for route parameters

### 3. SQL Injection Prevention

- Fixed SQL injection vulnerability in `Customer.findById()` method
- All database queries now use parameterized queries with placeholders
- Input sanitization removes null/undefined values and trims strings

### 4. Security Headers

Using `helmet` middleware for security headers:

- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Content-Type-Options
- X-Frame-Options
- And other security headers

### 5. Error Handling Improvements

- Consistent JSON error responses
- Proper HTTP status codes
- Detailed validation error messages
- Database error handling with appropriate responses

## API Endpoints and Security

### POST /customers
- **Rate Limit**: 20 requests per 15 minutes
- **Validation**: Email and name required, all fields validated
- **Sanitization**: Input trimming and null value removal
- **Response**: 201 on success, 409 for duplicate email, 400 for validation errors

### GET /customers
- **Rate Limit**: General rate limit (100 requests per 15 minutes)
- **Validation**: None required
- **Response**: 200 with customer array

### GET /customers/:customerId
- **Rate Limit**: General rate limit
- **Validation**: Customer ID must be positive integer
- **Response**: 200 with customer data, 404 if not found

### PUT /customers/:customerId
- **Rate Limit**: 20 requests per 15 minutes
- **Validation**: Customer ID and optional fields (email, name, active)
- **Sanitization**: Input trimming and null value removal
- **Response**: 200 on success, 404 if not found, 409 for duplicate email

### DELETE /customers/:customerId
- **Rate Limit**: 5 requests per 15 minutes
- **Validation**: Customer ID must be positive integer
- **Response**: 200 on success, 404 if not found

### DELETE /customers
- **Rate Limit**: 5 requests per 15 minutes
- **Validation**: None
- **Response**: 200 with deletion count

## Backward Compatibility

All changes maintain backward compatibility:

1. **API Endpoints**: All existing endpoints remain unchanged
2. **Request/Response Format**: JSON format maintained, enhanced with better error messages
3. **HTTP Status Codes**: Improved but compatible status codes
4. **Field Requirements**: Only added validation, didn't change required fields for existing functionality

## Configuration

### Rate Limiting Configuration

Rate limits can be adjusted in `/app/middleware/security.js`:

```javascript
// General rate limit (100 requests per 15 minutes)
const generalRateLimit = createRateLimit();

// Strict rate limit for write operations (20 requests per 15 minutes)
const strictRateLimit = createRateLimit(15 * 60 * 1000, 20);

// Very strict rate limit for delete operations (5 requests per 15 minutes)
const deleteRateLimit = createRateLimit(15 * 60 * 1000, 5);
```

### Validation Rules

Validation rules can be modified in the same file:

- Email: Valid email format, max 255 characters
- Name: 1-255 characters, alphanumeric with specific special characters
- Active: Boolean values only

## Security Best Practices Implemented

1. **Input Validation**: All user inputs are validated before processing
2. **SQL Injection Prevention**: Parameterized queries used throughout
3. **Rate Limiting**: Multiple tiers to prevent different types of abuse
4. **Security Headers**: Comprehensive security headers via Helmet
5. **Error Handling**: Consistent, informative error responses
6. **Data Sanitization**: Input cleaning and normalization

## Dependencies Added

```json
{
  "express-rate-limit": "^6.7.0",
  "express-validator": "^6.14.3",
  "helmet": "^6.0.1"
}
```

## Testing the Security Features

### Rate Limiting Test
```bash
# Test rate limiting by making multiple requests quickly
for i in {1..25}; do curl -X POST http://localhost:3000/customers -H "Content-Type: application/json" -d '{"email":"test'$i'@example.com","name":"Test User"}'; done
```

### Input Validation Test
```bash
# Test invalid email
curl -X POST http://localhost:3000/customers -H "Content-Type: application/json" -d '{"email":"invalid-email","name":"Test User"}'

# Test invalid customer ID
curl http://localhost:3000/customers/invalid-id
```

### SQL Injection Prevention Test
```bash
# This should now be safely handled
curl http://localhost:3000/customers/1%27%20OR%20%271%27%3D%271
```

All security enhancements have been implemented with minimal impact on existing functionality while significantly improving the service's security posture.
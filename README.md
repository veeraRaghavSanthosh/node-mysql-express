# Node.js Express MySQL REST API with Security

A secure REST API built with Node.js, Express, and MySQL for customer management with comprehensive input sanitization and rate limiting.

## Features

- **CRUD Operations**: Complete customer management (Create, Read, Update, Delete)
- **Input Sanitization**: Protection against XSS attacks and code injection
- **Rate Limiting**: Configurable rate limits to prevent abuse and DoS attacks
- **Input Validation**: Comprehensive validation for all API endpoints
- **Security Headers**: Standard security headers for web protection
- **Unit Tests**: Comprehensive test suite for security features

## Security Features

### Input Sanitization
- Removes malicious script tags and JavaScript protocols
- Escapes HTML entities to prevent code injection
- Sanitizes all request data (body, query parameters, URL parameters)

### Rate Limiting
- **General**: 100 requests per 15 minutes per IP
- **Write Operations**: 20 requests per 15 minutes per IP (POST, PUT)
- **Delete Operations**: 5 requests per 15 minutes per IP (DELETE)

### Input Validation
- Email format validation with normalization
- Name length validation (1-100 characters)
- Customer ID validation (positive integers)
- Type validation for all fields

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` with HSTS
- `Referrer-Policy: strict-origin-when-cross-origin`

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure your MySQL database in `app/config/db.config.js`

4. Start the server:
```bash
npm start
```

## API Endpoints

All endpoints include security middleware for sanitization, validation, and rate limiting.

### Customers

| Method | Endpoint | Description | Security Features |
|--------|----------|-------------|-------------------|
| GET | `/customers` | Get all customers | General rate limiting |
| GET | `/customers/:id` | Get customer by ID | ID validation |
| POST | `/customers` | Create new customer | Write rate limiting, input validation |
| PUT | `/customers/:id` | Update customer | Write rate limiting, validation |
| DELETE | `/customers/:id` | Delete customer | Delete rate limiting, ID validation |
| DELETE | `/customers` | Delete all customers | Strict delete rate limiting |

### Request/Response Examples

#### Create Customer
```bash
POST /customers
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "active": true
}
```

#### Response (Success)
```json
{
  "id": 1,
  "name": "John Doe", 
  "email": "john@example.com",
  "active": true
}
```

#### Response (Validation Error)
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Valid email address is required",
      "value": "invalid-email"
    }
  ]
}
```

#### Response (Rate Limit Exceeded)
```json
{
  "error": "Too many requests from this IP",
  "retryAfter": 900
}
```

## Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## Security Middleware Usage

The security middleware can be used independently:

```javascript
const security = require('./app/middleware/security');

// Apply to all routes
app.use(security.securityHeaders);
app.use(security.sanitizeRequest);
app.use(security.generalRateLimit);

// Apply to specific routes
app.post('/api/data', 
  security.writeRateLimit,
  security.validateInput,
  controller.create
);
```

## Configuration

### Rate Limiting
Modify rate limits in `app/middleware/security.js`:
```javascript
const generalRateLimit = createRateLimit(15 * 60 * 1000, 100, 'Too many requests');
const writeRateLimit = createRateLimit(15 * 60 * 1000, 20, 'Too many write requests');
const deleteRateLimit = createRateLimit(15 * 60 * 1000, 5, 'Too many delete requests');
```

### Validation Rules
Customize validation in the security middleware:
```javascript
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
```

## Production Considerations

1. **Database**: Configure proper MySQL connection pooling
2. **Rate Limiting**: Consider Redis for distributed rate limiting
3. **Logging**: Add comprehensive logging with Morgan
4. **HTTPS**: Always use HTTPS in production
5. **Environment Variables**: Use environment variables for sensitive configuration
6. **Input Validation**: Consider more robust validation libraries for complex scenarios

## Dependencies

### Runtime
- `express`: Web framework
- `body-parser`: Request body parsing
- `mysql`: MySQL database driver
- `express-rate-limit`: Rate limiting middleware
- `express-validator`: Input validation
- `helmet`: Security headers
- `morgan`: Request logging

### Development
- `jest`: Testing framework
- `supertest`: HTTP testing

## License

ISC License
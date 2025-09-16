# Authentication Tests

This directory contains comprehensive unit tests for the authentication system in the Node.js Express MySQL application.

## Test Structure

### Files
- `auth.test.js` - Core authentication middleware tests with success, failure, and boundary cases
- `auth-middleware.test.js` - Tests for the original middleware implementation
- `auth-security.test.js` - Security-focused authentication tests
- `setup.js` - Jest configuration and test utilities

## Test Coverage

### Success Cases
- Valid token authentication
- Public route access without authentication
- User context setting on successful authentication
- Different HTTP methods (GET, POST, etc.)

### Failure Cases
- Missing authorization header
- Invalid authorization header format
- Empty or malformed tokens
- Expired tokens
- Invalid tokens

### Boundary Cases
- Empty authorization headers
- Very long tokens
- Tokens with special characters
- Case sensitivity in Bearer keyword
- Multiple spaces in authorization headers
- Numeric tokens
- Multiple authorization headers

### Security Tests
- Role-based access control
- Admin vs user permissions
- SQL injection attempts in tokens
- XSS attempts in tokens
- Rate limiting scenarios
- Token validation edge cases

## Running Tests

```bash
# Run all tests
npm test

# Run only authentication tests
npm run test:auth

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch

# Run tests with verbose output
npm run test:verbose
```

## Test Utilities

The `setup.js` file provides:
- Global test timeout configuration
- Console output suppression during tests
- Helper functions for creating test objects
- Custom Jest matchers for authentication testing

### Custom Matchers
- `toBeAuthenticated()` - Checks if request has authenticated user
- `toHaveValidToken()` - Validates authorization header format

## Implementation Notes

The tests are designed to work with both:
1. The current basic middleware implementation (pass-through)
2. Enhanced security middleware implementations

Tests use `supertest` for HTTP request testing and include comprehensive error handling and edge case coverage.

## Security Considerations

The security tests include checks for:
- Authorization bypass attempts
- Token injection attacks
- Role escalation prevention
- Information disclosure in error messages
- Rate limiting enforcement
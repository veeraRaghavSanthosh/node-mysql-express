# Authentication Unit Tests

This directory contains comprehensive unit tests for the authentication system of the Node.js Express MySQL application.

## Test Structure

```
tests/
├── unit/
│   ├── auth.test.js              # Auth controller login tests
│   ├── auth.register.test.js     # Auth controller register tests
│   └── auth.middleware.test.js   # Auth middleware tests (if created)
├── integration/
│   └── auth.integration.test.js  # Full auth flow integration tests
└── README.md                     # This file
```

## Test Coverage

### Unit Tests

#### Auth Controller Login (`auth.test.js`)
- **Success Cases:**
  - Valid user credentials login
  - Valid admin credentials login
  - Correct token generation
  - Proper user object response

- **Failure Cases:**
  - Empty request body
  - Missing email
  - Missing password
  - Invalid email format
  - Non-existent user
  - Incorrect password

- **Boundary Cases:**
  - Email with special characters
  - Very long email
  - Empty string email/password
  - Null/undefined values

#### Auth Controller Register (`auth.register.test.js`)
- **Success Cases:**
  - New user registration
  - Minimum valid password length
  - Complex email formats

- **Failure Cases:**
  - Empty request body
  - Missing required fields
  - Invalid email format
  - Password too short
  - User already exists

- **Boundary Cases:**
  - Empty string values
  - Very long inputs
  - Special characters in name
  - Null/undefined values

- **Security Tests:**
  - Password not returned in response
  - Default role assignment

#### Auth Middleware (`auth.middleware.test.js`)
- **Success Cases:**
  - Valid user token authentication
  - Valid admin token authentication
  - Proper user object creation

- **Failure Cases:**
  - Missing authorization header
  - Invalid token format
  - Empty Bearer token
  - Invalid token

- **Boundary Cases:**
  - Case-sensitive Bearer prefix
  - Extra spaces in token
  - Very long tokens
  - Special characters in tokens

### Integration Tests (`auth.integration.test.js`)

- **Full Auth Flow:**
  - Register → Login → Profile access
  - End-to-end authentication workflow

- **API Endpoint Tests:**
  - POST /auth/login
  - POST /auth/register
  - GET /auth/profile

- **Security Integration:**
  - Token-based authentication
  - Protected route access
  - Error handling across endpoints

## Running Tests

### Prerequisites
```bash
npm install
```

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

## Test Configuration

The tests use Jest as the testing framework with the following configuration:

- **Environment:** Node.js
- **Test Files:** `**/tests/**/*.test.js`
- **Coverage:** Includes all `app/**/*.js` files and `server.js`
- **Excluded:** Configuration files in `app/config/`

## Mock Data

The tests use mock user data:

```javascript
// Test Users
{
  id: 1,
  email: 'test@example.com',
  password: 'password123',
  role: 'user',
  name: 'Test User'
}

{
  id: 2,
  email: 'admin@example.com',
  password: 'admin123',
  role: 'admin',
  name: 'Admin User'
}

// Test Tokens
'valid-token'  // For regular users
'admin-token'  // For admin users
```

## Authentication Flow

1. **Registration:** POST /auth/register
   - Validates input data
   - Checks for existing users
   - Creates new user account

2. **Login:** POST /auth/login
   - Validates credentials
   - Returns JWT token (simplified)
   - Returns user information

3. **Protected Access:** GET /auth/profile
   - Requires Bearer token
   - Validates token
   - Returns user profile

## Error Handling

The authentication system handles various error scenarios:

- **400 Bad Request:** Invalid input data
- **401 Unauthorized:** Missing or invalid authentication
- **403 Forbidden:** Valid authentication but insufficient permissions
- **409 Conflict:** Resource already exists (duplicate email)
- **500 Internal Server Error:** Unexpected server errors

## Security Considerations

- Passwords are not returned in API responses
- Tokens are validated on each protected request
- Input validation prevents common attacks
- Proper HTTP status codes for different scenarios

## Backward Compatibility

The authentication system maintains backward compatibility:

- Existing customer routes remain unchanged
- Original middleware structure preserved
- New auth routes added without affecting existing functionality
- Database schema extensions (users table) don't impact customer operations

## Future Enhancements

- JWT token implementation
- Password hashing with bcrypt
- Rate limiting for auth endpoints
- Session management
- OAuth integration
- Multi-factor authentication
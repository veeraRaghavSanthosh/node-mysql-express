# Node.js Express MySQL API

Node.js Restful CRUD API with Node.js, Express and MySQL

## Bug Fix: TypeError with Null Input

### Problem
The original `src/api/user.js` was throwing TypeError when input was null, causing the application to crash when users sent invalid or null data.

### Solution
1. **Added comprehensive input validation** to handle null, undefined, and empty values
2. **Implemented proper error handling** with try-catch blocks
3. **Added validation middleware** to check request body before processing
4. **Created robust parameter validation** for route parameters

### Changes Made

#### 1. Created `src/api/user.js` with proper validation:
- **Null/Undefined checks**: All inputs are validated for null and undefined values
- **Type validation**: Ensures strings are actually strings and numbers are valid
- **Email validation**: Basic regex validation for email format
- **Duplicate prevention**: Checks for existing emails before creating users
- **Error handling**: Comprehensive try-catch blocks with proper HTTP status codes

#### 2. Key validation features:
- Request body validation middleware
- Parameter validation for user IDs
- Field-level validation for name and email
- Proper error responses with meaningful messages
- Graceful handling of edge cases

#### 3. Added comprehensive unit tests (`test/user.test.js`):
- **Null input scenarios**: Tests for null request bodies, null fields, undefined values
- **Edge cases**: Empty strings, whitespace-only strings, invalid formats
- **CRUD operations**: Full test coverage for all API endpoints
- **Error conditions**: Tests for 400, 404, 409, and 500 error responses
- **Success scenarios**: Valid operations and expected responses

## API Endpoints

### GET /api/users
Get all users
- **Response**: `{ users: [...] }`

### GET /api/users/:id
Get user by ID
- **Validation**: ID must be a valid number, not null/undefined
- **Response**: `{ user: {...} }` or error

### POST /api/users
Create new user
- **Required**: `name` (non-empty string), `email` (valid email format)
- **Validation**: Prevents null values, validates email format, checks for duplicates
- **Response**: `{ message: "...", user: {...} }` or error

### PUT /api/users/:id
Update user
- **Validation**: ID must be valid, fields must be proper types if provided
- **Response**: `{ message: "...", user: {...} }` or error

### DELETE /api/users/:id
Delete user
- **Validation**: ID must be a valid number
- **Response**: `{ message: "...", user: {...} }` or error

## Error Handling

All endpoints now properly handle:
- **400 Bad Request**: Invalid input, null values, validation failures
- **404 Not Found**: User doesn't exist
- **409 Conflict**: Duplicate email addresses
- **500 Internal Server Error**: Unexpected server errors

## Testing

### Install dependencies:
```bash
npm install
```

### Run tests:
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage
The test suite covers:
- ✅ All CRUD operations
- ✅ Null and undefined input handling
- ✅ Invalid data type scenarios
- ✅ Edge cases (empty strings, whitespace)
- ✅ Error response validation
- ✅ Success scenario validation

## Why These Changes Fix the Bug

1. **Prevents TypeError**: All null/undefined checks happen before any operations that could throw TypeError
2. **Graceful degradation**: Instead of crashing, the API returns proper error responses
3. **Comprehensive validation**: Catches issues at multiple levels (middleware, parameter, field)
4. **Proper error responses**: Users get meaningful error messages instead of server crashes
5. **Type safety**: Ensures all operations work with expected data types

The implementation follows REST API best practices and provides a robust, production-ready user management system that handles all edge cases gracefully.
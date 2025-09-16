# Authentication API Documentation

## Overview

This document provides comprehensive documentation for the authentication-related APIs in the Node.js Express MySQL application. The current implementation provides a foundation for authentication middleware and user management.

## Base URL

```
http://localhost:3000
```

## Authentication Middleware

### Current Implementation

The application includes a basic authentication middleware that is applied to all `api/*` routes:

```javascript
const authMiddleware = (req, res, next) => {
  next()
}
```

**Current Behavior**: The middleware currently passes through all requests without authentication checks, maintaining backward compatibility while providing a foundation for future authentication implementation.

**Applied To**: All routes matching `api/*` pattern

---

## Public APIs

### 1. Get Users

Retrieves a list of users through middleware chain demonstration.

**Endpoint**: `GET /user`

**Authentication**: None required (public endpoint)

**Request Headers**:
```http
Content-Type: application/json
```

**Request Parameters**: None

**Response Schema**:

**Success Response (200 OK)**:
```json
{
  "user": [
    {
      "id": 1,
      "name": "string"
    },
    {
      "id": 2,
      "name": "string"
    }
  ]
}
```

**Example Request**:
```bash
curl -X GET http://localhost:3000/user \
  -H "Content-Type: application/json"
```

**Example Response**:
```json
{
  "user": [
    {
      "id": 1,
      "name": "test3"
    },
    {
      "id": 2,
      "name": "test4"
    }
  ]
}
```

**Response Fields**:
- `user` (array): Array of user objects
  - `id` (number): Unique user identifier
  - `name` (string): User display name

---

## Customer Management APIs (Protected by Auth Middleware)

All customer management endpoints are protected by the authentication middleware when accessed via `api/*` routes.

### 2. Create Customer

Creates a new customer record.

**Endpoint**: `POST /customers`

**Authentication**: Protected by `authMiddleware` when accessed via `api/customers`

**Request Headers**:
```http
Content-Type: application/json
```

**Request Body Schema**:
```json
{
  "email": "string (required)",
  "name": "string (required)",
  "active": "boolean (optional, default: true)"
}
```

**Response Schema**:

**Success Response (200 OK)**:
```json
{
  "id": "number",
  "email": "string",
  "name": "string",
  "active": "boolean"
}
```

**Error Responses**:

**Bad Request (400)**:
```json
{
  "message": "Content can not be empty!"
}
```

**Internal Server Error (500)**:
```json
{
  "message": "Some error occurred while creating the Customer."
}
```

**Example Request**:
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe",
    "active": true
  }'
```

**Example Response**:
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "active": true
}
```

### 3. Get All Customers

Retrieves all customer records.

**Endpoint**: `GET /customers`

**Authentication**: Protected by `authMiddleware` when accessed via `api/customers`

**Request Parameters**: None

**Response Schema**:

**Success Response (200 OK)**:
```json
[
  {
    "id": "number",
    "email": "string",
    "name": "string",
    "active": "boolean"
  }
]
```

**Error Response (500)**:
```json
{
  "message": "Some error occurred while retrieving customers."
}
```

**Example Request**:
```bash
curl -X GET http://localhost:3000/customers \
  -H "Content-Type: application/json"
```

**Example Response**:
```json
[
  {
    "id": 1,
    "email": "john.doe@example.com",
    "name": "John Doe",
    "active": true
  },
  {
    "id": 2,
    "email": "jane.smith@example.com",
    "name": "Jane Smith",
    "active": false
  }
]
```

### 4. Get Customer by ID

Retrieves a specific customer by ID.

**Endpoint**: `GET /customers/:customerId`

**Authentication**: Protected by `authMiddleware` when accessed via `api/customers/:customerId`

**Path Parameters**:
- `customerId` (number, required): The unique identifier of the customer

**Response Schema**:

**Success Response (200 OK)**:
```json
{
  "id": "number",
  "email": "string",
  "name": "string",
  "active": "boolean"
}
```

**Error Responses**:

**Not Found (404)**:
```json
{
  "message": "Not found Customer with id {customerId}."
}
```

**Internal Server Error (500)**:
```json
{
  "message": "Error retrieving Customer with id {customerId}"
}
```

**Example Request**:
```bash
curl -X GET http://localhost:3000/customers/1 \
  -H "Content-Type: application/json"
```

**Example Response**:
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "active": true
}
```

### 5. Update Customer

Updates an existing customer record.

**Endpoint**: `PUT /customers/:customerId`

**Authentication**: Protected by `authMiddleware` when accessed via `api/customers/:customerId`

**Path Parameters**:
- `customerId` (number, required): The unique identifier of the customer

**Request Body Schema**:
```json
{
  "email": "string (optional)",
  "name": "string (optional)",
  "active": "boolean (optional)"
}
```

**Response Schema**:

**Success Response (200 OK)**:
```json
{
  "id": "number",
  "email": "string",
  "name": "string",
  "active": "boolean"
}
```

**Error Responses**:

**Bad Request (400)**:
```json
{
  "message": "Content can not be empty!"
}
```

**Not Found (404)**:
```json
{
  "message": "Not found Customer with id {customerId}."
}
```

**Internal Server Error (500)**:
```json
{
  "message": "Error updating Customer with id {customerId}"
}
```

**Example Request**:
```bash
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.updated@example.com",
    "name": "John Updated",
    "active": false
  }'
```

**Example Response**:
```json
{
  "id": 1,
  "email": "john.updated@example.com",
  "name": "John Updated",
  "active": false
}
```

### 6. Delete Customer

Deletes a specific customer by ID.

**Endpoint**: `DELETE /customers/:customerId`

**Authentication**: Protected by `authMiddleware` when accessed via `api/customers/:customerId`

**Path Parameters**:
- `customerId` (number, required): The unique identifier of the customer

**Response Schema**:

**Success Response (200 OK)**:
```json
{
  "message": "Customer was deleted successfully!"
}
```

**Error Responses**:

**Not Found (404)**:
```json
{
  "message": "Not found Customer with id {customerId}."
}
```

**Internal Server Error (500)**:
```json
{
  "message": "Could not delete Customer with id {customerId}"
}
```

**Example Request**:
```bash
curl -X DELETE http://localhost:3000/customers/1 \
  -H "Content-Type: application/json"
```

**Example Response**:
```json
{
  "message": "Customer was deleted successfully!"
}
```

### 7. Delete All Customers

Deletes all customer records.

**Endpoint**: `DELETE /customers`

**Authentication**: Protected by `authMiddleware` when accessed via `api/customers`

**Request Parameters**: None

**Response Schema**:

**Success Response (200 OK)**:
```json
{
  "message": "All Customers were deleted successfully!"
}
```

**Error Response (500)**:
```json
{
  "message": "Some error occurred while removing all customers."
}
```

**Example Request**:
```bash
curl -X DELETE http://localhost:3000/customers \
  -H "Content-Type: application/json"
```

**Example Response**:
```json
{
  "message": "All Customers were deleted successfully!"
}
```

---

## Authentication Middleware Details

### Current Implementation

The authentication middleware is implemented as a placeholder that maintains backward compatibility:

```javascript
const authMiddleware = (req, res, next) => {
  next()
}
```

### Middleware Application

The middleware is applied to routes matching the pattern `api/*`:

```javascript
app.use('api/*', authMiddleware);
```

This means:
- ✅ `GET /api/customers` - Protected
- ✅ `POST /api/customers` - Protected  
- ✅ `GET /api/customers/1` - Protected
- ❌ `GET /customers` - Not protected (direct route)
- ❌ `GET /user` - Not protected (doesn't match api/* pattern)

### Backward Compatibility

The current implementation ensures 100% backward compatibility by:

1. **No Breaking Changes**: All existing endpoints continue to work exactly as before
2. **Pass-through Authentication**: The middleware allows all requests to proceed
3. **Preserved Response Formats**: All response schemas remain unchanged
4. **Maintained Error Handling**: Existing error responses are preserved

### Future Authentication Enhancement

The middleware structure is ready for authentication implementation. Future enhancements can include:

1. **JWT Token Validation**
2. **API Key Authentication**  
3. **Role-based Access Control**
4. **Rate Limiting**
5. **Request Logging**

Example future implementation:

```javascript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }
  
  // Validate token logic here
  // If valid, call next()
  // If invalid, return 401
  
  next();
}
```

---

## Error Handling

All APIs follow consistent error response patterns:

### Standard Error Response Format

```json
{
  "message": "Error description"
}
```

### Common HTTP Status Codes

- `200 OK` - Success
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Testing Examples

### Complete API Testing Workflow

```bash
# 1. Get users (public endpoint)
curl -X GET http://localhost:3000/user

# 2. Create a customer
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User", "active": true}'

# 3. Get all customers
curl -X GET http://localhost:3000/customers

# 4. Get specific customer
curl -X GET http://localhost:3000/customers/1

# 5. Update customer
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{"email": "updated@example.com", "name": "Updated User", "active": false}'

# 6. Delete customer
curl -X DELETE http://localhost:3000/customers/1
```

---

## Summary

This API documentation covers all authentication-related functionality in the current Node.js Express MySQL application. The system provides:

- ✅ **Backward Compatibility**: All existing functionality preserved
- ✅ **Middleware Foundation**: Ready for authentication implementation
- ✅ **Comprehensive Documentation**: Complete API coverage with examples
- ✅ **Consistent Response Schemas**: Well-defined request/response formats
- ✅ **Error Handling**: Proper HTTP status codes and error messages

The authentication middleware is currently implemented as a pass-through function, allowing for future enhancement while maintaining complete backward compatibility with existing client implementations.
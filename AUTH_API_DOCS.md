# Authentication API Documentation

## Overview

This document provides comprehensive documentation for the authentication APIs in the Node.js Express MySQL application. The documentation covers both the current implementation and suggested enhancements while maintaining backward compatibility.

## Base URL
```
http://localhost:3000
```

## Current Authentication System

### Authentication Middleware

The application currently implements a basic authentication middleware that is applied to all `/api/*` routes.

**Location**: `server.js` lines 6-12
```javascript
const authMiddleware = (req, res, next) => {
    next()
}
app.use('api/*', authMiddleware);
```

**Current Behavior**: 
- The middleware currently passes through all requests without authentication
- Applied to all routes matching `/api/*` pattern
- No actual authentication logic implemented

---

## Public APIs

### 1. Get User Information

**Endpoint**: `GET /user`

**Description**: Retrieves hardcoded user information. This endpoint demonstrates middleware chaining and data injection.

**Authentication**: None (public endpoint)

**Request**:
```http
GET /user HTTP/1.1
Host: localhost:3000
Content-Type: application/json
```

**Response Schema**:
```json
{
  "user": [
    {
      "id": number,
      "name": string
    }
  ]
}
```

**Success Response** (200 OK):
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

**Example using cURL**:
```bash
curl -X GET http://localhost:3000/user \
  -H "Content-Type: application/json"
```

**Example using JavaScript (fetch)**:
```javascript
fetch('http://localhost:3000/user', {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

---

## Customer Management APIs (Protected by Auth Middleware)

All customer endpoints are protected by the authentication middleware when accessed via `/api/customers` pattern.

### 2. Create Customer

**Endpoint**: `POST /customers`

**Description**: Creates a new customer record in the database.

**Authentication**: Protected by authMiddleware when accessed via `/api/customers`

**Request Schema**:
```json
{
  "email": "string (required)",
  "name": "string (required)", 
  "active": "boolean (optional)"
}
```

**Request**:
```http
POST /customers HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "name": "John Doe",
  "active": true
}
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "active": true
}
```

**Error Responses**:

*400 Bad Request*:
```json
{
  "message": "Content can not be empty!"
}
```

*500 Internal Server Error*:
```json
{
  "message": "Some error occurred while creating the Customer."
}
```

**Example using cURL**:
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe",
    "active": true
  }'
```

### 3. Get All Customers

**Endpoint**: `GET /customers`

**Description**: Retrieves all customer records from the database.

**Authentication**: Protected by authMiddleware when accessed via `/api/customers`

**Request**:
```http
GET /customers HTTP/1.1
Host: localhost:3000
Content-Type: application/json
```

**Success Response** (200 OK):
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

**Error Response** (500 Internal Server Error):
```json
{
  "message": "Some error occurred while retrieving customers."
}
```

**Example using cURL**:
```bash
curl -X GET http://localhost:3000/customers \
  -H "Content-Type: application/json"
```

### 4. Get Customer by ID

**Endpoint**: `GET /customers/:customerId`

**Description**: Retrieves a specific customer by their ID.

**Authentication**: Protected by authMiddleware when accessed via `/api/customers/:customerId`

**Path Parameters**:
- `customerId` (integer): The unique identifier of the customer

**Request**:
```http
GET /customers/1 HTTP/1.1
Host: localhost:3000
Content-Type: application/json
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "active": true
}
```

**Error Responses**:

*404 Not Found*:
```json
{
  "message": "Not found Customer with id 1."
}
```

*500 Internal Server Error*:
```json
{
  "message": "Error retrieving Customer with id 1"
}
```

**Example using cURL**:
```bash
curl -X GET http://localhost:3000/customers/1 \
  -H "Content-Type: application/json"
```

### 5. Update Customer

**Endpoint**: `PUT /customers/:customerId`

**Description**: Updates an existing customer record.

**Authentication**: Protected by authMiddleware when accessed via `/api/customers/:customerId`

**Path Parameters**:
- `customerId` (integer): The unique identifier of the customer

**Request Schema**:
```json
{
  "email": "string (optional)",
  "name": "string (optional)",
  "active": "boolean (optional)"
}
```

**Request**:
```http
PUT /customers/1 HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
  "email": "john.updated@example.com",
  "name": "John Updated",
  "active": false
}
```

**Success Response** (200 OK):
```json
{
  "id": 1,
  "email": "john.updated@example.com",
  "name": "John Updated",
  "active": false
}
```

**Error Responses**:

*400 Bad Request*:
```json
{
  "message": "Content can not be empty!"
}
```

*404 Not Found*:
```json
{
  "message": "Not found Customer with id 1."
}
```

*500 Internal Server Error*:
```json
{
  "message": "Error updating Customer with id 1"
}
```

**Example using cURL**:
```bash
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.updated@example.com",
    "name": "John Updated",
    "active": false
  }'
```

### 6. Delete Customer

**Endpoint**: `DELETE /customers/:customerId`

**Description**: Deletes a specific customer by their ID.

**Authentication**: Protected by authMiddleware when accessed via `/api/customers/:customerId`

**Path Parameters**:
- `customerId` (integer): The unique identifier of the customer

**Request**:
```http
DELETE /customers/1 HTTP/1.1
Host: localhost:3000
Content-Type: application/json
```

**Success Response** (200 OK):
```json
{
  "message": "Customer was deleted successfully!"
}
```

**Error Responses**:

*404 Not Found*:
```json
{
  "message": "Not found Customer with id 1."
}
```

*500 Internal Server Error*:
```json
{
  "message": "Could not delete Customer with id 1"
}
```

**Example using cURL**:
```bash
curl -X DELETE http://localhost:3000/customers/1 \
  -H "Content-Type: application/json"
```

### 7. Delete All Customers

**Endpoint**: `DELETE /customers`

**Description**: Deletes all customer records from the database.

**Authentication**: Protected by authMiddleware when accessed via `/api/customers`

**Request**:
```http
DELETE /customers HTTP/1.1
Host: localhost:3000
Content-Type: application/json
```

**Success Response** (200 OK):
```json
{
  "message": "All Customers were deleted successfully!"
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "message": "Some error occurred while removing all customers."
}
```

**Example using cURL**:
```bash
curl -X DELETE http://localhost:3000/customers \
  -H "Content-Type: application/json"
```

---

## Authentication Implementation Recommendations

### Current State
The current authentication middleware is a placeholder that doesn't implement any actual authentication logic. All requests are currently allowed through.

### Recommended Enhancements (Backward Compatible)

#### 1. JWT-Based Authentication

**Suggested Implementation**:
```javascript
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const authMiddleware = (req, res, next) => {
    // Skip authentication for public endpoints
    const publicPaths = ['/user', '/health'];
    if (publicPaths.includes(req.path)) {
        return next();
    }

    const token = req.headers.authorization?.split(' ')[1]; // Bearer token
    
    if (!token) {
        return res.status(401).json({ message: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
```

#### 2. Suggested Auth Endpoints

**Login Endpoint** (to be implemented):
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

**Register Endpoint** (to be implemented):
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password",
  "name": "User Name"
}
```

#### 3. Token Usage

Once authentication is properly implemented, protected endpoints would require the Authorization header:

```http
GET /api/customers HTTP/1.1
Host: localhost:3000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

---

## Error Handling

### Standard Error Response Format

All API endpoints follow a consistent error response format:

```json
{
  "message": "Error description"
}
```

### HTTP Status Codes Used

- `200 OK`: Successful operation
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required or failed
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server-side error

---

## Backward Compatibility Notes

1. **Current Endpoints**: All existing endpoints (`/customers/*`, `/user`) will continue to work as before
2. **Authentication Middleware**: Currently passes all requests through - any future implementation should maintain this behavior for non-API routes
3. **Response Formats**: All response schemas are maintained as currently implemented
4. **Route Patterns**: The `/api/*` middleware pattern is preserved for future authentication implementation

---

## Dependencies

Current dependencies for authentication:
- `express`: ^4.17.1
- `body-parser`: ^1.19.0

Recommended additional dependencies for full authentication:
- `jsonwebtoken`: For JWT token handling
- `bcrypt`: For password hashing
- `express-rate-limit`: For rate limiting

---

## Security Considerations

1. **Current State**: No authentication is currently enforced
2. **HTTPS**: Recommended for production to protect token transmission
3. **Environment Variables**: Store JWT secrets and database credentials securely
4. **Rate Limiting**: Implement rate limiting for authentication endpoints
5. **Input Validation**: Add proper input validation and sanitization
6. **Password Hashing**: Use bcrypt for password storage (when auth is implemented)

---

## Testing Examples

### Complete Test Suite

```javascript
// Test user endpoint
const testUserEndpoint = async () => {
  const response = await fetch('http://localhost:3000/user');
  const data = await response.json();
  console.log('User data:', data);
};

// Test customer creation
const testCreateCustomer = async () => {
  const response = await fetch('http://localhost:3000/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@example.com',
      name: 'Test User',
      active: true
    })
  });
  const data = await response.json();
  console.log('Created customer:', data);
};

// Test get all customers
const testGetCustomers = async () => {
  const response = await fetch('http://localhost:3000/customers');
  const data = await response.json();
  console.log('All customers:', data);
};
```

---

*Last Updated: September 16, 2025*
*Version: 1.0.0*
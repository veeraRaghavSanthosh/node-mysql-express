# Authentication API Documentation

## Overview

This document provides comprehensive documentation for the authentication APIs in the Node.js Express MySQL application. The authentication system provides user registration, login, logout, and token-based authentication functionality.

## Base URL

```
http://localhost:3000/api/auth
```

## Authentication Flow

The application uses JWT (JSON Web Token) based authentication. Users must authenticate to access protected resources.

## API Endpoints

### 1. User Registration

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user account

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

**Success Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "created_at": "2025-09-16T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

**400 Bad Request - Missing Required Fields:**
```json
{
  "success": false,
  "message": "All fields are required",
  "errors": {
    "name": "Name is required",
    "email": "Email is required",
    "password": "Password is required"
  }
}
```

**400 Bad Request - Invalid Email:**
```json
{
  "success": false,
  "message": "Invalid email format",
  "errors": {
    "email": "Please provide a valid email address"
  }
}
```

**409 Conflict - User Already Exists:**
```json
{
  "success": false,
  "message": "User already exists",
  "errors": {
    "email": "User with this email already exists"
  }
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

---

### 2. User Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and receive access token

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securePassword123"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "last_login": "2025-09-16T10:45:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": "24h"
  }
}
```

**Error Responses:**

**400 Bad Request - Missing Credentials:**
```json
{
  "success": false,
  "message": "Email and password are required",
  "errors": {
    "email": "Email is required",
    "password": "Password is required"
  }
}
```

**401 Unauthorized - Invalid Credentials:**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "errors": {
    "auth": "Please check your credentials and try again"
  }
}
```

**404 Not Found - User Not Found:**
```json
{
  "success": false,
  "message": "User not found",
  "errors": {
    "email": "No user found with this email address"
  }
}
```

---

### 3. User Profile

**Endpoint:** `GET /api/auth/profile`

**Description:** Get current user profile information

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Example:**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@example.com",
      "created_at": "2025-09-16T10:30:00.000Z",
      "updated_at": "2025-09-16T10:30:00.000Z",
      "last_login": "2025-09-16T10:45:00.000Z"
    }
  }
}
```

**Error Responses:**

**401 Unauthorized - Missing Token:**
```json
{
  "success": false,
  "message": "Access denied. No token provided",
  "errors": {
    "auth": "Authorization header is required"
  }
}
```

**401 Unauthorized - Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid token",
  "errors": {
    "auth": "Token is invalid or expired"
  }
}
```

---

### 4. Update Profile

**Endpoint:** `PUT /api/auth/profile`

**Description:** Update current user profile information

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "string",
  "email": "string"
}
```

**Request Example:**
```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@example.com"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Smith",
      "email": "john.smith@example.com",
      "created_at": "2025-09-16T10:30:00.000Z",
      "updated_at": "2025-09-16T11:00:00.000Z"
    }
  }
}
```

**Error Responses:**

**400 Bad Request - Invalid Data:**
```json
{
  "success": false,
  "message": "Invalid input data",
  "errors": {
    "email": "Invalid email format"
  }
}
```

**409 Conflict - Email Already Exists:**
```json
{
  "success": false,
  "message": "Email already in use",
  "errors": {
    "email": "Another user is already using this email address"
  }
}
```

---

### 5. Change Password

**Endpoint:** `PUT /api/auth/change-password`

**Description:** Change user password

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Request Example:**
```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "securePassword123",
    "newPassword": "newSecurePassword456",
    "confirmPassword": "newSecurePassword456"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password changed successfully",
  "data": {
    "message": "Your password has been updated successfully"
  }
}
```

**Error Responses:**

**400 Bad Request - Password Mismatch:**
```json
{
  "success": false,
  "message": "Password confirmation does not match",
  "errors": {
    "confirmPassword": "New password and confirmation password must match"
  }
}
```

**401 Unauthorized - Wrong Current Password:**
```json
{
  "success": false,
  "message": "Current password is incorrect",
  "errors": {
    "currentPassword": "Please provide the correct current password"
  }
}
```

---

### 6. Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Logout user and invalidate token

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json"
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful",
  "data": {
    "message": "You have been successfully logged out"
  }
}
```

---

### 7. Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Request password reset email

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "string"
}
```

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset email sent",
  "data": {
    "message": "If an account with this email exists, you will receive password reset instructions"
  }
}
```

**Error Responses:**

**400 Bad Request - Missing Email:**
```json
{
  "success": false,
  "message": "Email is required",
  "errors": {
    "email": "Please provide a valid email address"
  }
}
```

---

### 8. Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Reset password using reset token

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "token": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Request Example:**
```bash
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "abc123def456...",
    "newPassword": "newSecurePassword789",
    "confirmPassword": "newSecurePassword789"
  }'
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Password reset successful",
  "data": {
    "message": "Your password has been reset successfully. You can now login with your new password."
  }
}
```

**Error Responses:**

**400 Bad Request - Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid or expired reset token",
  "errors": {
    "token": "The password reset token is invalid or has expired"
  }
}
```

**400 Bad Request - Password Mismatch:**
```json
{
  "success": false,
  "message": "Password confirmation does not match",
  "errors": {
    "confirmPassword": "New password and confirmation password must match"
  }
}
```

---

## Authentication Middleware

### Protected Routes

All routes that require authentication should include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Token Format

The JWT token contains the following payload:
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "iat": 1694857200,
  "exp": 1694943600
}
```

## Error Response Format

All API endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Field-specific error message"
  }
}
```

## Success Response Format

All API endpoints follow a consistent success response format:

```json
{
  "success": true,
  "message": "Success description",
  "data": {
    // Response data
  }
}
```

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or invalid
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error

## Rate Limiting

Authentication endpoints are rate-limited to prevent abuse:
- Login: 5 attempts per minute per IP
- Register: 3 attempts per minute per IP
- Password reset: 2 attempts per minute per IP

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **JWT Tokens**: Stateless authentication with configurable expiration
3. **Input Validation**: All inputs are validated and sanitized
4. **Rate Limiting**: Protection against brute force attacks
5. **CORS**: Cross-origin resource sharing configuration
6. **Helmet**: Security headers middleware

## Testing the APIs

### Using curl

All examples above show how to test each endpoint using curl commands.

### Using Postman

1. Import the API endpoints into Postman
2. Set up environment variables for base URL and token
3. Use the provided request/response examples

### Environment Variables

The following environment variables should be configured:

```env
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expires DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  last_login TIMESTAMP NULL
);
```

This documentation provides a complete reference for all authentication-related APIs in the Node.js Express MySQL application.
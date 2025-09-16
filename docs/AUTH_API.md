# Authentication API Documentation

This document provides comprehensive documentation for the authentication APIs in the Node.js Express MySQL application.

## Table of Contents

- [Overview](#overview)
- [Authentication Flow](#authentication-flow)
- [Base URL](#base-url)
- [Authentication Headers](#authentication-headers)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [API Endpoints](#api-endpoints)
  - [Register User](#register-user)
  - [Login User](#login-user)
  - [Get Profile](#get-profile)
  - [Update Profile](#update-profile)
  - [Change Password](#change-password)
  - [Refresh Token](#refresh-token)
  - [Logout](#logout)
  - [Get All Users (Admin)](#get-all-users-admin)
- [Rate Limiting](#rate-limiting)
- [Database Schema](#database-schema)

## Overview

The authentication system uses JWT (JSON Web Tokens) for stateless authentication. Users can register, login, and access protected resources using bearer tokens.

### Key Features

- JWT-based authentication
- Role-based access control (user, admin)
- Password hashing with bcrypt
- Rate limiting for auth endpoints
- Input validation and sanitization
- Comprehensive error handling

## Authentication Flow

1. **Registration/Login**: User provides credentials and receives a JWT token
2. **Token Usage**: Client includes token in `Authorization` header for protected routes
3. **Token Validation**: Server validates token and extracts user information
4. **Access Control**: Server checks user permissions for role-based endpoints

## Base URL

```
http://localhost:3000/api/auth
```

## Authentication Headers

For protected endpoints, include the JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description"
}
```

## Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (resource already exists)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## API Endpoints

### Register User

Register a new user account.

**Endpoint:** `POST /api/auth/register`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "name": "John Doe",
  "password": "password123",
  "role": "user"
}
```

**Request Parameters:**

| Parameter | Type   | Required | Description                    |
|-----------|--------|----------|--------------------------------|
| email     | string | Yes      | Valid email address            |
| name      | string | Yes      | User's full name               |
| password  | string | Yes      | Password (min 6 characters)    |
| role      | string | No       | User role (default: "user")    |

**Success Response (201):**
```json
{
  "success": true,
  "message": "User registered successfully!",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "user",
      "active": true,
      "created_at": "2023-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

- `400` - Missing required fields
- `400` - Invalid email format
- `400` - Password too short
- `409` - Email already exists
- `500` - Server error

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "password": "password123"
  }'
```

---

### Login User

Authenticate user and receive access token.

**Endpoint:** `POST /api/auth/login`

**Access:** Public

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Request Parameters:**

| Parameter | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| email     | string | Yes      | User's email       |
| password  | string | Yes      | User's password    |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful!",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "user",
      "active": true,
      "created_at": "2023-01-01T00:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

- `400` - Missing email or password
- `401` - Invalid credentials
- `401` - Account deactivated
- `500` - Server error

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

---

### Get Profile

Retrieve current user's profile information.

**Endpoint:** `GET /api/auth/profile`

**Access:** Private (Authentication required)

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile retrieved successfully!",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "name": "John Doe",
      "role": "user",
      "active": true,
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- `401` - Token missing or invalid
- `403` - Token expired
- `404` - User not found
- `500` - Server error

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <your-token>"
```

---

### Update Profile

Update current user's profile information.

**Endpoint:** `PUT /api/auth/profile`

**Access:** Private (Authentication required)

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "name": "New Name"
}
```

**Request Parameters:**

| Parameter | Type   | Required | Description        |
|-----------|--------|----------|--------------------|
| email     | string | No       | New email address  |
| name      | string | No       | New name           |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully!",
  "data": {
    "user": {
      "id": 1,
      "email": "newemail@example.com",
      "name": "New Name",
      "role": "user",
      "active": true,
      "created_at": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Responses:**

- `400` - Invalid request body
- `401` - Authentication required
- `404` - User not found
- `500` - Server error

**Example cURL:**
```bash
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name"
  }'
```

---

### Change Password

Change current user's password.

**Endpoint:** `PUT /api/auth/change-password`

**Access:** Private (Authentication required)

**Headers:**
```http
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Request Parameters:**

| Parameter       | Type   | Required | Description                     |
|----------------|--------|----------|---------------------------------|
| currentPassword| string | Yes      | Current password                |
| newPassword    | string | Yes      | New password (min 6 characters) |

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password changed successfully!"
}
```

**Error Responses:**

- `400` - Missing required fields
- `400` - New password too short
- `401` - Current password incorrect
- `500` - Server error

**Example cURL:**
```bash
curl -X PUT http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "oldpassword123",
    "newPassword": "newpassword123"
  }'
```

---

### Refresh Token

Get a new JWT token using the current valid token.

**Endpoint:** `POST /api/auth/refresh-token`

**Access:** Private (Authentication required)

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Token refreshed successfully!",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Responses:**

- `401` - Token missing or invalid
- `403` - Token expired
- `500` - Server error

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Authorization: Bearer <your-token>"
```

---

### Logout

Logout current user (client-side token removal).

**Endpoint:** `POST /api/auth/logout`

**Access:** Private (Authentication required)

**Headers:**
```http
Authorization: Bearer <token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logout successful! Please remove the token from client storage."
}
```

**Note:** With JWT tokens, logout is primarily handled on the client side by removing the token from storage. For server-side logout with token blacklisting, additional implementation would be required.

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer <your-token>"
```

---

### Get All Users (Admin)

Retrieve all users (admin access only).

**Endpoint:** `GET /api/auth/users`

**Access:** Private (Admin role required)

**Headers:**
```http
Authorization: Bearer <admin-token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Users retrieved successfully!",
  "data": {
    "users": [
      {
        "id": 1,
        "email": "john@example.com",
        "name": "John Doe",
        "role": "user",
        "active": true,
        "created_at": "2023-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "email": "admin@example.com",
        "name": "Admin User",
        "role": "admin",
        "active": true,
        "created_at": "2023-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**

- `401` - Authentication required
- `403` - Admin role required
- `500` - Server error

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/auth/users \
  -H "Authorization: Bearer <admin-token>"
```

## Rate Limiting

Authentication endpoints are protected with rate limiting to prevent abuse:

- **Login/Register**: 5 attempts per 15 minutes per IP address
- **Other endpoints**: Standard rate limiting applies

When rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "message": "Too many attempts. Please try again after X minutes."
}
```

## Database Schema

The authentication system requires a `users` table with the following structure:

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Field Descriptions

| Field      | Type                    | Description                           |
|------------|-------------------------|---------------------------------------|
| id         | INT AUTO_INCREMENT      | Primary key                           |
| email      | VARCHAR(255) UNIQUE     | User's email address                  |
| name       | VARCHAR(255)            | User's full name                      |
| password   | VARCHAR(255)            | Bcrypt hashed password                |
| role       | ENUM('user', 'admin')   | User role for access control          |
| active     | BOOLEAN                 | Account status (active/inactive)      |
| created_at | TIMESTAMP               | Account creation timestamp            |
| updated_at | TIMESTAMP               | Last update timestamp                 |

## Security Considerations

1. **Password Security**: Passwords are hashed using bcrypt with salt rounds
2. **JWT Security**: Use strong secret keys and appropriate expiration times
3. **Input Validation**: All inputs are validated and sanitized
4. **Rate Limiting**: Prevents brute force attacks
5. **HTTPS**: Always use HTTPS in production
6. **Environment Variables**: Store secrets in environment variables
7. **Token Expiration**: Tokens have reasonable expiration times

## Environment Variables

Set these environment variables for production:

```bash
JWT_SECRET=your-very-strong-secret-key-here
JWT_EXPIRES_IN=24h
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
```

## Testing

Use the provided unit tests to verify the authentication functionality. Tests cover:

- User registration and validation
- Login functionality
- Token generation and validation
- Profile management
- Password changes
- Role-based access control
- Error handling scenarios
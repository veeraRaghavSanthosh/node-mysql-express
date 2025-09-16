# Authentication System Documentation

This repository contains comprehensive documentation for the authentication APIs in the Node.js Express MySQL application.

## 📁 Files Overview

### Documentation Files
- **`AUTH_API_DOCUMENTATION.md`** - Complete API documentation with detailed examples, request/response schemas, and error handling
- **`AUTH_README.md`** - This overview file

### Implementation Examples
- **`auth-implementation-example.js`** - Example controller implementation showing how to implement the documented APIs
- **`auth-routes-example.js`** - Example routes setup for the auth endpoints
- **`test-auth-apis.js`** - Test script to validate the API implementations

## 🚀 Quick Start

### 1. Review the API Documentation
Start by reading the complete API documentation:
```bash
cat AUTH_API_DOCUMENTATION.md
```

### 2. Implement the Controllers
Use the example implementation as a reference:
```bash
cp auth-implementation-example.js app/controllers/auth.controller.js
```

### 3. Set Up Routes
Add the auth routes to your application:
```bash
cp auth-routes-example.js app/routes/auth.routes.js
```

### 4. Test the Implementation
Run the test script to validate your implementation:
```bash
node test-auth-apis.js
```

## 📋 API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Register new user | ❌ |
| POST | `/api/auth/login` | User login | ❌ |
| GET | `/api/auth/profile` | Get user profile | ✅ |
| PUT | `/api/auth/profile` | Update user profile | ✅ |
| PUT | `/api/auth/change-password` | Change password | ✅ |
| POST | `/api/auth/logout` | User logout | ✅ |
| POST | `/api/auth/forgot-password` | Request password reset | ❌ |
| POST | `/api/auth/reset-password` | Reset password with token | ❌ |

## 🔧 Required Dependencies

Make sure to install these npm packages:

```bash
npm install bcrypt jsonwebtoken
```

## 🗄️ Database Setup

The auth system requires a users table. Here's the SQL schema:

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

## 🔐 Environment Variables

Set these environment variables:

```env
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRES_IN=24h
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name
```

## 🧪 Testing

### Manual Testing with curl

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (replace TOKEN with actual JWT token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"
```

### Automated Testing

Run the provided test script:
```bash
node test-auth-apis.js
```

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Field-specific error message"
  }
}
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Stateless token-based auth
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Protection against brute force attacks
- **CORS Configuration**: Cross-origin request handling
- **Security Headers**: Helmet.js integration

## 🚨 Error Handling

The API uses standard HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials/token)
- `404` - Not Found
- `409` - Conflict (duplicate email)
- `500` - Internal Server Error

## 📝 Next Steps

1. **Implement the Controllers**: Use the example implementation as a starting point
2. **Set Up Database Models**: Create the User model with required methods
3. **Add Middleware**: Implement authentication middleware
4. **Test Thoroughly**: Use the provided test script and add more tests
5. **Configure Environment**: Set up proper environment variables
6. **Add Rate Limiting**: Implement rate limiting for security
7. **Set Up Email**: Configure email service for password reset

## 🤝 Contributing

When making changes to the auth system:

1. Update the documentation in `AUTH_API_DOCUMENTATION.md`
2. Update examples in the implementation files
3. Run tests to ensure everything works
4. Update this README if needed

## 📞 Support

For questions or issues with the authentication system, please refer to:
- The detailed API documentation
- The implementation examples
- The test scripts

---

*This documentation follows industry best practices for REST API documentation and provides everything needed to implement a secure authentication system.*
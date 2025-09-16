# Node.js Express MySQL Authentication API

A comprehensive REST API built with Node.js, Express, and MySQL featuring JWT authentication, role-based access control, and complete CRUD operations.

## Features

### 🔐 Authentication & Security
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (user, admin)
- Rate limiting for auth endpoints
- Input validation and sanitization
- CORS support

### 🚀 API Endpoints
- User registration and login
- Profile management
- Password change functionality
- Token refresh mechanism
- Admin user management
- Customer CRUD operations (existing)

### 🧪 Testing & Quality
- Comprehensive unit tests
- Integration tests
- Test coverage reporting
- Mock database for testing
- Jest testing framework

### 📚 Documentation
- Complete API documentation
- Response schemas and examples
- Database schema documentation
- Security best practices

## Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/veeraRaghavSanthosh/node-mysql-express.git
   cd node-mysql-express
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   ```bash
   # Create your MySQL database
   mysql -u your_username -p
   CREATE DATABASE your_database_name;
   
   # Run the setup script
   mysql -u your_username -p your_database_name < database/setup.sql
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_username
   DB_PASSWORD=your_password
   DB_NAME=your_database_name
   
   # JWT Configuration
   JWT_SECRET=your-very-strong-secret-key-here
   JWT_EXPIRES_IN=24h
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   ```

5. **Update Database Configuration**
   
   Edit `app/config/db.config.js` with your database credentials:
   ```javascript
   module.exports = {
     HOST: process.env.DB_HOST || "localhost",
     USER: process.env.DB_USER || "your_username",
     PASSWORD: process.env.DB_PASSWORD || "your_password",
     DB: process.env.DB_NAME || "your_database_name"
   };
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

7. **Verify installation**
   ```bash
   curl http://localhost:3000/health
   ```

## API Documentation

### Base URL
```
http://localhost:3000
```

### Authentication Endpoints

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

#### Login User
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get Profile (Protected)
```bash
GET /api/auth/profile
Authorization: Bearer <your-jwt-token>
```

For complete API documentation, see [docs/AUTH_API.md](docs/AUTH_API.md).

## Testing

### Run Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure
- `tests/auth.test.js` - Authentication system tests
- Covers all endpoints and middleware
- Mock database for reliable testing
- Integration and unit tests

### Sample Test Users
The database setup script creates sample users for testing:

- **Admin User**
  - Email: `admin@example.com`
  - Password: `admin123`
  - Role: `admin`

- **Regular User**
  - Email: `user@example.com`
  - Password: `user123`
  - Role: `user`

## Database Schema

### Users Table
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

### Customers Table (Existing)
```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Project Structure

```
├── app/
│   ├── config/
│   │   └── db.config.js          # Database configuration
│   ├── controllers/
│   │   ├── auth.controller.js    # Authentication logic
│   │   └── customer.controller.js # Customer CRUD operations
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT and authorization middleware
│   ├── models/
│   │   ├── user.model.js         # User data model
│   │   ├── customer.model.js     # Customer data model
│   │   └── db.js                 # Database connection
│   └── routes/
│       ├── auth.routes.js        # Authentication routes
│       └── customer.routes.js    # Customer routes
├── database/
│   └── setup.sql                 # Database setup script
├── docs/
│   └── AUTH_API.md              # API documentation
├── tests/
│   └── auth.test.js             # Test suite
├── server.js                     # Application entry point
├── package.json                  # Dependencies and scripts
├── CHANGELOG.md                  # Version history
└── README.md                     # This file
```

## Security Best Practices

### Production Deployment
1. **Environment Variables**: Store all secrets in environment variables
2. **HTTPS**: Always use HTTPS in production
3. **JWT Secret**: Use a strong, random JWT secret key
4. **Database Security**: Use proper database user permissions
5. **Rate Limiting**: Configure appropriate rate limits
6. **CORS**: Set specific origins instead of wildcard
7. **Logging**: Implement proper logging and monitoring

### Password Security
- Passwords are hashed using bcrypt with salt rounds
- Minimum password length of 6 characters
- Password validation on both client and server
- Current password verification for changes

### Token Security
- JWT tokens with reasonable expiration times (24h default)
- Token refresh mechanism available
- Proper token validation and error handling
- Bearer token authentication

## Development

### Available Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

### Adding New Features
1. Create model in `app/models/`
2. Create controller in `app/controllers/`
3. Define routes in `app/routes/`
4. Add middleware if needed in `app/middleware/`
5. Write tests in `tests/`
6. Update documentation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Update documentation
7. Submit a pull request

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.

## License

This project is licensed under the ISC License.

## Support

For questions or issues:
1. Check the documentation in `docs/`
2. Review the test files for usage examples
3. Create an issue in the repository
4. Check the changelog for recent updates

---

## API Response Format

All API responses follow this consistent format:

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

## HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `429` - Too Many Requests
- `500` - Internal Server Error
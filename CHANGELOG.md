# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2023-01-01

### Added

#### Authentication System
- **JWT-based Authentication**: Complete authentication system using JSON Web Tokens
- **User Registration**: New users can register with email, name, and password
- **User Login**: Existing users can authenticate and receive JWT tokens
- **Password Security**: Passwords are hashed using bcrypt with salt rounds for security
- **Role-based Access Control**: Support for user roles (user, admin) with authorization middleware

#### API Endpoints
- `POST /api/auth/register` - Register a new user account
- `POST /api/auth/login` - Authenticate user and get JWT token
- `GET /api/auth/profile` - Get current user's profile information
- `PUT /api/auth/profile` - Update current user's profile
- `PUT /api/auth/change-password` - Change user password with current password verification
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/logout` - Logout user (client-side token removal)
- `GET /api/auth/users` - Get all users (admin only)

#### Security Features
- **Rate Limiting**: Auth endpoints protected with rate limiting (5 attempts per 15 minutes)
- **Input Validation**: Comprehensive validation for all auth endpoints
- **Error Handling**: Consistent error responses with proper HTTP status codes
- **CORS Support**: Cross-origin resource sharing headers for frontend integration

#### Database
- **Users Table**: New database table for user authentication with proper indexing
- **Database Setup Script**: SQL script to create necessary tables and sample data
- **Migration Support**: Database schema designed for future migrations

#### Middleware
- **Authentication Middleware**: JWT token verification and user authentication
- **Authorization Middleware**: Role-based access control for protected routes
- **Rate Limiting Middleware**: Configurable rate limiting for auth endpoints
- **Optional Auth Middleware**: Optional authentication for mixed public/private content

#### Documentation
- **Comprehensive API Documentation**: Complete documentation with examples and response schemas
- **Database Schema Documentation**: Detailed database structure and field descriptions
- **Security Guidelines**: Best practices for production deployment
- **Environment Variables**: Configuration guide for production settings

#### Testing
- **Unit Tests**: Comprehensive test suite covering all auth functionality
- **Integration Tests**: End-to-end testing of auth flows
- **Middleware Tests**: Testing of authentication and authorization middleware
- **Test Coverage**: Jest configuration with coverage reporting
- **Mock Database**: Database mocking for reliable test execution

#### Development Tools
- **Updated Dependencies**: Added bcrypt, jsonwebtoken, jest, supertest, nodemon
- **NPM Scripts**: New scripts for testing, development, and coverage
- **Jest Configuration**: Test environment setup with coverage reporting
- **Development Server**: Nodemon integration for development workflow

### Changed

#### Server Configuration
- **Updated server.js**: Enhanced with proper error handling and route organization
- **CORS Headers**: Added CORS support for frontend integration
- **Health Check**: New health check endpoint for monitoring
- **404 Handler**: Proper 404 error handling for unknown routes
- **Error Middleware**: Global error handling middleware

#### Package Configuration
- **Updated package.json**: Version bump to 1.1.0 with new dependencies
- **Enhanced Description**: Updated to reflect authentication capabilities
- **New Keywords**: Added JWT, authentication, and bcrypt keywords

### Security Considerations

#### Production Recommendations
- Use strong JWT secrets in environment variables
- Enable HTTPS in production
- Configure proper CORS origins
- Set appropriate JWT expiration times
- Use secure password policies
- Implement proper logging and monitoring
- Regular security updates for dependencies

#### Password Security
- Bcrypt hashing with salt rounds
- Minimum password length requirements
- Current password verification for changes
- Secure password storage practices

#### Token Security
- JWT tokens with reasonable expiration times
- Token refresh mechanism
- Proper token validation and error handling
- User session management

### Breaking Changes
- None. All existing functionality remains compatible.

### Dependencies Added
- `bcrypt: ^5.1.0` - Password hashing
- `jsonwebtoken: ^9.0.0` - JWT token generation and verification
- `jest: ^29.5.0` - Testing framework
- `supertest: ^6.3.3` - HTTP testing
- `nodemon: ^2.0.22` - Development server

### Database Changes
- Added `users` table with proper indexing
- Sample data for testing and development
- Maintained backward compatibility with existing `customers` table

### Files Added
- `app/controllers/auth.controller.js` - Authentication controller
- `app/middleware/auth.middleware.js` - Authentication middleware
- `app/models/user.model.js` - User data model
- `app/routes/auth.routes.js` - Authentication routes
- `docs/AUTH_API.md` - API documentation
- `tests/auth.test.js` - Comprehensive test suite
- `database/setup.sql` - Database setup script
- `CHANGELOG.md` - This changelog file

### Migration Guide
1. Install new dependencies: `npm install`
2. Run database setup script: `mysql -u username -p database_name < database/setup.sql`
3. Set environment variables for JWT secret and database configuration
4. Test the new endpoints using the provided documentation
5. Run tests: `npm test`

### API Usage Examples
See `docs/AUTH_API.md` for comprehensive examples and usage instructions.

---

## [1.0.0] - Previous Release

### Added
- Basic Express server with MySQL integration
- Customer CRUD operations
- Basic middleware structure
- MySQL database configuration
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- New authentication module (`lib/auth.js`) with comprehensive user authentication functionality
- Support for password hashing using bcrypt
- JWT token generation and verification
- User creation, authentication, and password management functions
- Comprehensive unit test suite with 98.76% code coverage
- New dependencies: `bcrypt`, `jsonwebtoken`, `jest`, `supertest`

### Changed
- **BREAKING**: Converted `lib/auth.js` from callback-based functions to async/await pattern
- Updated `package.json` with new dependencies and test scripts
- Added Jest configuration for testing

### Technical Details
- All authentication functions now return Promises instead of using callbacks
- Improved error handling with descriptive error messages
- Database queries are properly promisified using Node.js built-in `util.promisify`
- Functions converted to async/await:
  - `hashPassword()` - Hash passwords using bcrypt
  - `comparePassword()` - Compare passwords with stored hashes
  - `generateToken()` - Generate JWT tokens
  - `verifyToken()` - Verify JWT tokens
  - `createUser()` - Create new users in database
  - `authenticateUser()` - Authenticate users with email/password
  - `getUserById()` - Retrieve user information by ID
  - `updatePassword()` - Update user passwords

### Testing
- Added comprehensive unit tests covering all authentication functions
- 23 test cases with 100% function coverage
- Proper mocking of database connections and external dependencies
- Tests include both success and error scenarios
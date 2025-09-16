# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-09-16

### Added
- **Comprehensive Notification API Documentation** (`NOTIFICATION_API.md`)
  - Complete API reference with request/response schemas
  - Usage examples for JavaScript/Node.js and cURL
  - Error handling documentation
  - Database schema specifications
  - Authentication and rate limiting guidelines

- **Unit Test Suite for Notification APIs** (`test/notification.test.js`)
  - Complete test coverage for all CRUD operations
  - Edge case and boundary testing
  - Error scenario validation
  - Performance and concurrency testing
  - Test configuration and database setup utilities

- **Testing Infrastructure**
  - Updated `package.json` with test dependencies (Mocha, Chai, Supertest, NYC)
  - Test scripts for running tests, watch mode, and coverage reports
  - Mocha configuration file for consistent test execution
  - Test database configuration and cleanup utilities

### Changed
- Updated project structure to include comprehensive testing framework
- Enhanced package.json with development dependencies and test scripts

### Documentation
- Added detailed API documentation with examples and response schemas
- Included database schema documentation
- Added testing guidelines and setup instructions

### Testing
- Implemented comprehensive unit test suite covering:
  - All notification CRUD operations (Create, Read, Update, Delete)
  - Input validation and error handling
  - Edge cases and boundary conditions
  - Performance and concurrency scenarios
  - Database integration testing

## [1.0.0] - 2025-09-15

### Added
- Initial release of Node.js Express MySQL API
- Customer CRUD operations
- Basic Express server setup
- MySQL database integration
- RESTful API endpoints for customer management

### Features
- Customer creation, retrieval, update, and deletion
- MySQL database connectivity
- Express.js web framework integration
- Body parser middleware for JSON requests

---

## How to Use This Changelog

- **Added** for new features
- **Changed** for changes in existing functionality
- **Deprecated** for soon-to-be removed features
- **Removed** for now removed features
- **Fixed** for any bug fixes
- **Security** in case of vulnerabilities

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version when you make incompatible API changes
- **MINOR** version when you add functionality in a backwards compatible manner
- **PATCH** version when you make backwards compatible bug fixes

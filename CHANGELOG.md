# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-09-16

### Added
- **Usage Examples**: Added comprehensive TypeScript and JavaScript usage examples
  - `examples/typescript-usage.ts`: Full TypeScript client with type definitions and error handling
  - `examples/javascript-usage.js`: JavaScript client with JSDoc documentation and utility functions
  - Both examples include complete CRUD operations with proper error handling
  - Added validation utilities and helper functions for common operations

- **Test Suite**: Comprehensive unit and integration test coverage
  - `test/customer.test.js`: Unit tests for all API endpoints and model methods
  - `test/integration.test.js`: Integration tests for the API client
  - `test/package.json`: Test configuration with Jest and coverage reporting
  - Tests cover all CRUD operations, error scenarios, and edge cases
  - Mocked database interactions for reliable testing
  - Added test coverage reporting and watch mode support

- **Documentation**: Enhanced project documentation
  - Added detailed API usage examples for both TypeScript and JavaScript
  - Included error handling patterns and best practices
  - Added comprehensive test documentation and setup instructions

### Enhanced
- **Error Handling**: Improved error messages and response consistency
  - Better error propagation in client examples
  - Standardized error response formats
  - Added proper HTTP status codes for different error scenarios

- **Code Quality**: Added type safety and validation
  - TypeScript interfaces for better development experience
  - Input validation utilities
  - JSDoc documentation for JavaScript functions

### Technical Details
- **Dependencies**: Examples require `axios` for HTTP requests
- **Testing**: Uses Jest with Supertest for API testing
- **TypeScript Support**: Full type definitions and interfaces
- **Coverage**: Comprehensive test coverage for all endpoints and model methods

### Usage
To run the examples:
```bash
# JavaScript example
node examples/javascript-usage.js

# TypeScript example (requires ts-node)
npx ts-node examples/typescript-usage.ts
```

To run tests:
```bash
cd test
npm install
npm test
npm run test:coverage  # For coverage report
```

### Breaking Changes
None - This release is fully backward compatible.

### Migration Guide
No migration needed. All existing functionality remains unchanged.

---

## [1.0.0] - Initial Release

### Added
- RESTful API with Express.js and MySQL
- Customer CRUD operations (Create, Read, Update, Delete)
- MySQL database integration with connection pooling
- Basic middleware support
- Express server setup with body parsing
- Customer model with database operations
- API routes for customer management

### Features
- `POST /customers` - Create new customer
- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `DELETE /customers` - Delete all customers

### Technical Stack
- Node.js with Express.js framework
- MySQL database with mysql2 driver
- Body-parser middleware for request parsing
- Environment-based configuration support
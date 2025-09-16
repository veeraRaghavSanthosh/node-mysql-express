# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-09-16

### Added
- **Orders API**: New POST /v1/orders endpoint for creating orders
  - Comprehensive payload validation for all required fields
  - Support for customer_id, product_name, quantity, unit_price
  - Optional fields: total_amount, order_date, status
  - Automatic total_amount calculation if not provided
  - Status validation (pending, processing, shipped, delivered, cancelled)
  - Database integration with automatic table creation
- **Complete CRUD operations** for orders:
  - GET /v1/orders - Retrieve all orders
  - GET /v1/orders/:orderId - Retrieve single order by ID
  - PUT /v1/orders/:orderId - Update existing order
  - DELETE /v1/orders/:orderId - Delete single order
  - DELETE /v1/orders - Delete all orders
- **Comprehensive test suite** with 21 unit tests covering:
  - Payload validation scenarios
  - Success cases
  - Error handling
  - Database integration testing
- **Enhanced development setup**:
  - Jest testing framework integration
  - Test coverage reporting
  - Supertest for API endpoint testing

### Technical Details
- Orders table schema with proper data types and constraints
- Input validation with detailed error messages
- Consistent error handling and HTTP status codes
- Follows existing codebase patterns and architecture
- Database connection pooling with MySQL

### Files Added
- `app/models/order.model.js` - Order data model and database operations
- `app/controllers/order.controller.js` - Order business logic and validation
- `app/routes/order.routes.js` - Order API route definitions
- `tests/order.test.js` - Comprehensive unit test suite
- `CHANGELOG.md` - This changelog file

### Files Modified
- `server.js` - Added order routes integration
- `package.json` - Added testing dependencies and scripts

## [1.0.0] - Initial Release

### Added
- Basic Node.js Express application with MySQL integration
- Customer CRUD operations
- Database connection configuration
- Basic middleware setup
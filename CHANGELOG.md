# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Orders API Endpoint**: Implemented `POST /v1/orders` endpoint for creating new orders
  - Comprehensive payload validation for all required and optional fields
  - Automatic calculation of total amount based on quantity and unit price
  - Support for order status management (pending, confirmed, shipped, delivered, cancelled)
  - Database persistence with MySQL
  - RESTful API design following existing project patterns
- **Database Schema**: Added orders table with proper indexing and foreign key relationships
- **Comprehensive Testing**: Added unit tests and integration test structure
  - Controller validation tests covering all edge cases
  - Model tests for database operations
  - Error handling and database failure scenarios
  - 100% test coverage for order-related functionality
- **Development Dependencies**: Added Jest and Supertest for testing framework

### Technical Details
- **Validation Rules**:
  - `customer_id`: Required positive integer
  - `product_name`: Required non-empty string (max 255 characters)
  - `quantity`: Required positive integer
  - `unit_price`: Required non-negative number
  - `status`: Optional enum (pending, confirmed, shipped, delivered, cancelled)
  - `order_date`: Optional valid date (defaults to current timestamp)
- **Database Table**: `orders` with proper indexing on customer_id, status, and order_date
- **API Response**: Returns 201 Created with order details including calculated total_amount
- **Error Handling**: Returns 400 Bad Request with detailed validation errors

### Files Added
- `app/models/order.model.js` - Order data model with CRUD operations
- `app/controllers/order.controller.js` - Order business logic and validation
- `app/routes/order.routes.js` - Order API routes definition
- `database/create_orders_table.sql` - Database migration script
- `tests/order.controller.test.js` - Controller unit tests
- `tests/order.model.test.js` - Model unit tests  
- `tests/integration/order.integration.test.js` - Integration test structure
- `jest.config.js` - Jest testing configuration
- `CHANGELOG.md` - This changelog file

### Files Modified
- `server.js` - Added order routes registration
- `package.json` - Added testing dependencies and scripts

## [1.0.0] - Initial Release
### Added
- Basic Node.js + Express + MySQL API structure
- Customer CRUD operations
- Database configuration and connection pooling
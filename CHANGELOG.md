# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- POST /v1/orders endpoint for creating new orders
- Comprehensive payload validation for order creation
- Order model with full CRUD operations
- Database schema for orders table with proper indexing
- Unit tests for order controller and model (100% coverage)
- Support for order status management (pending, processing, shipped, delivered, cancelled)
- Automatic total amount calculation based on quantity and unit price
- Input sanitization (product name trimming)
- Proper error handling and HTTP status codes
- Development dependencies for testing (Jest, Supertest)

### Changed
- Updated package.json with test scripts and dev dependencies
- Enhanced server.js to include order routes

### Technical Details
- Order validation includes:
  - customer_id: required positive integer
  - product_name: required non-empty string
  - quantity: required positive integer
  - unit_price: required positive number
  - status: optional enum value
- Database table includes proper indexing for performance
- Comprehensive error handling for all edge cases
- Follows existing codebase patterns and conventions

## [1.0.0] - Initial Release
- Basic customer CRUD operations
- Express.js server setup
- MySQL database integration
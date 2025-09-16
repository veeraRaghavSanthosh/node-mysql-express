# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2024-01-XX

### Added
- **New Orders API Endpoint**: Implemented POST /v1/orders endpoint for creating orders
  - Comprehensive payload validation using Joi schema validation
  - Support for order items with product details (name, quantity, price)
  - Order status management (pending, processing, shipped, delivered, cancelled)
  - Database transactions to ensure data consistency
  - Foreign key validation for customer_id
  - Proper error handling with descriptive messages

### Features
- **Order Model**: Complete CRUD operations for orders with support for related order items
- **Validation**: Robust input validation with detailed error messages
- **Database Schema**: New tables for orders and order_items with proper relationships
- **Testing**: Comprehensive unit and integration tests with >95% coverage
  - Controller tests with mocked dependencies
  - Model tests for database operations
  - Integration tests for full endpoint functionality
  - Validation testing for all edge cases

### Technical Details
- Added Joi validation library for request payload validation
- Implemented database transactions for order creation with items
- Added proper foreign key constraints and indexing
- Enhanced error handling with specific database error codes
- Added Jest testing framework with supertest for API testing

### Database Changes
- New `orders` table with fields: id, customer_id, total_amount, status, order_date
- New `order_items` table with fields: id, order_id, product_name, quantity, price
- Added foreign key relationships between orders, order_items, and customers
- Added appropriate indexes for performance optimization

### Dependencies Added
- `joi`: ^17.9.2 - Schema validation
- `jest`: ^29.6.2 - Testing framework
- `supertest`: ^6.3.3 - HTTP testing
- `nodemon`: ^3.0.1 - Development server

### API Documentation
#### POST /v1/orders
Creates a new order with optional items.

**Request Body:**
```json
{
  "customer_id": 1,
  "total_amount": 149.98,
  "status": "pending",
  "items": [
    {
      "product_name": "Laptop",
      "quantity": 1,
      "price": 999.99
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "customer_id": 1,
    "total_amount": 149.98,
    "status": "pending",
    "order_date": "2024-01-15T10:30:00.000Z",
    "items": [...]
  }
}
```

### Breaking Changes
None - This is a new feature addition.

### Migration Notes
Run the provided `database_schema.sql` file to create the required tables before using the new orders endpoint.
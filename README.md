# Node.js Express MySQL API

A RESTful CRUD API built with Node.js, Express, and MySQL, featuring a comprehensive payment processing system.

## Features

- Customer management (CRUD operations)
- Payment processing with validation and business rules
- Payment refund functionality
- Payment history tracking
- Comprehensive error handling and input validation
- SQL injection prevention with parameterized queries
- Extensive unit test coverage

## Installation

1. Install dependencies:
```bash
npm install
```

2. Install development dependencies (for testing):
```bash
npm install --save-dev jest
```

## Database Setup

Configure your MySQL database connection in `app/config/db.config.js`.

Required tables:
- `customers` (existing)
- `payments` (for payment service)
- `refunds` (for refund functionality)

## Running the Application

Start the server:
```bash
npm start
```

## Testing

The project includes comprehensive unit tests for the payment service.

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage report:
```bash
npm run test:coverage
```

## API Endpoints

### Customers
- `POST /customers` - Create a new customer
- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `DELETE /customers` - Delete all customers

### Payments (Payment Service)
The payment service provides the following functionality:

- **Process Payment**: Validate and process customer payments
- **Refund Payment**: Handle full and partial refunds with business rule validation
- **Payment History**: Retrieve payment history for customers
- **Payment Validation**: Validate payment methods and amounts
- **Payment Lookup**: Get individual payment details

## Payment Service Features

### Security
- Parameterized queries to prevent SQL injection
- Input validation for all parameters
- Business rule enforcement

### Edge Cases Handled
- Invalid payment amounts (negative, zero, NaN, exceeding limits)
- Non-existent customers or payments
- Refunding already refunded payments
- Refunding failed or cancelled payments
- Payment amount exceeding maximum limits
- Invalid payment methods

### Helper Functions
- `handleDatabaseError()`: Centralized error handling
- `validateCustomerExists()`: Customer validation with database lookup
- `validateAmount()`: Amount validation with business rules
- `validateRequiredField()`: Generic field validation
- `generateTransactionId()`: Unique transaction ID generation

## Code Quality

- Comprehensive JSDoc documentation
- Consistent error handling patterns
- Extensive unit test coverage (95%+)
- Clean code architecture with extracted helper functions
- Security best practices implementation

## Recent Changes

See [CHANGELOG.md](CHANGELOG.md) for detailed information about recent updates and improvements.
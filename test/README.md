# Payment System Unit Tests

This directory contains comprehensive unit tests for the payment functionality in the Node.js/Express/MySQL application.

## Test Coverage

### Payment Model Tests (`test/models/payment.model.test.js`)

**Success Cases:**
- ✅ Payment constructor with all required fields
- ✅ Payment constructor with default values
- ✅ Create payment with valid data
- ✅ Create payment with minimum required fields
- ✅ Find payment by ID successfully
- ✅ Process pending payment successfully (90% success simulation)
- ✅ Handle payment processing failure (10% failure simulation)
- ✅ Update payment status successfully
- ✅ Create refund for completed payment
- ✅ Create full refund
- ✅ Retrieve all payments
- ✅ Retrieve payments by customer ID

**Failure Cases:**
- ✅ Missing customer_id validation
- ✅ Missing amount validation
- ✅ Missing payment_method validation
- ✅ Zero amount validation
- ✅ Negative amount validation
- ✅ Database connection errors
- ✅ Payment not found errors
- ✅ Invalid payment status for processing
- ✅ Invalid status updates
- ✅ Refund non-completed payments
- ✅ Refund amount exceeding original payment

**Boundary Cases:**
- ✅ Maximum payment amount (100,000)
- ✅ Amount exceeding maximum limit
- ✅ Minimum positive amount (0.01)
- ✅ Very large customer IDs
- ✅ Minimum and maximum refund amounts

### Payment Controller Tests (`test/controllers/payment.controller.test.js`)

**Success Cases:**
- ✅ Create payment with full data
- ✅ Create payment with minimal required fields
- ✅ Process payment successfully
- ✅ Find payment by ID
- ✅ Retrieve all payments
- ✅ Retrieve payments by customer
- ✅ Update payment status
- ✅ Process refunds (partial and full)

**Failure Cases:**
- ✅ Empty request body validation (400)
- ✅ Validation errors (400)
- ✅ Database errors (500)
- ✅ Payment not found (404)
- ✅ Business logic errors (400)
- ✅ Invalid status updates (400)
- ✅ Invalid refund requests (400)

**Boundary Cases:**
- ✅ Maximum allowed payment amounts
- ✅ Minimum refund amounts
- ✅ Full refunds

## Test Statistics

- **Total Tests:** 62
- **Passing:** 62 (100%)
- **Coverage Areas:**
  - Payment creation and validation
  - Payment processing simulation
  - Payment retrieval and searching
  - Payment status management
  - Refund processing
  - Error handling and edge cases
  - HTTP status code validation
  - Database error simulation

## Test Framework

- **Testing Framework:** Mocha
- **Assertion Library:** Chai
- **Mocking/Stubbing:** Sinon
- **HTTP Testing:** Supertest (configured but not used in these unit tests)

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npx mocha test/models/payment.model.test.js
npx mocha test/controllers/payment.controller.test.js
```

## Test Structure

### Model Tests
- Focus on business logic validation
- Database interaction mocking
- Data validation and transformation
- Error handling at the data layer

### Controller Tests
- HTTP request/response handling
- Status code validation
- Request validation
- Error response formatting
- Integration with model layer

## Key Features Tested

1. **Payment Creation**
   - Required field validation
   - Amount limits and validation
   - Default value assignment

2. **Payment Processing**
   - Status transitions
   - Processing simulation (90% success rate)
   - Business rule enforcement

3. **Payment Retrieval**
   - Individual payment lookup
   - Customer payment history
   - All payments listing

4. **Payment Updates**
   - Status changes with validation
   - Allowed status transitions

5. **Refund Processing**
   - Partial and full refunds
   - Amount validation
   - Status requirements

6. **Error Handling**
   - Validation errors
   - Database errors
   - Business logic errors
   - Not found scenarios

7. **Boundary Testing**
   - Minimum/maximum amounts
   - Edge case values
   - Limit testing

## Payment System Features

The payment system includes:

- **Payment Model** (`app/models/payment.model.js`)
- **Payment Controller** (`app/controllers/payment.controller.js`)
- **Payment Routes** (`app/routes/payment.routes.js`)

### API Endpoints Covered

- `POST /payments` - Create payment
- `POST /payments/:id/process` - Process payment
- `GET /payments` - Get all payments
- `GET /payments/:id` - Get payment by ID
- `GET /customers/:id/payments` - Get customer payments
- `PUT /payments/:id/status` - Update payment status
- `POST /payments/:id/refund` - Process refund

## Test Data Patterns

- **Valid Payment:** customer_id, amount (0.01-100000), payment_method
- **Invalid Scenarios:** Missing fields, zero/negative amounts, excessive amounts
- **Status Flow:** pending → completed/failed
- **Refund Flow:** completed payments only, amount ≤ original amount
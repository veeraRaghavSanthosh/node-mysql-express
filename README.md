# Node.js Express MySQL Payment API

A RESTful API for customer and payment management with comprehensive logging capabilities.

## Features

- **Customer Management**: CRUD operations for customers
- **Payment Processing**: Complete payment system with transaction tracking
- **Advanced Logging**: Configurable winston-based logging with multiple levels
- **Comprehensive Testing**: Unit tests with high coverage
- **Database Integration**: MySQL database with connection pooling

## Payment System Logging

This application implements comprehensive logging throughout the payment system with configurable log levels:

### Log Levels

- **ERROR** (0): System errors with full stack traces
- **WARN** (1): Business logic issues (not found, validation failures)  
- **INFO** (2): Successful operations with key metrics
- **DEBUG** (3): Database operations and processing steps
- **TRACE** (4): Function entry/exit points with parameters

### Configuration

Set the `LOG_LEVEL` environment variable to control logging verbosity:

```bash
export LOG_LEVEL=trace  # Show all logs (most verbose)
export LOG_LEVEL=debug  # Show debug, info, warn, error
export LOG_LEVEL=info   # Show info, warn, error (default)
export LOG_LEVEL=warn   # Show warn, error
export LOG_LEVEL=error  # Show only errors (least verbose)
```

### Log Output

- **Console**: Colorized output in non-production environments
- **Files**: 
  - `logs/error.log`: Error-level logs only
  - `logs/combined.log`: All logs
- **Format**: Structured JSON with timestamps and service identification

## API Endpoints

### Customers
- `POST /customers` - Create a new customer
- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `DELETE /customers` - Delete all customers

### Payments
- `POST /payments` - Create and process a new payment
- `GET /payments` - Get all payments
- `GET /payments/:id` - Get payment by ID
- `GET /customers/:customerId/payments` - Get payments for a customer
- `PUT /payments/:id` - Update payment
- `DELETE /payments/:id` - Delete payment

## Installation

```bash
npm install
```

## Database Setup

1. Create MySQL database and update `app/config/db.config.js`
2. Run the schema creation script:

```sql
-- Execute the contents of schema.sql
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  transaction_id VARCHAR(100) UNIQUE,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer_id (customer_id),
  INDEX idx_status (status),
  INDEX idx_transaction_id (transaction_id)
);
```

## Running the Application

```bash
# Development (with debug logging)
LOG_LEVEL=debug npm start

# Production (minimal logging)
NODE_ENV=production LOG_LEVEL=warn npm start

# With trace logging (most verbose)
LOG_LEVEL=trace npm start
```

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch
```

## Logging Demo

Run the logging demonstration to see all log levels in action:

```bash
# See all log levels
LOG_LEVEL=trace node demo-logging.js

# See only info and above
LOG_LEVEL=info node demo-logging.js

# See only errors
LOG_LEVEL=error node demo-logging.js
```

## Payment Processing Example

```bash
# Create a payment with trace logging
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "amount": 100.50,
    "currency": "USD",
    "payment_method": "credit_card",
    "description": "Test payment"
  }'
```

The payment system will:
1. **TRACE**: Log function entry with parameters
2. **INFO**: Log payment processing start with key details
3. **DEBUG**: Log transaction ID generation and database operations
4. **INFO**: Log successful payment creation and processing completion
5. **TRACE**: Log function exit with results

## Log Level Behavior

| Level | ERROR | WARN | INFO | DEBUG | TRACE |
|-------|-------|------|------|-------|-------|
| error | ✓     |      |      |       |       |
| warn  | ✓     | ✓    |      |       |       |
| info  | ✓     | ✓    | ✓    |       |       |
| debug | ✓     | ✓    | ✓    | ✓     |       |
| trace | ✓     | ✓    | ✓    | ✓     | ✓     |

## Production Considerations

- Set `NODE_ENV=production` to disable console logging
- Use `LOG_LEVEL=warn` or `LOG_LEVEL=error` in production
- Log files are rotated automatically by winston
- Structured JSON logs are suitable for log aggregation systems

## Dependencies

- **express**: Web framework
- **mysql**: Database connectivity
- **winston**: Advanced logging
- **body-parser**: Request parsing
- **jest**: Testing framework (dev)
- **supertest**: HTTP testing (dev)
# Node.js Express MySQL API with Billing and Advanced Logging

A RESTful API built with Node.js, Express, and MySQL featuring comprehensive billing functionality and advanced logging capabilities.

## Features

### Billing Module
- Complete CRUD operations for billing records
- Customer-specific billing record management
- Payment processing simulation
- Status tracking (pending, paid, cancelled, failed)

### Advanced Logging System
- **Winston-based logging** with configurable log levels
- **Trace-level debugging** for detailed function execution tracking
- **Structured JSON logging** with timestamps and metadata
- **File and console output** with separate error logs
- **Environment-based configuration** via `LOG_LEVEL`

### Log Levels
- **error** (0): Error conditions only
- **warn** (1): Warning and error messages
- **info** (2): Informational, warning, and error messages (default)
- **debug** (3): Debug-level messages plus all above
- **trace** (4): Function entry/exit tracing plus all above (most verbose)

## Quick Start

### Installation
```bash
npm install
```

### Database Setup
```sql
-- Create customers table (if not exists)
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255),
  name VARCHAR(255),
  active BOOLEAN DEFAULT TRUE
);

-- Create billing table
CREATE TABLE billing (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  description VARCHAR(255),
  status ENUM('pending', 'paid', 'cancelled', 'failed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
```

### Running the Server

#### Development Mode (with trace logging)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

#### Custom Log Level
```bash
LOG_LEVEL=debug npm start
```

## API Endpoints

### Billing Endpoints

#### Create Billing Record
```http
POST /billing
Content-Type: application/json

{
  "customer_id": 1,
  "amount": 99.99,
  "description": "Monthly subscription",
  "status": "pending"
}
```

#### Get All Billing Records
```http
GET /billing
```

#### Get Billing Record by ID
```http
GET /billing/:billingId
```

#### Get Billing Records for Customer
```http
GET /customers/:customerId/billing
```

#### Update Billing Record
```http
PUT /billing/:billingId
Content-Type: application/json

{
  "customer_id": 1,
  "amount": 149.99,
  "description": "Updated subscription",
  "status": "pending"
}
```

#### Process Payment
```http
POST /billing/:billingId/payment
Content-Type: application/json

{
  "method": "credit_card",
  "card_number": "**** **** **** 1234"
}
```

#### Delete Billing Record
```http
DELETE /billing/:billingId
```

#### Delete All Billing Records
```http
DELETE /billing
```

## Logging Examples

### Trace Level Logging
When `LOG_LEVEL=trace`, you'll see detailed function execution:

```json
{
  "timestamp": "2025-09-16 10:30:45",
  "level": "trace",
  "message": "Entering Billing.create",
  "service": "billing-service",
  "billing": {
    "customer_id": 1,
    "amount": 99.99,
    "description": "Monthly subscription"
  }
}
```

### Debug Level Logging
Database queries and operations:

```json
{
  "timestamp": "2025-09-16 10:30:45",
  "level": "debug",
  "message": "Executing billing creation query",
  "service": "billing-service",
  "query": "INSERT INTO billing SET ?",
  "data": { "customer_id": 1, "amount": 99.99 }
}
```

### Error Logging
Comprehensive error information:

```json
{
  "timestamp": "2025-09-16 10:30:45",
  "level": "error",
  "message": "Error creating billing record",
  "service": "billing-service",
  "error": "Database connection failed",
  "stack": "Error: Database connection failed\\n    at ...",
  "billing": { "customer_id": 1, "amount": 99.99 }
}
```

## Testing

### Run Tests
```bash
npm test
```

### Test Coverage
The test suite includes:
- API endpoint testing with mocked database
- Logging functionality verification
- Error handling and edge cases
- Log level configuration testing

## Log Files

- **logs/error.log**: Error-level messages only
- **logs/combined.log**: All log messages based on configured level
- **Console**: Colored output for development (when NODE_ENV !== 'production')

## Configuration

### Environment Variables
- `LOG_LEVEL`: Set logging verbosity (error, warn, info, debug, trace)
- `NODE_ENV`: Environment mode (development, production, test)
- `PORT`: Server port (default: 3000)

### Database Configuration
Update `app/config/db.config.js` with your MySQL connection details.

## Project Structure

```
├── app/
│   ├── config/
│   │   ├── db.config.js          # Database configuration
│   │   └── logger.config.js      # Winston logger configuration
│   ├── controllers/
│   │   ├── billing.controller.js # Billing API controllers
│   │   └── customer.controller.js
│   ├── models/
│   │   ├── billing.model.js      # Billing data model with logging
│   │   ├── customer.model.js
│   │   └── db.js
│   └── routes/
│       ├── billing.routes.js     # Billing route definitions
│       └── customer.routes.js
├── tests/
│   ├── billing.test.js           # Comprehensive billing tests
│   └── setup.js                  # Test configuration
├── logs/                         # Log files directory
├── examples/
│   └── billing_example.js        # Usage examples
├── database/
│   └── billing_schema.sql        # Database schema
├── server.js                     # Main application entry point
└── package.json                  # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add comprehensive logging to new features
4. Write unit tests
5. Update the changelog
6. Submit a pull request

## License

ISC License
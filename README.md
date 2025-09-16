# Node.js Express MySQL CRUD API

A RESTful CRUD API built with Node.js, Express.js, and MySQL for managing customer data.

## Features

- RESTful API endpoints for customer management
- MySQL database integration
- Express.js middleware support
- CRUD operations (Create, Read, Update, Delete)
- Error handling and validation
- Comprehensive usage examples in JavaScript and TypeScript
- Full test coverage with Jest

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | Get all customers |
| GET | `/customers/:id` | Get customer by ID |
| POST | `/customers` | Create new customer |
| PUT | `/customers/:id` | Update customer by ID |
| DELETE | `/customers/:id` | Delete customer by ID |
| DELETE | `/customers` | Delete all customers |

## Customer Data Structure

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "active": true
}
```

## Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Configure your MySQL database in `app/config/db.config.js`
4. Create the customers table in your MySQL database:
```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true
);
```

## Usage

### Start the Server
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Run Tests
```bash
npm test
```

For test coverage:
```bash
npm run test:coverage
```

## Usage Examples

### JavaScript Example
See `examples/usage-javascript.js` for comprehensive JavaScript usage examples including:
- Basic server setup
- Direct model usage
- HTTP client implementation
- Complete API demonstration
- Error handling patterns

```javascript
const { CustomerAPIClient } = require('./examples/usage-javascript');

const client = new CustomerAPIClient('http://localhost:3000');

// Create a customer
const customer = await client.createCustomer({
  email: 'john@example.com',
  name: 'John Doe',
  active: true
});
```

### TypeScript Example
See `examples/usage-typescript.ts` for TypeScript usage with proper type definitions:

```typescript
import { CustomerAPIClient, CustomerData } from './examples/usage-typescript';

const client = new CustomerAPIClient('http://localhost:3000');

const customerData: CustomerData = {
  email: 'jane@example.com',
  name: 'Jane Smith',
  active: true
};

const customer = await client.createCustomer(customerData);
```

## Testing

The project includes comprehensive unit tests covering:
- Model layer functionality
- Controller logic
- API integration
- Error handling
- Usage examples

Run tests with:
```bash
npm test
```

## Project Structure

```
├── app/
│   ├── config/
│   │   └── db.config.js          # Database configuration
│   ├── controllers/
│   │   └── customer.controller.js # Customer route handlers
│   ├── models/
│   │   ├── customer.model.js      # Customer data model
│   │   └── db.js                  # Database connection
│   └── routes/
│       └── customer.routes.js     # API route definitions
├── examples/
│   ├── usage-javascript.js        # JavaScript usage examples
│   └── usage-typescript.ts        # TypeScript usage examples
├── tests/
│   ├── customer.test.js           # Model and controller tests
│   └── usage-examples.test.js     # Usage example tests
├── server.js                      # Main server file
├── package.json                   # Dependencies and scripts
└── README.md                      # This file
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## License

ISC License
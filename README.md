# Node.js Express MySQL REST API

A RESTful CRUD API built with Node.js, Express.js, and MySQL for managing customer data.

## Features

- Complete CRUD operations for customers
- MySQL database integration with connection pooling
- RESTful API endpoints
- Error handling and validation
- TypeScript and JavaScript usage examples
- Comprehensive test suite

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/customers` | Create a new customer |
| GET    | `/customers` | Get all customers |
| GET    | `/customers/:id` | Get customer by ID |
| PUT    | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |
| DELETE | `/customers` | Delete all customers |

## Customer Schema

```json
{
  "id": "number (auto-generated)",
  "name": "string (required)",
  "email": "string (required)",
  "active": "boolean (required)"
}
```

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your MySQL database in `app/config/db.config.js`
4. Start the server:
   ```bash
   npm start
   ```

The server will run on `http://localhost:3000` by default.

## Usage Examples

### TypeScript

See `examples/typescript-usage.ts` for a complete TypeScript client implementation:

```typescript
import { CustomerApiClient, Customer } from './examples/typescript-usage';

const apiClient = new CustomerApiClient('http://localhost:3000');

// Create a customer
const newCustomer = await apiClient.createCustomer({
  name: 'John Doe',
  email: 'john.doe@example.com',
  active: true
});

// Get all customers
const customers = await apiClient.getAllCustomers();

// Update a customer
const updatedCustomer = await apiClient.updateCustomer(1, {
  name: 'John Smith'
});
```

### JavaScript

See `examples/javascript-usage.js` for a complete JavaScript client implementation:

```javascript
const { CustomerApiClient } = require('./examples/javascript-usage');

const apiClient = new CustomerApiClient('http://localhost:3000');

// Create a customer
const newCustomer = await apiClient.createCustomer({
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  active: true
});

// Get customer by ID
const customer = await apiClient.getCustomerById(1);

// Delete a customer
await apiClient.deleteCustomer(1);
```

## Testing

The project includes comprehensive unit and integration tests.

### Running Tests

```bash
cd test
npm install
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

### Test Structure

- `test/customer.test.js` - Unit tests for API endpoints and model methods
- `test/integration.test.js` - Integration tests for the API client
- `test/package.json` - Test configuration and dependencies

## Database Setup

1. Create a MySQL database
2. Create the customers table:

```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

3. Update the database configuration in `app/config/db.config.js`:

```javascript
module.exports = {
  HOST: "your-host",
  USER: "your-username", 
  PASSWORD: "your-password",
  DB: "your-database-name"
};
```

## Project Structure

```
├── app/
│   ├── config/
│   │   └── db.config.js          # Database configuration
│   ├── controllers/
│   │   └── customer.controller.js # API endpoint handlers
│   ├── models/
│   │   ├── db.js                 # Database connection
│   │   └── customer.model.js     # Customer data model
│   └── routes/
│       └── customer.routes.js    # API routes definition
├── examples/
│   ├── typescript-usage.ts      # TypeScript usage example
│   └── javascript-usage.js      # JavaScript usage example
├── test/
│   ├── customer.test.js          # Unit tests
│   ├── integration.test.js       # Integration tests
│   └── package.json              # Test dependencies
├── server.js                     # Main server file
├── package.json                  # Project dependencies
├── CHANGELOG.md                  # Version history
└── README.md                     # This file
```

## Error Handling

The API returns consistent error responses:

```json
{
  "message": "Error description"
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

## Dependencies

### Runtime Dependencies
- `express` - Web framework
- `mysql` - MySQL driver
- `body-parser` - Request body parsing

### Development Dependencies (for examples)
- `axios` - HTTP client for examples
- `@types/node` - TypeScript definitions (for TypeScript usage)

### Test Dependencies
- `jest` - Testing framework
- `supertest` - HTTP testing

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

ISC

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and changes.
# Node.js Express MySQL REST API - Usage Examples

This directory contains sample usage snippets for the Node.js Express MySQL REST API in both JavaScript and TypeScript.

## Files

- `javascript-example.js` - Complete JavaScript usage examples with native HTTP and axios
- `typescript-example.ts` - TypeScript examples with type definitions and advanced patterns

## API Endpoints

The REST API provides the following endpoints for customer management:

- `POST /customers` - Create a new customer
- `GET /customers` - Get all customers  
- `GET /customers/:id` - Get a customer by ID
- `PUT /customers/:id` - Update a customer
- `DELETE /customers/:id` - Delete a customer
- `DELETE /customers` - Delete all customers

## Customer Data Structure

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com", 
  "active": true
}
```

## Prerequisites

### For JavaScript Example
```bash
npm install axios  # Optional, for axios examples
```

### For TypeScript Example
```bash
npm install --save-dev typescript @types/node
npm install axios @types/axios
```

## Running the Examples

### Start the API Server
```bash
node server.js
```
The server will start on http://localhost:3000

### Run JavaScript Example
```bash
node usage-examples/javascript-example.js
```

### Run TypeScript Example
```bash
# Compile TypeScript
npx tsc usage-examples/typescript-example.ts --target es2017 --module commonjs --lib es2017

# Run compiled JavaScript
node usage-examples/typescript-example.js
```

Or use ts-node:
```bash
npm install -g ts-node
ts-node usage-examples/typescript-example.ts
```

## Example Usage Patterns

### Basic CRUD Operations (JavaScript)
```javascript
const { createCustomer, getAllCustomers } = require('./usage-examples/javascript-example');

// Create a customer
const newCustomer = await createCustomer({
  name: 'John Doe',
  email: 'john@example.com',
  active: true
});

// Get all customers
const customers = await getAllCustomers();
```

### Type-Safe Operations (TypeScript)
```typescript
import { ApiClient, Customer } from './usage-examples/typescript-example';

const client = new ApiClient();

const customerData: Customer = {
  name: 'Jane Smith',
  email: 'jane@example.com',
  active: true
};

const createdCustomer = await client.createCustomer(customerData);
```

### Advanced Service Layer (TypeScript)
```typescript
import { CustomerService } from './usage-examples/typescript-example';

const service = new CustomerService(true); // Use axios client

// Create multiple customers with validation
const customers = await service.createMultipleCustomers([
  { name: 'Alice', email: 'alice@example.com', active: true },
  { name: 'Bob', email: 'bob@example.com', active: false }
]);

// Get only active customers
const activeCustomers = await service.getCustomers(true);
```

## Database Setup

Make sure to configure your MySQL database connection in `app/config/db.config.js`:

```javascript
module.exports = {
  HOST: "localhost",
  USER: "your_username", 
  PASSWORD: "your_password",
  DB: "your_database_name"
};
```

Create the customers table:
```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true
);
```

## Error Handling

Both examples include comprehensive error handling patterns:

- Network errors
- HTTP status errors  
- Validation errors
- Database connection errors

## Features Demonstrated

### JavaScript Example
- Native Node.js HTTP client
- Axios HTTP client with interceptors
- Promise-based async operations
- Error handling and logging
- Modular function exports

### TypeScript Example  
- Strong typing with interfaces
- Generic HTTP client methods
- Service layer with business logic
- Input validation
- Batch operations
- Advanced error handling
- Request/response interceptors

## Notes

- Make sure the API server is running before executing the examples
- The examples assume the default server configuration (localhost:3000)
- Database credentials in the config should be updated for your environment
- Examples include both basic usage and advanced patterns for different use cases
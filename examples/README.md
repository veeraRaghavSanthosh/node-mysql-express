# Customer API Usage Examples

This directory contains comprehensive usage examples for the Node.js Express MySQL Customer REST API in both JavaScript and TypeScript.

## Overview

The Customer API provides CRUD (Create, Read, Update, Delete) operations for managing customer data with the following endpoints:

- `POST /customers` - Create a new customer
- `GET /customers` - Get all customers
- `GET /customers/:id` - Get a specific customer by ID
- `PUT /customers/:id` - Update a customer by ID
- `DELETE /customers/:id` - Delete a customer by ID
- `DELETE /customers` - Delete all customers

## Customer Data Structure

```javascript
{
  id: number,        // Auto-generated unique identifier
  name: string,      // Customer name (required)
  email: string,     // Customer email (required)
  active: boolean    // Customer status (required)
}
```

## Quick Start

1. **Start the API server first:**
   ```bash
   cd ..  # Go back to the main project directory
   npm install
   node server.js
   ```
   The server will run on `http://localhost:3000`

2. **Install example dependencies:**
   ```bash
   cd examples
   npm install
   ```

3. **Run the examples:**
   ```bash
   # JavaScript example
   npm run demo-js
   
   # TypeScript example (requires ts-node)
   npm run demo-ts
   
   # Or compile TypeScript first, then run
   npm run demo-ts-compiled
   ```

## Files

### `usage-javascript.js`
- Complete JavaScript implementation using both Axios and native fetch
- Includes error handling and practical examples
- Two client implementations: `CustomerAPIClient` (Axios) and `CustomerAPIClientFetch` (native fetch)
- Ready to run with `node usage-javascript.js`

### `usage-typescript.ts`
- TypeScript implementation with full type safety
- Includes interfaces for all data structures
- Advanced service class with validation
- Proper error handling with TypeScript types
- Demonstrates both Axios and fetch approaches

### `package.json`
- Dependencies and scripts for running the examples
- Includes TypeScript compilation setup

## Usage Examples

### Basic JavaScript Usage

```javascript
const { CustomerAPIClient } = require('./usage-javascript');

const client = new CustomerAPIClient('http://localhost:3000');

// Create a customer
const newCustomer = await client.createCustomer({
  name: 'John Doe',
  email: 'john@example.com',
  active: true
});

// Get all customers
const customers = await client.getAllCustomers();

// Update a customer
const updated = await client.updateCustomer(1, {
  name: 'John Smith',
  active: false
});
```

### TypeScript Usage

```typescript
import { CustomerAPIClient, CreateCustomerRequest } from './usage-typescript';

const client = new CustomerAPIClient('http://localhost:3000');

const customerData: CreateCustomerRequest = {
  name: 'Jane Doe',
  email: 'jane@example.com',
  active: true
};

const customer = await client.createCustomer(customerData);
```

### Advanced TypeScript with Validation

```typescript
import { AdvancedCustomerService } from './usage-typescript';

const service = new AdvancedCustomerService('http://localhost:3000');

// Includes email validation and error handling
const customer = await service.createCustomerSafe({
  name: 'Valid User',
  email: 'user@example.com',
  active: true
});

// Safe get with null return for not found
const maybeCustomer = await service.getCustomerSafe(999);
if (maybeCustomer === null) {
  console.log('Customer not found');
}
```

## Error Handling

Both implementations include comprehensive error handling:

- **Network errors**: Connection failures, timeouts
- **HTTP errors**: 404 (not found), 500 (server error), etc.
- **Validation errors**: Invalid email format, empty names
- **Type safety**: TypeScript version prevents type-related errors

## Dependencies

### Runtime Dependencies
- `axios`: HTTP client library (optional, can use native fetch)

### Development Dependencies (TypeScript only)
- `typescript`: TypeScript compiler
- `ts-node`: Run TypeScript directly
- `@types/node`: Node.js type definitions

## API Server Requirements

Make sure the main API server is running before testing these examples:

1. The server should be accessible at `http://localhost:3000`
2. MySQL database should be properly configured
3. The `customers` table should exist in the database

## Testing the Examples

The examples include complete demo functions that will:

1. Create a test customer
2. Retrieve all customers
3. Get the specific customer by ID
4. Update the customer
5. Delete the customer
6. Show results for each operation

Run the demos to see the API in action and verify everything is working correctly.

## Customization

You can easily customize these examples:

- Change the `baseUrl` to point to a different server
- Modify the customer data structure if you extend the API
- Add authentication headers if needed
- Implement additional validation logic
- Add retry logic for failed requests

## Notes

- The examples use `console.log` for demonstration purposes
- In production, you'd typically use proper logging
- Error handling is comprehensive but can be customized for your needs
- The TypeScript version provides better IDE support and type safety
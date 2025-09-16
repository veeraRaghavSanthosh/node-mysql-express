# Usage Examples

This directory contains comprehensive usage examples for the Node.js Express MySQL REST API in both JavaScript and TypeScript.

## Files

- **`typescript-usage.ts`** - Complete TypeScript client with type definitions
- **`javascript-usage.js`** - JavaScript client with modern ES6+ patterns

## Quick Start

### JavaScript Example

```javascript
const { CustomerAPIClient } = require('./javascript-usage');

async function example() {
  const client = new CustomerAPIClient('http://localhost:3000');
  
  // Create a customer
  const customer = await client.createCustomer({
    email: 'user@example.com',
    name: 'John Doe',
    active: true
  });
  
  console.log('Created:', customer);
}
```

### TypeScript Example

```typescript
import { CustomerAPIClient, Customer } from './typescript-usage';

async function example(): Promise<void> {
  const client = new CustomerAPIClient('http://localhost:3000');
  
  const customerData: Customer = {
    email: 'user@example.com',
    name: 'John Doe',
    active: true
  };
  
  const customer = await client.createCustomer(customerData);
  console.log('Created:', customer);
}
```

## Running the Examples

1. Start the server:
```bash
npm start
```

2. Run JavaScript example:
```bash
node examples/javascript-usage.js
```

3. Run TypeScript example:
```bash
npx ts-node examples/typescript-usage.ts
```

## Features

Both examples include:
- Full CRUD operations
- Error handling
- Type safety (TypeScript)
- Bulk operations
- Data validation
- Active customer filtering

See the individual files for complete documentation and advanced usage patterns.
# Node.js Express MySQL API - Usage Examples

This directory contains comprehensive usage examples for the Node.js Express MySQL API in both JavaScript and TypeScript.

## Overview

The API provides a RESTful interface for managing customers with the following endpoints:

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

1. **Start the API server** (from the root directory):
   ```bash
   npm install
   node server.js
   ```
   The server will run on `http://localhost:3000` by default.

2. **Install example dependencies**:
   ```bash
   cd examples
   npm install
   ```

## JavaScript Usage

### Quick Start

```javascript
const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

// Create a customer
async function createCustomer() {
  try {
    const response = await axios.post(`${API_BASE_URL}/customers`, {
      name: "John Doe",
      email: "john.doe@example.com",
      active: true
    });
    console.log('Customer created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// Get all customers
async function getCustomers() {
  try {
    const response = await axios.get(`${API_BASE_URL}/customers`);
    console.log('Customers:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}
```

### Run the JavaScript Demo

```bash
npm run demo:js
```

This will run a complete CRUD demonstration showing:
- Creating a customer
- Fetching all customers
- Getting a specific customer
- Updating customer data
- Deleting a customer

## TypeScript Usage

### Quick Start

```typescript
import axios, { AxiosResponse } from 'axios';

interface Customer {
  id?: number;
  name: string;
  email: string;
  active: boolean;
}

class CustomerService {
  private baseUrl = 'http://localhost:3000';

  async createCustomer(customerData: Omit<Customer, 'id'>): Promise<Customer> {
    const response: AxiosResponse<Customer> = await axios.post(
      `${this.baseUrl}/customers`,
      customerData
    );
    return response.data;
  }

  async getAllCustomers(): Promise<Customer[]> {
    const response: AxiosResponse<Customer[]> = await axios.get(
      `${this.baseUrl}/customers`
    );
    return response.data;
  }
}

// Usage
const service = new CustomerService();
const customer = await service.createCustomer({
  name: "Alice Johnson",
  email: "alice@example.com",
  active: true
});
```

### Run the TypeScript Demo

```bash
# Using ts-node (recommended)
npm run demo:ts

# Or compile first then run
npm run demo:ts-compiled
```

## Alternative: Using Fetch API

For environments that support native fetch (Node.js 18+ or browsers):

```javascript
// Create customer with fetch
async function createCustomerWithFetch(customerData) {
  const response = await fetch('http://localhost:3000/customers', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerData)
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
}
```

## Error Handling

The API returns appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid data)
- `404` - Not Found (customer doesn't exist)
- `500` - Internal Server Error

Example error handling:

```javascript
try {
  const customer = await getCustomerById(999);
} catch (error) {
  if (error.response?.status === 404) {
    console.log('Customer not found');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Available Scripts

- `npm run demo:js` - Run JavaScript demonstration
- `npm run demo:ts` - Run TypeScript demonstration with ts-node
- `npm run build:ts` - Compile TypeScript to JavaScript
- `npm run demo:ts-compiled` - Compile and run TypeScript demo

## Files

- `javascript-usage.js` - Complete JavaScript examples with axios and fetch
- `typescript-usage.ts` - TypeScript examples with proper typing and interfaces
- `package.json` - Dependencies and scripts for running examples
- `README.md` - This documentation file

## Notes

- Make sure the main API server is running before executing the examples
- The examples use `http://localhost:3000` as the default API URL
- Both examples include comprehensive error handling and logging
- The TypeScript version includes proper type definitions and interfaces
- Examples demonstrate all CRUD operations with the Customer API
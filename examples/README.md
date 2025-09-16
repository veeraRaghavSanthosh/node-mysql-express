# Node.js Express MySQL Usage Examples

This directory contains sample usage snippets for the `node-mysql-express` library in both JavaScript and TypeScript.

## Overview

The `node-mysql-express` library provides a REST API for managing customers with full CRUD (Create, Read, Update, Delete) operations using:
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL** - Database

## Files

- `javascript-usage.js` - Complete JavaScript implementation
- `typescript-usage.ts` - Complete TypeScript implementation with type safety
- `package-typescript.json` - Package.json for TypeScript setup
- `tsconfig.json` - TypeScript configuration

## JavaScript Usage

### Prerequisites
```bash
npm install express body-parser mysql
```

### Database Setup
Create a MySQL database and table:
```sql
CREATE DATABASE your_database_name;
USE your_database_name;

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT TRUE
);
```

### Running the JavaScript Version
```bash
node javascript-usage.js
```

### API Endpoints (JavaScript)
- `POST /customers` - Create a new customer
- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID
- `PUT /customers/:id` - Update customer by ID
- `DELETE /customers/:id` - Delete customer by ID
- `GET /user` - Example middleware usage

## TypeScript Usage

### Prerequisites
```bash
# Install dependencies
npm install express body-parser mysql

# Install TypeScript and type definitions
npm install --save-dev typescript ts-node @types/node @types/express @types/mysql @types/body-parser
```

### Running the TypeScript Version
```bash
# Development mode with ts-node
npm run dev

# Or compile and run
npm run build
npm start
```

## Key Differences Between JavaScript and TypeScript Versions

### 1. **Import Statements**
**JavaScript:**
```javascript
const express = require("express");
const mysql = require("mysql");
```

**TypeScript:**
```typescript
import express, { Request, Response, NextFunction } from 'express';
import mysql, { Pool, MysqlError } from 'mysql';
```

### 2. **Type Definitions**
**TypeScript adds comprehensive type safety:**
```typescript
interface CustomerData {
  email: string;
  name: string;
  active: boolean;
}

interface CustomerWithId extends CustomerData {
  id: number;
}

type CustomerCallback<T> = (error: ApiError | null, result: T | null) => void;
```

### 3. **Function Signatures**
**JavaScript:**
```javascript
const create = (req, res) => {
  // Implementation
};
```

**TypeScript:**
```typescript
const create = (req: Request, res: Response): void => {
  // Implementation with type checking
};
```

### 4. **Class Implementation**
**TypeScript version includes proper class structure:**
```typescript
class Customer {
  public email: string;
  public name: string;
  public active: boolean;

  constructor(customer: CustomerData) {
    this.email = customer.email;
    this.name = customer.name;
    this.active = customer.active;
  }

  static create(newCustomer: Customer, result: CustomerCallback<CustomerWithId>): void {
    // Implementation
  }
}
```

### 5. **Enhanced Error Handling**
TypeScript version includes better error typing:
```typescript
interface ApiError {
  kind?: string;
  message?: string;
}
```

### 6. **Middleware Typing**
TypeScript provides better middleware support:
```typescript
interface RequestWithUsers extends Request {
  users?: User[];
}

const middleware1 = (req: RequestWithUsers, res: Response, next: NextFunction): void => {
  // Type-safe middleware
};
```

## Benefits of TypeScript Version

1. **Type Safety** - Catch errors at compile time
2. **Better IDE Support** - Enhanced autocomplete and IntelliSense
3. **Self-Documenting Code** - Types serve as documentation
4. **Refactoring Safety** - Easier to refactor with confidence
5. **Modern JavaScript Features** - ES6+ features with backward compatibility
6. **Interface Definitions** - Clear contracts for data structures

## Example API Calls

### Create Customer
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","active":true}'
```

### Get All Customers
```bash
curl http://localhost:3000/customers
```

### Get Customer by ID
```bash
curl http://localhost:3000/customers/1
```

### Update Customer
```bash
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"John Smith","email":"john.smith@example.com","active":true}'
```

### Delete Customer
```bash
curl -X DELETE http://localhost:3000/customers/1
```

## Configuration

Update the database configuration in both files:
```javascript
const dbConfig = {
  HOST: "localhost",
  USER: "your_username",
  PASSWORD: "your_password",
  DB: "your_database_name"
};
```

## Environment Variables

You can use environment variables for configuration:
```bash
PORT=3000
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
```

## Error Handling

Both versions include comprehensive error handling:
- Database connection errors
- Validation errors
- Not found errors (404)
- Server errors (500)

## Security Considerations

For production use, consider:
- Input validation and sanitization
- Authentication and authorization
- Rate limiting
- CORS configuration
- Environment-based configuration
- Connection pooling optimization
- SQL injection prevention (using parameterized queries)
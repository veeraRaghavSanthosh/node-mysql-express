# Node.js Express MySQL Library - Usage Guide

This guide provides comprehensive usage examples for the node-mysql-express library in both JavaScript and TypeScript, ensuring backward compatibility with existing implementations.

## 📋 Table of Contents

- [Quick Start](#quick-start)
- [JavaScript Usage](#javascript-usage)
- [TypeScript Usage](#typescript-usage)
- [API Reference](#api-reference)
- [Database Setup](#database-setup)
- [Middleware Examples](#middleware-examples)
- [Error Handling](#error-handling)
- [Backward Compatibility](#backward-compatibility)

## 🚀 Quick Start

### Installation

```bash
npm install express body-parser mysql

# For TypeScript support (optional)
npm install -D @types/express @types/mysql @types/node typescript ts-node
```

### Basic Setup

1. **Database Configuration**
```javascript
const dbConfig = {
  HOST: "localhost",
  USER: "your_username", 
  PASSWORD: "your_password",
  DB: "your_database"
};
```

2. **Run Examples**
```bash
# JavaScript
node examples/javascript-usage.js

# TypeScript  
npx ts-node examples/typescript-usage.ts
```

## 📝 JavaScript Usage

### Complete Example

```javascript
const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql");

const app = express();

// Database configuration
const dbConfig = {
  HOST: "localhost",
  USER: "your_username",
  PASSWORD: "your_password", 
  DB: "your_database"
};

// Create connection pool
const connection = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Customer Model
const Customer = function(customer) {
  this.email = customer.email;
  this.name = customer.name;
  this.active = customer.active;
};

Customer.create = (newCustomer, result) => {
  connection.query("INSERT INTO customers SET ?", newCustomer, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("created customer: ", { id: res.insertId, ...newCustomer });
    result(null, { id: res.insertId, ...newCustomer });
  });
};

Customer.findById = (customerId, result) => {
  connection.query(`SELECT * FROM customers WHERE id = ?`, [customerId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found customer: ", res[0]);
      result(null, res[0]);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

// Controller
const customerController = {
  create: (req, res) => {
    if (!req.body) {
      res.status(400).send({ message: "Content can not be empty!" });
      return;
    }

    const customer = new Customer({
      email: req.body.email,
      name: req.body.name,
      active: req.body.active
    });

    Customer.create(customer, (err, data) => {
      if (err) {
        res.status(500).send({
          message: err.message || "Some error occurred while creating the Customer."
        });
      } else {
        res.send(data);
      }
    });
  },

  findAll: (req, res) => {
    Customer.getAll((err, data) => {
      if (err) {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving customers."
        });
      } else {
        res.send(data);
      }
    });
  }
};

// Routes
app.post("/api/customers", customerController.create);
app.get("/api/customers", customerController.findAll);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

module.exports = app;
```

## 🎯 TypeScript Usage

### Complete Example with Type Safety

```typescript
import express, { Request, Response, NextFunction, Application } from 'express';
import bodyParser from 'body-parser';
import mysql, { Pool, MysqlError } from 'mysql';

// Type definitions
interface DatabaseConfig {
  HOST: string;
  USER: string;
  PASSWORD: string;
  DB: string;
}

interface CustomerData {
  id?: number;
  email: string;
  name: string;
  active: boolean;
}

interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

// Database configuration
const dbConfig: DatabaseConfig = {
  HOST: "localhost",
  USER: "your_username",
  PASSWORD: "your_password",
  DB: "your_database"
};

// Create connection pool
const connection: Pool = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

const app: Application = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Customer class with proper typing
class Customer {
  public email: string;
  public name: string;
  public active: boolean;
  public id?: number;

  constructor(customer: CustomerData) {
    this.email = customer.email;
    this.name = customer.name;
    this.active = customer.active;
    this.id = customer.id;
  }

  static create(newCustomer: Customer, result: (err: MysqlError | null, data?: CustomerData) => void): void {
    connection.query("INSERT INTO customers SET ?", newCustomer, (err: MysqlError | null, res: any) => {
      if (err) {
        console.log("error: ", err);
        result(err, undefined);
        return;
      }
      const createdCustomer: CustomerData = { id: res.insertId, ...newCustomer };
      console.log("created customer: ", createdCustomer);
      result(null, createdCustomer);
    });
  }

  static findById(customerId: number, result: (err: any, data?: CustomerData) => void): void {
    connection.query(`SELECT * FROM customers WHERE id = ?`, [customerId], (err: MysqlError | null, res: any[]) => {
      if (err) {
        console.log("error: ", err);
        result(err, undefined);
        return;
      }
      if (res.length) {
        console.log("found customer: ", res[0]);
        result(null, res[0] as CustomerData);
        return;
      }
      result({ kind: "not_found" }, undefined);
    });
  }
}

// Controller with proper typing
class CustomerController {
  static create(req: Request, res: Response): void {
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      } as ApiResponse);
      return;
    }

    const customerData: CustomerData = {
      email: req.body.email,
      name: req.body.name,
      active: req.body.active
    };

    const customer = new Customer(customerData);

    Customer.create(customer, (err: MysqlError | null, data?: CustomerData) => {
      if (err) {
        res.status(500).send({
          message: err.message || "Some error occurred while creating the Customer."
        } as ApiResponse);
      } else {
        res.send(data);
      }
    });
  }

  static findAll(req: Request, res: Response): void {
    Customer.getAll((err: MysqlError | null, data?: CustomerData[]) => {
      if (err) {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving customers."
        } as ApiResponse);
      } else {
        res.send(data);
      }
    });
  }
}

// Routes
app.post("/api/customers", CustomerController.create);
app.get("/api/customers", CustomerController.findAll);

// Start server
const PORT: number = parseInt(process.env.PORT || '3000');
app.listen(PORT, (): void => {
  console.log(`Server is running on port ${PORT}.`);
});

export default app;
```

## 🛠 API Reference

### Customer Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/api/customers` | Create customer | `{ name, email, active }` |
| GET | `/api/customers` | Get all customers | None |
| GET | `/api/customers/:id` | Get customer by ID | None |
| PUT | `/api/customers/:id` | Update customer | `{ name, email, active }` |
| DELETE | `/api/customers/:id` | Delete customer | None |

### Example Requests

```bash
# Create customer
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","active":true}'

# Get all customers  
curl http://localhost:3000/api/customers

# Get customer by ID
curl http://localhost:3000/api/customers/1

# Update customer
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"John Updated","email":"john.updated@example.com","active":false}'

# Delete customer
curl -X DELETE http://localhost:3000/api/customers/1
```

## 🗄 Database Setup

### MySQL Table Schema

```sql
CREATE DATABASE your_database;
USE your_database;

CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO customers (name, email, active) VALUES
('John Doe', 'john@example.com', true),
('Jane Smith', 'jane@example.com', true),
('Bob Johnson', 'bob@example.com', false);
```

## 🔧 Middleware Examples

### Authentication Middleware

```javascript
// JavaScript
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).send({ message: 'No token provided' });
  }
  
  // Validate token logic here
  // For example: JWT verification
  
  next();
};

// TypeScript  
const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const token: string | undefined = req.headers.authorization;
  
  if (!token) {
    res.status(401).send({ message: 'No token provided' });
    return;
  }
  
  // Validate token logic here
  // For example: JWT verification
  
  next();
};

// Apply to routes
app.use('/api/*', authMiddleware);
```

### Custom Data Middleware

```javascript
// JavaScript
const dataMiddleware = (req, res, next) => {
  const users = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" }
  ];
  req.users = users;
  next();
};

const responseMiddleware = (req, res) => {
  res.json({ users: req.users });
};

app.get("/api/users", dataMiddleware, responseMiddleware);

// TypeScript
interface AuthenticatedRequest extends Request {
  users?: any[];
}

const dataMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const users = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" }
  ];
  req.users = users;
  next();
};

const responseMiddleware = (req: AuthenticatedRequest, res: Response): void => {
  res.json({ users: req.users });
};

app.get("/api/users", dataMiddleware, responseMiddleware);
```

## ⚠️ Error Handling

### Global Error Handler

```javascript
// JavaScript
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).send({ message: 'Route not found' });
});

// TypeScript
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error(err.stack);
  res.status(500).send({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  } as ApiResponse);
});

app.use((req: Request, res: Response): void => {
  res.status(404).send({ message: 'Route not found' } as ApiResponse);
});
```

### Database Error Handling

```javascript
// JavaScript
Customer.create = (newCustomer, result) => {
  connection.query("INSERT INTO customers SET ?", newCustomer, (err, res) => {
    if (err) {
      console.log("Database error: ", err);
      
      // Handle specific MySQL errors
      if (err.code === 'ER_DUP_ENTRY') {
        result({ message: 'Email already exists', code: 'DUPLICATE_EMAIL' }, null);
        return;
      }
      
      result(err, null);
      return;
    }
    
    result(null, { id: res.insertId, ...newCustomer });
  });
};

// TypeScript
static create(newCustomer: Customer, result: (err: any, data?: CustomerData) => void): void {
  connection.query("INSERT INTO customers SET ?", newCustomer, (err: MysqlError | null, res: any) => {
    if (err) {
      console.log("Database error: ", err);
      
      // Handle specific MySQL errors with proper typing
      if (err.code === 'ER_DUP_ENTRY') {
        result({ message: 'Email already exists', code: 'DUPLICATE_EMAIL' }, undefined);
        return;
      }
      
      result(err, undefined);
      return;
    }
    
    const createdCustomer: CustomerData = { id: res.insertId, ...newCustomer };
    result(null, createdCustomer);
  });
}
```

## 🔄 Backward Compatibility

### Compatibility Matrix

| Feature | Node.js 8+ | Node.js 10+ | Node.js 12+ | Node.js 14+ | Node.js 16+ |
|---------|------------|-------------|-------------|-------------|-------------|
| JavaScript Example | ✅ | ✅ | ✅ | ✅ | ✅ |
| TypeScript Example | ✅ | ✅ | ✅ | ✅ | ✅ |
| MySQL 5.6+ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MySQL 8.0+ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Express 4.x | ✅ | ✅ | ✅ | ✅ | ✅ |

### Migration Guide

#### From Callback to Promise (Optional)

```javascript
// Original callback style (maintained for compatibility)
Customer.create(customer, (err, data) => {
  if (err) {
    res.status(500).send({ message: err.message });
  } else {
    res.send(data);
  }
});

// Optional: Promise wrapper for modern async/await
const createCustomerAsync = (customer) => {
  return new Promise((resolve, reject) => {
    Customer.create(customer, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
};

// Usage with async/await
app.post("/api/customers", async (req, res) => {
  try {
    const customer = new Customer(req.body);
    const result = await createCustomerAsync(customer);
    res.send(result);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});
```

#### Legacy Support

The library maintains full backward compatibility:

- ✅ Existing callback patterns work unchanged
- ✅ No breaking changes to API signatures  
- ✅ Original middleware patterns supported
- ✅ Compatible with existing Express.js applications
- ✅ MySQL connection patterns remain the same

### Version Requirements

```json
{
  "engines": {
    "node": ">=8.0.0"
  },
  "dependencies": {
    "express": "^4.17.1",
    "mysql": "^2.17.1", 
    "body-parser": "^1.19.0"
  }
}
```

## 🚀 Production Considerations

### Environment Variables

```javascript
// Use environment variables for sensitive data
const dbConfig = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "",
  DB: process.env.DB_NAME || "test"
};
```

### Security Enhancements

```javascript
// Add security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);
```

### Health Check Endpoint

```javascript
app.get('/health', (req, res) => {
  // Check database connection
  connection.query('SELECT 1', (err) => {
    if (err) {
      res.status(503).send({ status: 'unhealthy', database: 'disconnected' });
    } else {
      res.send({ status: 'healthy', database: 'connected' });
    }
  });
});
```

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MySQL Node.js Driver](https://github.com/mysqljs/mysql)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 📄 License

This project is licensed under the ISC License - see the original package.json for details.
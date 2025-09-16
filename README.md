# node-mysql-express

A Node.js library that integrates MySQL with Express.js for seamless database operations.

## Installation

```bash
npm install node-mysql-express
```

## Quick Start

### JavaScript Example

```javascript
const express = require('express');
const { MySQLExpress, createConnection } = require('node-mysql-express');

const app = express();
app.use(express.json());

// Database configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'testdb',
  connectionLimit: 10
};

// Create connection and middleware
const db = createConnection(dbConfig);
const mysqlExpress = new MySQLExpress(db);
app.use(mysqlExpress.middleware());

// Example route
app.get('/users', async (req, res) => {
  try {
    const users = await req.db.query('SELECT * FROM users');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

### TypeScript Example

```typescript
import express, { Request, Response } from 'express';
import { MySQLExpress, createConnection, MySQLConnection } from 'node-mysql-express';

interface User {
  id?: number;
  name: string;
  email: string;
  age?: number;
}

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      db: MySQLConnection;
    }
  }
}

const app: express.Application = express();
app.use(express.json());

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'testdb',
  connectionLimit: 10
};

const db: MySQLConnection = createConnection(dbConfig);
const mysqlExpress: MySQLExpress = new MySQLExpress(db);
app.use(mysqlExpress.middleware());

app.get('/users', async (req: Request, res: Response): Promise<void> => {
  const users: User[] = await req.db.query('SELECT * FROM users');
  res.json({ success: true, data: users });
});

app.listen(3000);
```

## Features

- 🚀 Simple Express.js integration
- 📦 Connection pooling
- 🔄 Transaction support
- 🛡️ TypeScript support
- ⚡ Promise-based API
- 🔧 Configurable connections
- 🎯 Request-scoped database access

## API Reference

### `createConnection(config)`
Creates a MySQL connection pool.

### `MySQLExpress(connection)`
Creates middleware for Express.js integration.

### `req.db.query(sql, params)`
Executes a SQL query with optional parameters.

### `req.db.beginTransaction()`
Starts a database transaction.

## Testing

```bash
npm test
npm run test:coverage
```

## License

MIT
/**
 * TypeScript Usage Example for node-mysql-express
 * 
 * This example demonstrates how to use the node-mysql-express library
 * with TypeScript for type-safe MySQL operations in Express.js.
 */

import express, { Request, Response, NextFunction } from 'express';
import { MySQLExpress, createConnection, MySQLConnection, QueryResult } from 'node-mysql-express';

// Type definitions
interface User {
  id?: number;
  name: string;
  email: string;
  age?: number;
  created_at?: Date;
  updated_at?: Date;
}

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  connectionLimit: number;
  acquireTimeout: number;
  timeout: number;
  reconnect: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Extend Express Request interface to include database connection
declare global {
  namespace Express {
    interface Request {
      db: MySQLConnection;
    }
  }
}

// Initialize Express app
const app: express.Application = express();
app.use(express.json());

// MySQL connection configuration
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'testdb',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create MySQL connection
const db: MySQLConnection = createConnection(dbConfig);

// Initialize MySQLExpress middleware
const mysqlExpress: MySQLExpress = new MySQLExpress(db);

// Use the middleware
app.use(mysqlExpress.middleware());

// Utility function for handling async routes
const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// GET all users with pagination
app.get('/users', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const page: number = parseInt(req.query.page as string) || 1;
  const limit: number = parseInt(req.query.limit as string) || 10;
  const offset: number = (page - 1) * limit;

  const users: User[] = await req.db.query(
    'SELECT * FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );

  const totalCount: QueryResult = await req.db.query('SELECT COUNT(*) as count FROM users');
  const total: number = totalCount[0].count;

  const response: ApiResponse<{ users: User[]; pagination: any }> = {
    success: true,
    data: {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  };

  res.json(response);
}));

// GET user by ID
app.get('/users/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id: number = parseInt(req.params.id);
  
  if (isNaN(id)) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid user ID'
    };
    res.status(400).json(response);
    return;
  }

  const users: User[] = await req.db.query('SELECT * FROM users WHERE id = ?', [id]);
  
  if (users.length === 0) {
    const response: ApiResponse = {
      success: false,
      message: 'User not found'
    };
    res.status(404).json(response);
    return;
  }
  
  const response: ApiResponse<User> = {
    success: true,
    data: users[0]
  };
  
  res.json(response);
}));

// POST create new user
app.post('/users', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { name, email, age }: Partial<User> = req.body;
  
  // Validate input
  if (!name || !email) {
    const response: ApiResponse = {
      success: false,
      error: 'Name and email are required'
    };
    res.status(400).json(response);
    return;
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid email format'
    };
    res.status(400).json(response);
    return;
  }

  const result: QueryResult = await req.db.query(
    'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
    [name, email, age || null]
  );
  
  const newUser: User = {
    id: result.insertId,
    name,
    email,
    age: age || undefined
  };

  const response: ApiResponse<User> = {
    success: true,
    message: 'User created successfully',
    data: newUser
  };
  
  res.status(201).json(response);
}));

// PUT update user
app.put('/users/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id: number = parseInt(req.params.id);
  const { name, email, age }: Partial<User> = req.body;
  
  if (isNaN(id)) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid user ID'
    };
    res.status(400).json(response);
    return;
  }

  const result: QueryResult = await req.db.query(
    'UPDATE users SET name = ?, email = ?, age = ?, updated_at = NOW() WHERE id = ?',
    [name, email, age, id]
  );
  
  if (result.affectedRows === 0) {
    const response: ApiResponse = {
      success: false,
      message: 'User not found'
    };
    res.status(404).json(response);
    return;
  }
  
  const updatedUser: User = { id, name, email, age };
  const response: ApiResponse<User> = {
    success: true,
    message: 'User updated successfully',
    data: updatedUser
  };
  
  res.json(response);
}));

// DELETE user
app.delete('/users/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const id: number = parseInt(req.params.id);
  
  if (isNaN(id)) {
    const response: ApiResponse = {
      success: false,
      error: 'Invalid user ID'
    };
    res.status(400).json(response);
    return;
  }

  const result: QueryResult = await req.db.query('DELETE FROM users WHERE id = ?', [id]);
  
  if (result.affectedRows === 0) {
    const response: ApiResponse = {
      success: false,
      message: 'User not found'
    };
    res.status(404).json(response);
    return;
  }
  
  const response: ApiResponse = {
    success: true,
    message: 'User deleted successfully'
  };
  
  res.json(response);
}));

// Transaction example with batch operations
app.post('/users/batch', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { users }: { users: User[] } = req.body;
  
  if (!Array.isArray(users) || users.length === 0) {
    const response: ApiResponse = {
      success: false,
      error: 'Users array is required and cannot be empty'
    };
    res.status(400).json(response);
    return;
  }

  const transaction = await req.db.beginTransaction();
  
  try {
    const createdUsers: User[] = [];
    
    for (const user of users) {
      if (!user.name || !user.email) {
        throw new Error(`Invalid user data: name and email are required`);
      }
      
      const result: QueryResult = await transaction.query(
        'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
        [user.name, user.email, user.age || null]
      );
      
      createdUsers.push({
        id: result.insertId,
        name: user.name,
        email: user.email,
        age: user.age
      });
    }
    
    await transaction.commit();
    
    const response: ApiResponse<User[]> = {
      success: true,
      message: `${createdUsers.length} users created successfully`,
      data: createdUsers
    };
    
    res.status(201).json(response);
  } catch (error) {
    await transaction.rollback();
    
    const response: ApiResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Transaction failed'
    };
    
    res.status(500).json(response);
  }
}));

// Search users with filtering
app.get('/users/search', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const { q, minAge, maxAge }: { q?: string; minAge?: string; maxAge?: string } = req.query as any;
  
  let query = 'SELECT * FROM users WHERE 1=1';
  const params: any[] = [];
  
  if (q) {
    query += ' AND (name LIKE ? OR email LIKE ?)';
    params.push(`%${q}%`, `%${q}%`);
  }
  
  if (minAge) {
    query += ' AND age >= ?';
    params.push(parseInt(minAge));
  }
  
  if (maxAge) {
    query += ' AND age <= ?';
    params.push(parseInt(maxAge));
  }
  
  query += ' ORDER BY created_at DESC';
  
  const users: User[] = await req.db.query(query, params);
  
  const response: ApiResponse<User[]> = {
    success: true,
    data: users
  };
  
  res.json(response);
}));

// Health check endpoint
app.get('/health', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  await req.db.query('SELECT 1');
  
  const response: ApiResponse = {
    success: true,
    message: 'Database connection is healthy'
  };
  
  res.json(response);
}));

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
  console.error('Unhandled error:', err);
  
  const response: ApiResponse = {
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  };
  
  res.status(500).json(response);
});

// 404 handler
app.use('*', (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    error: 'Route not found'
  };
  
  res.status(404).json(response);
});

// Start server
const PORT: number = parseInt(process.env.PORT || '3000');

const server = app.listen(PORT, (): void => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Database connected to ${dbConfig.host}:${dbConfig.database}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  
  server.close(async () => {
    console.log('HTTP server closed');
    
    try {
      await db.end();
      console.log('Database connections closed');
    } catch (error) {
      console.error('Error closing database connections:', error);
    }
    
    process.exit(0);
  });
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
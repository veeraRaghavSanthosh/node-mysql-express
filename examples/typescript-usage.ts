/**
 * TypeScript Usage Example for node-mysql-express
 * 
 * This example demonstrates how to use the library to create a type-safe RESTful API
 * with MySQL database integration using Express.js and TypeScript
 */

import express, { Request, Response, NextFunction } from 'express';
import mysql, { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';

const app = express();
const PORT = process.env.PORT || 3000;

// Type definitions
interface Customer extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: Date;
  updated_at?: Date;
}

interface CustomerInput {
  name: string;
  email: string;
  phone?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  error?: string;
}

interface DatabaseConfig {
  host: string;
  user: string;
  password: string;
  database: string;
  waitForConnections: boolean;
  connectionLimit: number;
  queueLimit: number;
}

// Database configuration
const dbConfig: DatabaseConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'testdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create MySQL connection pool
const pool: Pool = mysql.createPool(dbConfig);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
const handleDatabaseError = (error: any, res: Response): void => {
  console.error('Database error:', error);
  res.status(500).json({
    success: false,
    error: 'Database operation failed',
    message: error.message
  } as ApiResponse);
};

// Validation middleware
const validateCustomerInput = (req: Request, res: Response, next: NextFunction): void => {
  const { name, email } = req.body as CustomerInput;
  
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: 'Name is required and must be a non-empty string'
    } as ApiResponse);
    return;
  }
  
  if (!email || typeof email !== 'string' || !isValidEmail(email)) {
    res.status(400).json({
      success: false,
      message: 'Valid email is required'
    } as ApiResponse);
    return;
  }
  
  next();
};

// Utility functions
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Routes

// GET all customers
app.get('/api/customers', async (req: Request, res: Response): Promise<void> => {
  try {
    const query = 'SELECT * FROM customers ORDER BY created_at DESC';
    const [rows] = await pool.execute<Customer[]>(query);
    
    res.json({
      success: true,
      data: rows,
      count: rows.length
    } as ApiResponse<Customer[]>);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// GET customer by ID
app.get('/api/customers/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const customerId = parseInt(req.params.id, 10);
    
    if (isNaN(customerId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid customer ID'
      } as ApiResponse);
      return;
    }
    
    const query = 'SELECT * FROM customers WHERE id = ?';
    const [rows] = await pool.execute<Customer[]>(query, [customerId]);
    
    if (rows.length === 0) {
      res.status(404).json({
        success: false,
        message: 'Customer not found'
      } as ApiResponse);
      return;
    }
    
    res.json({
      success: true,
      data: rows[0]
    } as ApiResponse<Customer>);
  } catch (error) {
    handleDatabaseError(error, res);
  }
});

// POST create new customer
app.post('/api/customers', validateCustomerInput, async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone } = req.body as CustomerInput;
    
    const query = 'INSERT INTO customers (name, email, phone, created_at) VALUES (?, ?, ?, NOW())';
    const [result] = await pool.execute<ResultSetHeader>(query, [name, email, phone || null]);
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: {
        id: result.insertId,
        name,
        email,
        phone
      }
    } as ApiResponse<Partial<Customer>>);
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({
        success: false,
        message: 'Email already exists'
      } as ApiResponse);
      return;
    }
    handleDatabaseError(error, res);
  }
});

// Health check endpoint
app.get('/health', async (req: Request, res: Response): Promise<void> => {
  try {
    await pool.execute('SELECT 1');
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
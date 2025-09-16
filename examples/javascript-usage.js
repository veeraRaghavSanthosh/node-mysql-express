/**
 * JavaScript Usage Example for node-mysql-express
 * 
 * This example demonstrates how to use the library to create a RESTful API
 * with MySQL database integration using Express.js
 */

const express = require('express');
const mysql = require('mysql2');

const app = express();
const PORT = process.env.PORT || 3000;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'testdb',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create MySQL connection pool
const pool = mysql.createPool(dbConfig);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Error handling middleware
const handleDatabaseError = (error, res) => {
  console.error('Database error:', error);
  res.status(500).json({
    error: 'Database operation failed',
    message: error.message
  });
};

// Routes

// GET all customers
app.get('/api/customers', (req, res) => {
  const query = 'SELECT * FROM customers ORDER BY created_at DESC';
  
  pool.query(query, (error, results) => {
    if (error) {
      return handleDatabaseError(error, res);
    }
    
    res.json({
      success: true,
      data: results,
      count: results.length
    });
  });
});

// GET customer by ID
app.get('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const query = 'SELECT * FROM customers WHERE id = ?';
  
  pool.query(query, [customerId], (error, results) => {
    if (error) {
      return handleDatabaseError(error, res);
    }
    
    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      data: results[0]
    });
  });
});

// POST create new customer
app.post('/api/customers', (req, res) => {
  const { name, email, phone } = req.body;
  
  // Basic validation
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and email are required'
    });
  }
  
  const query = 'INSERT INTO customers (name, email, phone, created_at) VALUES (?, ?, ?, NOW())';
  
  pool.query(query, [name, email, phone], (error, results) => {
    if (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }
      return handleDatabaseError(error, res);
    }
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: {
        id: results.insertId,
        name,
        email,
        phone
      }
    });
  });
});

// PUT update customer
app.put('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const { name, email, phone } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and email are required'
    });
  }
  
  const query = 'UPDATE customers SET name = ?, email = ?, phone = ?, updated_at = NOW() WHERE id = ?';
  
  pool.query(query, [name, email, phone, customerId], (error, results) => {
    if (error) {
      return handleDatabaseError(error, res);
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: { id: customerId, name, email, phone }
    });
  });
});

// DELETE customer
app.delete('/api/customers/:id', (req, res) => {
  const customerId = req.params.id;
  const query = 'DELETE FROM customers WHERE id = ?';
  
  pool.query(query, [customerId], (error, results) => {
    if (error) {
      return handleDatabaseError(error, res);
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  pool.query('SELECT 1', (error) => {
    if (error) {
      return res.status(503).json({
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message
      });
    }
    
    res.json({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoints: http://localhost:${PORT}/api/customers`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    pool.end(() => {
      console.log('Database connections closed');
      process.exit(0);
    });
  });
});

module.exports = app;
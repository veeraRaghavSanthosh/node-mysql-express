const express = require('express');
const mysql = require('mysql2/promise');
const Joi = require('joi');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'orders_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Order validation schema
const orderSchema = Joi.object({
  customer_id: Joi.number().integer().positive().required(),
  product_id: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().positive().required(),
  total_price: Joi.number().positive().precision(2).required(),
  order_date: Joi.date().optional(),
  status: Joi.string().valid('pending', 'confirmed', 'shipped', 'delivered', 'cancelled').default('pending')
});

// Initialize database and create orders table if it doesn't exist
async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    
    // Create database if it doesn't exist
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    await connection.query(`USE ${dbConfig.database}`);
    
    // Create orders table if it doesn't exist
    const createOrdersTable = `
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        product_id INT NOT NULL,
        quantity INT NOT NULL,
        total_price DECIMAL(10, 2) NOT NULL,
        order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_customer_id (customer_id),
        INDEX idx_product_id (product_id),
        INDEX idx_status (status)
      )
    `;
    
    await connection.query(createOrdersTable);
    console.log('Database initialized successfully');
    connection.release();
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// POST /v1/orders endpoint
app.post('/v1/orders', async (req, res) => {
  try {
    // Validate request payload
    const { error, value } = orderSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const { customer_id, product_id, quantity, total_price, order_date, status } = value;

    // Insert order into database
    const insertQuery = `
      INSERT INTO orders (customer_id, product_id, quantity, total_price, order_date, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await pool.execute(insertQuery, [
      customer_id,
      product_id,
      quantity,
      total_price,
      order_date || new Date(),
      status
    ]);

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order_id: result.insertId,
        customer_id,
        product_id,
        quantity,
        total_price,
        status,
        created_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    
    // Handle specific database errors
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Duplicate entry error',
        error: 'Order already exists'
      });
    }
    
    if (error.code === 'ER_NO_REFERENCED_ROW_2') {
      return res.status(400).json({
        success: false,
        message: 'Foreign key constraint error',
        error: 'Referenced customer or product does not exist'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// GET /v1/orders endpoint (bonus - to retrieve orders)
app.get('/v1/orders', async (req, res) => {
  try {
    const { customer_id, status, limit = 10, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM orders';
    const params = [];
    const conditions = [];

    if (customer_id) {
      conditions.push('customer_id = ?');
      params.push(customer_id);
    }

    if (status) {
      conditions.push('status = ?');
      params.push(status);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [orders] = await pool.execute(query, params);

    res.json({
      success: true,
      data: orders,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        count: orders.length
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1');
    res.json({
      success: true,
      message: 'Server and database are healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Database connection failed',
      timestamp: new Date().toISOString()
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
async function startServer() {
  await initializeDatabase();
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Orders endpoint: http://localhost:${PORT}/v1/orders`);
  });
}

startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

module.exports = app;
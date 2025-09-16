const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise'); // Using promise-based mysql2
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'testdb',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Successfully connected to the database.');
    connection.release();
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    process.exit(1);
  }
}

// Initialize database connection
testConnection();

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the application.' });
});

// Customer routes (example)
app.get('/api/customers', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM customers');
    res.json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving customers',
      error: error.message
    });
  }
});

app.get('/api/customers/:id', async (req, res) => {
  const customerId = req.params.id;
  
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM customers WHERE id = ?', 
      [customerId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Customer with id ${customerId} not found`
      });
    }
    
    res.json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving customer',
      error: error.message
    });
  }
});

app.post('/api/customers', async (req, res) => {
  const { name, email, phone } = req.body;
  
  // Validation
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and email are required'
    });
  }
  
  try {
    const [result] = await pool.execute(
      'INSERT INTO customers (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone]
    );
    
    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: {
        id: result.insertId,
        name,
        email,
        phone
      }
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    
    // Handle duplicate entry error
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        success: false,
        message: 'Customer with this email already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error creating customer',
      error: error.message
    });
  }
});

app.put('/api/customers/:id', async (req, res) => {
  const customerId = req.params.id;
  const { name, email, phone } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and email are required'
    });
  }
  
  try {
    const [result] = await pool.execute(
      'UPDATE customers SET name = ?, email = ?, phone = ? WHERE id = ?',
      [name, email, phone, customerId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Customer with id ${customerId} not found`
      });
    }
    
    res.json({
      success: true,
      message: 'Customer updated successfully',
      data: {
        id: customerId,
        name,
        email,
        phone
      }
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating customer',
      error: error.message
    });
  }
});

app.delete('/api/customers/:id', async (req, res) => {
  const customerId = req.params.id;
  
  try {
    const [result] = await pool.execute(
      'DELETE FROM customers WHERE id = ?',
      [customerId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: `Customer with id ${customerId} not found`
      });
    }
    
    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting customer',
      error: error.message
    });
  }
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  try {
    await pool.end();
    console.log('Database connection pool closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
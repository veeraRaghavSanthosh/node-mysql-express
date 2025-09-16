/**
 * JavaScript Usage Example for node-mysql-express
 * 
 * This example demonstrates how to use the node-mysql-express library
 * to create a simple Express.js application with MySQL integration.
 */

const express = require('express');
const { MySQLExpress, createConnection } = require('node-mysql-express');

// Initialize Express app
const app = express();
app.use(express.json());

// MySQL connection configuration
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'testdb',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

// Create MySQL connection
const db = createConnection(dbConfig);

// Initialize MySQLExpress middleware
const mysqlExpress = new MySQLExpress(db);

// Use the middleware
app.use(mysqlExpress.middleware());

// Example routes using the MySQL integration

// GET all users
app.get('/users', async (req, res) => {
  try {
    const users = await req.db.query('SELECT * FROM users');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET user by ID
app.get('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await req.db.query('SELECT * FROM users WHERE id = ?', [id]);
    
    if (user.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, data: user[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST create new user
app.post('/users', async (req, res) => {
  try {
    const { name, email, age } = req.body;
    
    // Validate input
    if (!name || !email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name and email are required' 
      });
    }
    
    const result = await req.db.query(
      'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
      [name, email, age || null]
    );
    
    res.status(201).json({ 
      success: true, 
      message: 'User created successfully',
      data: { id: result.insertId, name, email, age }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT update user
app.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, age } = req.body;
    
    const result = await req.db.query(
      'UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?',
      [name, email, age, id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ 
      success: true, 
      message: 'User updated successfully',
      data: { id, name, email, age }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE user
app.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await req.db.query('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Transaction example
app.post('/users/batch', async (req, res) => {
  const transaction = await req.db.beginTransaction();
  
  try {
    const { users } = req.body;
    
    for (const user of users) {
      await transaction.query(
        'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
        [user.name, user.email, user.age]
      );
    }
    
    await transaction.commit();
    res.json({ success: true, message: 'Batch users created successfully' });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await req.db.query('SELECT 1');
    res.json({ success: true, message: 'Database connection is healthy' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Database connection failed' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Database connected to ${dbConfig.host}:${dbConfig.database}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await db.end();
  process.exit(0);
});

module.exports = app;
const express = require('express');
const mysql = require('mysql2/promise');

// JavaScript Example for node-mysql-express
// This example demonstrates how to use the library to connect MySQL with Express

class DatabaseService {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      this.connection = await mysql.createConnection({
        host: 'localhost',
        user: 'your_username',
        password: 'your_password',
        database: 'your_database'
      });
      console.log('Connected to MySQL database');
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }
  }

  async getUsers() {
    if (!this.connection) {
      throw new Error('Database not connected');
    }
    
    const [rows] = await this.connection.execute('SELECT * FROM users');
    return rows;
  }

  async createUser(name, email) {
    if (!this.connection) {
      throw new Error('Database not connected');
    }
    
    const [result] = await this.connection.execute(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    return result.insertId;
  }

  async getUserById(id) {
    if (!this.connection) {
      throw new Error('Database not connected');
    }
    
    const [rows] = await this.connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] : null;
  }

  async updateUser(id, name, email) {
    if (!this.connection) {
      throw new Error('Database not connected');
    }
    
    const [result] = await this.connection.execute(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, id]
    );
    return result.affectedRows > 0;
  }

  async deleteUser(id) {
    if (!this.connection) {
      throw new Error('Database not connected');
    }
    
    const [result] = await this.connection.execute(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  }

  async close() {
    if (this.connection) {
      await this.connection.end();
      console.log('Database connection closed');
    }
  }
}

// Express application setup
const app = express();
const port = process.env.PORT || 3000;
const db = new DatabaseService();

app.use(express.json());

// Middleware for error handling
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Initialize database connection
app.listen(port, async () => {
  try {
    await db.connect();
    console.log(`Server running on http://localhost:${port}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
});

// Routes
app.get('/users', asyncHandler(async (req, res) => {
  const users = await db.getUsers();
  res.json(users);
}));

app.post('/users', asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  const userId = await db.createUser(name, email);
  res.status(201).json({ id: userId, name, email });
}));

app.get('/users/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  const user = await db.getUserById(id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
}));

app.put('/users/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  const { name, email } = req.body;
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }
  
  const updated = await db.updateUser(id, name, email);
  
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ id, name, email });
}));

app.delete('/users/:id', asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }
  
  const deleted = await db.deleteUser(id);
  
  if (!deleted) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.status(204).send();
}));

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

module.exports = app;
import express from 'express';
import mysql from 'mysql2/promise';

// TypeScript Example for node-mysql-express
// This example demonstrates how to use the library to connect MySQL with Express

interface User {
  id: number;
  name: string;
  email: string;
}

class DatabaseService {
  private connection: mysql.Connection | null = null;

  async connect(): Promise<void> {
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

  async getUsers(): Promise<User[]> {
    if (!this.connection) {
      throw new Error('Database not connected');
    }
    
    const [rows] = await this.connection.execute('SELECT * FROM users');
    return rows as User[];
  }

  async createUser(name: string, email: string): Promise<number> {
    if (!this.connection) {
      throw new Error('Database not connected');
    }
    
    const [result] = await this.connection.execute(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [name, email]
    );
    return (result as mysql.ResultSetHeader).insertId;
  }

  async getUserById(id: number): Promise<User | null> {
    if (!this.connection) {
      throw new Error('Database not connected');
    }
    
    const [rows] = await this.connection.execute(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
    const users = rows as User[];
    return users.length > 0 ? users[0] : null;
  }

  async close(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      console.log('Database connection closed');
    }
  }
}

// Express application setup
const app = express();
const port = 3000;
const db = new DatabaseService();

app.use(express.json());

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
app.get('/users', async (req, res) => {
  try {
    const users = await db.getUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }
    
    const userId = await db.createUser(name, email);
    res.status(201).json({ id: userId, name, email });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await db.getUserById(id);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...');
  await db.close();
  process.exit(0);
});

export default app;
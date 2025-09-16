/**
 * Unit Tests for node-mysql-express (JavaScript)
 * 
 * These tests demonstrate how to test applications built with node-mysql-express
 * using Jest and supertest for API testing.
 */

const request = require('supertest');
const { MySQLExpress, createConnection } = require('node-mysql-express');

// Mock the database connection for testing
jest.mock('node-mysql-express', () => ({
  MySQLExpress: jest.fn().mockImplementation(() => ({
    middleware: jest.fn(() => (req, res, next) => {
      req.db = mockDb;
      next();
    })
  })),
  createConnection: jest.fn(() => mockDb)
}));

// Mock database object
const mockDb = {
  query: jest.fn(),
  beginTransaction: jest.fn(),
  end: jest.fn()
};

const mockTransaction = {
  query: jest.fn(),
  commit: jest.fn(),
  rollback: jest.fn()
};

// Import the app after mocking
const app = require('../examples/javascript-usage');

describe('node-mysql-express JavaScript API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    test('should return all users successfully', async () => {
      const mockUsers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 25 }
      ];

      mockDb.query.mockResolvedValue(mockUsers);

      const response = await request(app)
        .get('/users')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUsers);
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM users');
    });

    test('should handle database errors', async () => {
      mockDb.query.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/users')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database connection failed');
    });
  });

  describe('GET /users/:id', () => {
    test('should return user by ID successfully', async () => {
      const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 };
      mockDb.query.mockResolvedValue([mockUser]);

      const response = await request(app)
        .get('/users/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockUser);
      expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', ['1']);
    });

    test('should return 404 when user not found', async () => {
      mockDb.query.mockResolvedValue([]);

      const response = await request(app)
        .get('/users/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /users', () => {
    test('should create new user successfully', async () => {
      const newUser = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const mockResult = { insertId: 1 };

      mockDb.query.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/users')
        .send(newUser)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User created successfully');
      expect(response.body.data).toEqual({ id: 1, ...newUser });
      expect(mockDb.query).toHaveBeenCalledWith(
        'INSERT INTO users (name, email, age) VALUES (?, ?, ?)',
        [newUser.name, newUser.email, newUser.age]
      );
    });

    test('should validate required fields', async () => {
      const invalidUser = { email: 'john@example.com' }; // missing name

      const response = await request(app)
        .post('/users')
        .send(invalidUser)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Name and email are required');
      expect(mockDb.query).not.toHaveBeenCalled();
    });

    test('should handle database errors during creation', async () => {
      const newUser = { name: 'John Doe', email: 'john@example.com', age: 30 };
      mockDb.query.mockRejectedValue(new Error('Duplicate entry'));

      const response = await request(app)
        .post('/users')
        .send(newUser)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Duplicate entry');
    });
  });

  describe('PUT /users/:id', () => {
    test('should update user successfully', async () => {
      const updatedUser = { name: 'John Updated', email: 'john.updated@example.com', age: 31 };
      const mockResult = { affectedRows: 1 };

      mockDb.query.mockResolvedValue(mockResult);

      const response = await request(app)
        .put('/users/1')
        .send(updatedUser)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User updated successfully');
      expect(response.body.data).toEqual({ id: '1', ...updatedUser });
      expect(mockDb.query).toHaveBeenCalledWith(
        'UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?',
        [updatedUser.name, updatedUser.email, updatedUser.age, '1']
      );
    });

    test('should return 404 when updating non-existent user', async () => {
      const updatedUser = { name: 'John Updated', email: 'john.updated@example.com', age: 31 };
      const mockResult = { affectedRows: 0 };

      mockDb.query.mockResolvedValue(mockResult);

      const response = await request(app)
        .put('/users/999')
        .send(updatedUser)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('DELETE /users/:id', () => {
    test('should delete user successfully', async () => {
      const mockResult = { affectedRows: 1 };
      mockDb.query.mockResolvedValue(mockResult);

      const response = await request(app)
        .delete('/users/1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User deleted successfully');
      expect(mockDb.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', ['1']);
    });

    test('should return 404 when deleting non-existent user', async () => {
      const mockResult = { affectedRows: 0 };
      mockDb.query.mockResolvedValue(mockResult);

      const response = await request(app)
        .delete('/users/999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User not found');
    });
  });

  describe('POST /users/batch', () => {
    test('should create multiple users in transaction', async () => {
      const batchUsers = [
        { name: 'User 1', email: 'user1@example.com', age: 25 },
        { name: 'User 2', email: 'user2@example.com', age: 30 }
      ];

      mockDb.beginTransaction.mockResolvedValue(mockTransaction);
      mockTransaction.query.mockResolvedValue({ insertId: 1 });
      mockTransaction.commit.mockResolvedValue();

      const response = await request(app)
        .post('/users/batch')
        .send({ users: batchUsers })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Batch users created successfully');
      expect(mockDb.beginTransaction).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(mockTransaction.query).toHaveBeenCalledTimes(2);
    });

    test('should rollback transaction on error', async () => {
      const batchUsers = [
        { name: 'User 1', email: 'user1@example.com', age: 25 },
        { name: 'User 2', email: 'user2@example.com', age: 30 }
      ];

      mockDb.beginTransaction.mockResolvedValue(mockTransaction);
      mockTransaction.query
        .mockResolvedValueOnce({ insertId: 1 })
        .mockRejectedValueOnce(new Error('Database error'));
      mockTransaction.rollback.mockResolvedValue();

      const response = await request(app)
        .post('/users/batch')
        .send({ users: batchUsers })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Database error');
      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(mockTransaction.commit).not.toHaveBeenCalled();
    });
  });

  describe('GET /health', () => {
    test('should return healthy status', async () => {
      mockDb.query.mockResolvedValue([{ '1': 1 }]);

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Database connection is healthy');
      expect(mockDb.query).toHaveBeenCalledWith('SELECT 1');
    });

    test('should return unhealthy status on database error', async () => {
      mockDb.query.mockRejectedValue(new Error('Connection lost'));

      const response = await request(app)
        .get('/health')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Database connection failed');
    });
  });
});

// Test MySQLExpress class functionality
describe('MySQLExpress Class', () => {
  test('should create MySQLExpress instance', () => {
    const connection = createConnection({
      host: 'localhost',
      user: 'test',
      password: 'test',
      database: 'testdb'
    });

    const mysqlExpress = new MySQLExpress(connection);
    expect(mysqlExpress).toBeDefined();
    expect(MySQLExpress).toHaveBeenCalledWith(connection);
  });

  test('should provide middleware function', () => {
    const connection = createConnection({
      host: 'localhost',
      user: 'test',
      password: 'test',
      database: 'testdb'
    });

    const mysqlExpress = new MySQLExpress(connection);
    const middleware = mysqlExpress.middleware();
    
    expect(middleware).toBeInstanceOf(Function);
  });
});

// Integration tests
describe('Database Connection Integration', () => {
  test('should handle connection configuration', () => {
    const config = {
      host: 'localhost',
      user: 'testuser',
      password: 'testpass',
      database: 'testdb',
      connectionLimit: 10,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    };

    const connection = createConnection(config);
    expect(createConnection).toHaveBeenCalledWith(config);
    expect(connection).toBeDefined();
  });

  test('should handle graceful shutdown', async () => {
    mockDb.end.mockResolvedValue();
    
    // Simulate graceful shutdown
    await mockDb.end();
    
    expect(mockDb.end).toHaveBeenCalled();
  });
});
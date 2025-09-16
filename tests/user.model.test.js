// Mock the database connection
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

const User = require('../app/models/user.model.js');
const sql = require('../app/models/db.js');

describe('User Model Null Validation Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User constructor', () => {
    test('should throw error for null user data', () => {
      expect(() => {
        new User(null);
      }).toThrow('User data cannot be null or undefined');
    });

    test('should throw error for undefined user data', () => {
      expect(() => {
        new User(undefined);
      }).toThrow('User data cannot be null or undefined');
    });

    test('should create user with valid data', () => {
      const userData = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const user = new User(userData);
      
      expect(user.name).toBe('John Doe');
      expect(user.email).toBe('john@example.com');
      expect(user.age).toBe(30);
    });
  });

  describe('User.create method', () => {
    test('should handle null user data', () => {
      const mockResult = jest.fn();
      
      User.create(null, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User data cannot be null' }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    test('should create user with valid data', () => {
      const userData = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const mockResult = jest.fn();
      
      sql.query.mockImplementation((query, data, callback) => {
        callback(null, { insertId: 1 });
      });
      
      User.create(userData, mockResult);
      
      expect(sql.query).toHaveBeenCalledWith(
        'INSERT INTO users SET ?',
        userData,
        expect.any(Function)
      );
      expect(mockResult).toHaveBeenCalledWith(null, { id: 1, ...userData });
    });

    test('should handle database error', () => {
      const userData = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const mockResult = jest.fn();
      const dbError = new Error('Database connection failed');
      
      sql.query.mockImplementation((query, data, callback) => {
        callback(dbError, null);
      });
      
      User.create(userData, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(dbError, null);
    });
  });

  describe('User.findById method', () => {
    test('should handle null user ID', () => {
      const mockResult = jest.fn();
      
      User.findById(null, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User ID cannot be null or undefined' }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    test('should handle undefined user ID', () => {
      const mockResult = jest.fn();
      
      User.findById(undefined, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User ID cannot be null or undefined' }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    test('should handle string "null" user ID', () => {
      const mockResult = jest.fn();
      
      User.findById('null', mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User ID cannot be null or undefined' }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    test('should handle string "undefined" user ID', () => {
      const mockResult = jest.fn();
      
      User.findById('undefined', mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User ID cannot be null or undefined' }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    test('should find user with valid ID', () => {
      const mockResult = jest.fn();
      const userData = { id: 1, name: 'John Doe', email: 'john@example.com' };
      
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, [userData]);
      });
      
      User.findById(1, mockResult);
      
      expect(sql.query).toHaveBeenCalledWith(
        'SELECT * FROM users WHERE id = ?',
        [1],
        expect.any(Function)
      );
      expect(mockResult).toHaveBeenCalledWith(null, userData);
    });

    test('should handle user not found', () => {
      const mockResult = jest.fn();
      
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });
      
      User.findById(999, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith({ kind: 'not_found' }, null);
    });
  });

  describe('User.updateById method', () => {
    test('should handle null user ID', () => {
      const mockResult = jest.fn();
      const userData = { name: 'John Doe', email: 'john@example.com' };
      
      User.updateById(null, userData, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User ID cannot be null or undefined' }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    test('should handle null user data', () => {
      const mockResult = jest.fn();
      
      User.updateById(1, null, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User data cannot be null' }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    test('should handle string "null" user ID', () => {
      const mockResult = jest.fn();
      const userData = { name: 'John Doe', email: 'john@example.com' };
      
      User.updateById('null', userData, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User ID cannot be null or undefined' }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    test('should update user with valid data', () => {
      const mockResult = jest.fn();
      const userData = { name: 'John Updated', email: 'john.updated@example.com', age: 31 };
      
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });
      
      User.updateById(1, userData, mockResult);
      
      expect(sql.query).toHaveBeenCalledWith(
        'UPDATE users SET email = ?, name = ?, age = ? WHERE id = ?',
        [userData.email, userData.name, userData.age, 1],
        expect.any(Function)
      );
      expect(mockResult).toHaveBeenCalledWith(null, { id: 1, ...userData });
    });

    test('should handle user not found for update', () => {
      const mockResult = jest.fn();
      const userData = { name: 'John Updated', email: 'john.updated@example.com' };
      
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 0 });
      });
      
      User.updateById(999, userData, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith({ kind: 'not_found' }, null);
    });
  });

  describe('User.remove method', () => {
    test('should handle null user ID', () => {
      const mockResult = jest.fn();
      
      User.remove(null, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User ID cannot be null or undefined' }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    test('should handle string "null" user ID', () => {
      const mockResult = jest.fn();
      
      User.remove('null', mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User ID cannot be null or undefined' }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    test('should delete user with valid ID', () => {
      const mockResult = jest.fn();
      
      sql.query.mockImplementation((query, id, callback) => {
        callback(null, { affectedRows: 1 });
      });
      
      User.remove(1, mockResult);
      
      expect(sql.query).toHaveBeenCalledWith(
        'DELETE FROM users WHERE id = ?',
        1,
        expect.any(Function)
      );
      expect(mockResult).toHaveBeenCalledWith(null, { affectedRows: 1 });
    });

    test('should handle user not found for deletion', () => {
      const mockResult = jest.fn();
      
      sql.query.mockImplementation((query, id, callback) => {
        callback(null, { affectedRows: 0 });
      });
      
      User.remove(999, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith({ kind: 'not_found' }, null);
    });
  });

  describe('User.getAll method', () => {
    test('should get all users', () => {
      const mockResult = jest.fn();
      const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ];
      
      sql.query.mockImplementation((query, callback) => {
        callback(null, users);
      });
      
      User.getAll(mockResult);
      
      expect(sql.query).toHaveBeenCalledWith('SELECT * FROM users', expect.any(Function));
      expect(mockResult).toHaveBeenCalledWith(null, users);
    });

    test('should handle database error', () => {
      const mockResult = jest.fn();
      const dbError = new Error('Database connection failed');
      
      sql.query.mockImplementation((query, callback) => {
        callback(dbError, null);
      });
      
      User.getAll(mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(null, dbError);
    });
  });

  describe('User.removeAll method', () => {
    test('should delete all users', () => {
      const mockResult = jest.fn();
      
      sql.query.mockImplementation((query, callback) => {
        callback(null, { affectedRows: 5 });
      });
      
      User.removeAll(mockResult);
      
      expect(sql.query).toHaveBeenCalledWith('DELETE FROM users', expect.any(Function));
      expect(mockResult).toHaveBeenCalledWith(null, { affectedRows: 5 });
    });
  });
});
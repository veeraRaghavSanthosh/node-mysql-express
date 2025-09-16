// Mock the database connection
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

const User = require('../app/models/user.model.js');
const sql = require('../app/models/db.js');

describe('User Model - Null Input Validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('User constructor', () => {
    it('should handle null user input', () => {
      const user = new User(null);
      expect(user.email).toBeUndefined();
      expect(user.name).toBeUndefined();
      expect(user.active).toBeUndefined();
    });

    it('should handle undefined user input', () => {
      const user = new User(undefined);
      expect(user.email).toBeUndefined();
      expect(user.name).toBeUndefined();
      expect(user.active).toBeUndefined();
    });

    it('should create user with valid input', () => {
      const userData = { email: 'test@example.com', name: 'Test User', active: false };
      const user = new User(userData);
      expect(user.email).toBe('test@example.com');
      expect(user.name).toBe('Test User');
      expect(user.active).toBe(false);
    });

    it('should set default active to true when not provided', () => {
      const userData = { email: 'test@example.com', name: 'Test User' };
      const user = new User(userData);
      expect(user.active).toBe(true);
    });
  });

  describe('User.create', () => {
    it('should handle null newUser input', () => {
      const mockResult = jest.fn();
      User.create(null, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User data cannot be null'
        }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    it('should handle undefined newUser input', () => {
      const mockResult = jest.fn();
      User.create(undefined, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User data cannot be null'
        }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    it('should successfully create user with valid input', () => {
      const mockResult = jest.fn();
      const userData = { email: 'test@example.com', name: 'Test User' };
      
      sql.query.mockImplementation((query, data, callback) => {
        callback(null, { insertId: 1 });
      });

      User.create(userData, mockResult);
      
      expect(sql.query).toHaveBeenCalledWith('INSERT INTO users SET ?', userData, expect.any(Function));
      expect(mockResult).toHaveBeenCalledWith(null, { id: 1, ...userData });
    });

    it('should handle database error', () => {
      const mockResult = jest.fn();
      const userData = { email: 'test@example.com', name: 'Test User' };
      const dbError = new Error('Database connection failed');
      
      sql.query.mockImplementation((query, data, callback) => {
        callback(dbError, null);
      });

      User.create(userData, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(dbError, null);
    });
  });

  describe('User.findById', () => {
    it('should handle null userId input', () => {
      const mockResult = jest.fn();
      User.findById(null, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User ID cannot be null'
        }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    it('should handle undefined userId input', () => {
      const mockResult = jest.fn();
      User.findById(undefined, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User ID cannot be null'
        }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    it('should successfully find user with valid userId', () => {
      const mockResult = jest.fn();
      const userId = 1;
      const userData = { id: 1, email: 'test@example.com', name: 'Test User' };
      
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, [userData]);
      });

      User.findById(userId, mockResult);
      
      expect(sql.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = ?', [userId], expect.any(Function));
      expect(mockResult).toHaveBeenCalledWith(null, userData);
    });

    it('should handle user not found', () => {
      const mockResult = jest.fn();
      const userId = 999;
      
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      User.findById(userId, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith({ kind: 'not_found' }, null);
    });
  });

  describe('User.updateById', () => {
    it('should handle null id input', () => {
      const mockResult = jest.fn();
      const userData = { email: 'test@example.com', name: 'Test User' };
      
      User.updateById(null, userData, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User ID cannot be null'
        }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    it('should handle undefined id input', () => {
      const mockResult = jest.fn();
      const userData = { email: 'test@example.com', name: 'Test User' };
      
      User.updateById(undefined, userData, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User ID cannot be null'
        }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    it('should handle null user data input', () => {
      const mockResult = jest.fn();
      const userId = 1;
      
      User.updateById(userId, null, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User data cannot be null'
        }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    it('should handle undefined user data input', () => {
      const mockResult = jest.fn();
      const userId = 1;
      
      User.updateById(userId, undefined, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User data cannot be null'
        }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    it('should successfully update user with valid inputs', () => {
      const mockResult = jest.fn();
      const userId = 1;
      const userData = { email: 'updated@example.com', name: 'Updated User', active: true };
      
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      User.updateById(userId, userData, mockResult);
      
      expect(sql.query).toHaveBeenCalledWith(
        'UPDATE users SET email = ?, name = ?, active = ? WHERE id = ?',
        [userData.email, userData.name, userData.active, userId],
        expect.any(Function)
      );
      expect(mockResult).toHaveBeenCalledWith(null, { id: userId, ...userData });
    });

    it('should handle user not found during update', () => {
      const mockResult = jest.fn();
      const userId = 999;
      const userData = { email: 'updated@example.com', name: 'Updated User', active: true };
      
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      User.updateById(userId, userData, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith({ kind: 'not_found' }, null);
    });
  });

  describe('User.remove', () => {
    it('should handle null id input', () => {
      const mockResult = jest.fn();
      
      User.remove(null, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User ID cannot be null'
        }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    it('should handle undefined id input', () => {
      const mockResult = jest.fn();
      
      User.remove(undefined, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User ID cannot be null'
        }),
        null
      );
      expect(sql.query).not.toHaveBeenCalled();
    });

    it('should successfully remove user with valid id', () => {
      const mockResult = jest.fn();
      const userId = 1;
      
      sql.query.mockImplementation((query, id, callback) => {
        callback(null, { affectedRows: 1 });
      });

      User.remove(userId, mockResult);
      
      expect(sql.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = ?', userId, expect.any(Function));
      expect(mockResult).toHaveBeenCalledWith(null, { affectedRows: 1 });
    });

    it('should handle user not found during removal', () => {
      const mockResult = jest.fn();
      const userId = 999;
      
      sql.query.mockImplementation((query, id, callback) => {
        callback(null, { affectedRows: 0 });
      });

      User.remove(userId, mockResult);
      
      expect(mockResult).toHaveBeenCalledWith({ kind: 'not_found' }, null);
    });
  });

  describe('User.getAll', () => {
    it('should successfully get all users', () => {
      const mockResult = jest.fn();
      const userData = [
        { id: 1, email: 'user1@example.com', name: 'User 1' },
        { id: 2, email: 'user2@example.com', name: 'User 2' }
      ];
      
      sql.query.mockImplementation((query, callback) => {
        callback(null, userData);
      });

      User.getAll(mockResult);
      
      expect(sql.query).toHaveBeenCalledWith('SELECT * FROM users', expect.any(Function));
      expect(mockResult).toHaveBeenCalledWith(null, userData);
    });

    it('should handle database error', () => {
      const mockResult = jest.fn();
      const dbError = new Error('Database connection failed');
      
      sql.query.mockImplementation((query, callback) => {
        callback(dbError, null);
      });

      User.getAll(mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(null, dbError);
    });
  });

  describe('User.removeAll', () => {
    it('should successfully remove all users', () => {
      const mockResult = jest.fn();
      
      sql.query.mockImplementation((query, callback) => {
        callback(null, { affectedRows: 5 });
      });

      User.removeAll(mockResult);
      
      expect(sql.query).toHaveBeenCalledWith('DELETE FROM users', expect.any(Function));
      expect(mockResult).toHaveBeenCalledWith(null, { affectedRows: 5 });
    });

    it('should handle database error', () => {
      const mockResult = jest.fn();
      const dbError = new Error('Database connection failed');
      
      sql.query.mockImplementation((query, callback) => {
        callback(dbError, null);
      });

      User.removeAll(mockResult);
      
      expect(mockResult).toHaveBeenCalledWith(null, dbError);
    });
  });
});
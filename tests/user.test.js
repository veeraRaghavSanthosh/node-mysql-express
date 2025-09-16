const userController = require('../src/api/user.js');
const User = require('../app/models/user.model.js');

// Mock the User model
jest.mock('../app/models/user.model.js');

describe('User Controller', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock request and response objects
    req = {
      body: {},
      params: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
  });

  describe('validateInput', () => {
    test('should return valid for correct input', () => {
      const input = { email: 'test@example.com', name: 'John Doe' };
      const result = userController.validateInput(input, ['email', 'name']);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should return invalid for null input', () => {
      const result = userController.validateInput(null, ['email']);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Request body is required and must be a valid object');
    });

    test('should return invalid for undefined input', () => {
      const result = userController.validateInput(undefined, ['email']);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Request body is required and must be a valid object');
    });

    test('should return invalid for non-object input', () => {
      const result = userController.validateInput('string', ['email']);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Request body is required and must be a valid object');
    });

    test('should return invalid for missing required fields', () => {
      const input = { name: 'John Doe' };
      const result = userController.validateInput(input, ['email', 'name']);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('email is required and cannot be null or empty');
    });

    test('should return invalid for null required fields', () => {
      const input = { email: null, name: 'John Doe' };
      const result = userController.validateInput(input, ['email', 'name']);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('email is required and cannot be null or empty');
    });

    test('should return invalid for empty string required fields', () => {
      const input = { email: '', name: 'John Doe' };
      const result = userController.validateInput(input, ['email', 'name']);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('email is required and cannot be null or empty');
    });

    test('should return invalid for invalid email format', () => {
      const input = { email: 'invalid-email', name: 'John Doe' };
      const result = userController.validateInput(input, ['email', 'name']);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email must be in valid format');
    });

    test('should return invalid for non-string name', () => {
      const input = { email: 'test@example.com', name: 123 };
      const result = userController.validateInput(input, ['email', 'name']);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name must be a string');
    });
  });

  describe('validateUserId', () => {
    test('should return valid for positive number', () => {
      const result = userController.validateUserId('123');
      
      expect(result.isValid).toBe(true);
      expect(result.userId).toBe(123);
    });

    test('should return invalid for null userId', () => {
      const result = userController.validateUserId(null);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('User ID is required');
    });

    test('should return invalid for undefined userId', () => {
      const result = userController.validateUserId(undefined);
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('User ID is required');
    });

    test('should return invalid for non-numeric userId', () => {
      const result = userController.validateUserId('abc');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('User ID must be a positive number');
    });

    test('should return invalid for negative userId', () => {
      const result = userController.validateUserId('-1');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('User ID must be a positive number');
    });

    test('should return invalid for zero userId', () => {
      const result = userController.validateUserId('0');
      
      expect(result.isValid).toBe(false);
      expect(result.error).toBe('User ID must be a positive number');
    });
  });

  describe('create', () => {
    test('should create user with valid input', () => {
      req.body = { email: 'test@example.com', name: 'John Doe', active: true };
      
      // Mock User constructor
      User.mockImplementation((userData) => {
        return {
          email: userData.email,
          name: userData.name,
          active: userData.active
        };
      });
      
      User.create.mockImplementation((user, callback) => {
        callback(null, { id: 1, ...user });
      });

      userController.create(req, res);

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'test@example.com',
          name: 'John Doe',
          active: true
        }),
        expect.any(Function)
      );
      expect(res.send).toHaveBeenCalledWith({ id: 1, email: 'test@example.com', name: 'John Doe', active: true });
    });

    test('should handle null request body', () => {
      req.body = null;

      userController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "Validation failed",
        errors: ['Request body is required and must be a valid object']
      });
    });

    test('should handle missing required fields', () => {
      req.body = { name: 'John Doe' }; // Missing email

      userController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "Validation failed",
        errors: ['email is required and cannot be null or empty']
      });
    });

    test('should handle database error', () => {
      req.body = { email: 'test@example.com', name: 'John Doe' };
      User.create.mockImplementation((user, callback) => {
        callback(new Error('Database error'), null);
      });

      userController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Database error'
      });
    });

    test('should default active to false when not provided', () => {
      req.body = { email: 'test@example.com', name: 'John Doe' };
      
      // Mock User constructor
      User.mockImplementation((userData) => {
        return {
          email: userData.email,
          name: userData.name,
          active: userData.active !== undefined ? userData.active : false
        };
      });
      
      User.create.mockImplementation((user, callback) => {
        callback(null, { id: 1, ...user });
      });

      userController.create(req, res);

      expect(User.create).toHaveBeenCalledWith(
        expect.objectContaining({
          active: false
        }),
        expect.any(Function)
      );
    });
  });

  describe('findOne', () => {
    test('should find user with valid ID', () => {
      req.params.userId = '123';
      User.findById.mockImplementation((id, callback) => {
        callback(null, { id: 123, email: 'test@example.com', name: 'John Doe' });
      });

      userController.findOne(req, res);

      expect(User.findById).toHaveBeenCalledWith(123, expect.any(Function));
      expect(res.send).toHaveBeenCalledWith({ id: 123, email: 'test@example.com', name: 'John Doe' });
    });

    test('should handle null userId parameter', () => {
      req.params.userId = null;

      userController.findOne(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'User ID is required'
      });
    });

    test('should handle invalid userId parameter', () => {
      req.params.userId = 'invalid';

      userController.findOne(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'User ID must be a positive number'
      });
    });

    test('should handle user not found', () => {
      req.params.userId = '123';
      User.findById.mockImplementation((id, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      userController.findOne(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Not found User with id 123.'
      });
    });
  });

  describe('update', () => {
    test('should update user with valid data', () => {
      req.params.userId = '123';
      req.body = { email: 'updated@example.com', name: 'Updated Name' };
      User.updateById.mockImplementation((id, user, callback) => {
        callback(null, { id: 123, ...user });
      });

      userController.update(req, res);

      expect(User.updateById).toHaveBeenCalledWith(123, expect.any(Object), expect.any(Function));
      expect(res.send).toHaveBeenCalled();
    });

    test('should handle null request body', () => {
      req.params.userId = '123';
      req.body = null;

      userController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "Validation failed",
        errors: ['Request body is required and must be a valid object']
      });
    });

    test('should handle empty request body', () => {
      req.params.userId = '123';
      req.body = {};

      userController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: "At least one field (email, name, or active) must be provided for update"
      });
    });

    test('should handle invalid userId', () => {
      req.params.userId = null;
      req.body = { email: 'test@example.com' };

      userController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'User ID is required'
      });
    });
  });

  describe('delete', () => {
    test('should delete user with valid ID', () => {
      req.params.userId = '123';
      User.remove.mockImplementation((id, callback) => {
        callback(null, { affectedRows: 1 });
      });

      userController.delete(req, res);

      expect(User.remove).toHaveBeenCalledWith(123, expect.any(Function));
      expect(res.send).toHaveBeenCalledWith({ message: 'User was deleted successfully!' });
    });

    test('should handle null userId parameter', () => {
      req.params.userId = null;

      userController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'User ID is required'
      });
    });

    test('should handle user not found for deletion', () => {
      req.params.userId = '123';
      User.remove.mockImplementation((id, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      userController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Not found User with id 123.'
      });
    });
  });

  describe('findAll', () => {
    test('should return all users', () => {
      const users = [
        { id: 1, email: 'user1@example.com', name: 'User 1' },
        { id: 2, email: 'user2@example.com', name: 'User 2' }
      ];
      User.getAll.mockImplementation((callback) => {
        callback(null, users);
      });

      userController.findAll(req, res);

      expect(User.getAll).toHaveBeenCalledWith(expect.any(Function));
      expect(res.send).toHaveBeenCalledWith(users);
    });

    test('should handle null data from database', () => {
      User.getAll.mockImplementation((callback) => {
        callback(null, null);
      });

      userController.findAll(req, res);

      expect(res.send).toHaveBeenCalledWith([]);
    });

    test('should handle database error', () => {
      User.getAll.mockImplementation((callback) => {
        callback(new Error('Database error'), null);
      });

      userController.findAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Database error'
      });
    });
  });

  describe('deleteAll', () => {
    test('should delete all users', () => {
      User.removeAll.mockImplementation((callback) => {
        callback(null, { affectedRows: 5 });
      });

      userController.deleteAll(req, res);

      expect(User.removeAll).toHaveBeenCalledWith(expect.any(Function));
      expect(res.send).toHaveBeenCalledWith({ message: 'All Users were deleted successfully!' });
    });

    test('should handle database error', () => {
      User.removeAll.mockImplementation((callback) => {
        callback(new Error('Database error'), null);
      });

      userController.deleteAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Database error'
      });
    });
  });
});
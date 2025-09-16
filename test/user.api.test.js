const userController = require('../src/api/user.js');

// Mock the User model
jest.mock('../app/models/user.model.js', () => ({
  create: jest.fn(),
  findById: jest.fn(),
  getAll: jest.fn(),
  updateById: jest.fn(),
  remove: jest.fn(),
  removeAll: jest.fn()
}));

const User = require('../app/models/user.model.js');

describe('User API - Null Input Validation', () => {
  let req, res;

  beforeEach(() => {
    // Reset mocks
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

  describe('validateNotNull function', () => {
    it('should throw TypeError when input is null', () => {
      expect(() => {
        userController.validateNotNull(null, 'TestField');
      }).toThrow(TypeError);
      expect(() => {
        userController.validateNotNull(null, 'TestField');
      }).toThrow('TestField cannot be null or undefined');
    });

    it('should throw TypeError when input is undefined', () => {
      expect(() => {
        userController.validateNotNull(undefined, 'TestField');
      }).toThrow(TypeError);
      expect(() => {
        userController.validateNotNull(undefined, 'TestField');
      }).toThrow('TestField cannot be null or undefined');
    });

    it('should return true for valid input', () => {
      expect(userController.validateNotNull('valid string')).toBe(true);
      expect(userController.validateNotNull(123)).toBe(true);
      expect(userController.validateNotNull({})).toBe(true);
      expect(userController.validateNotNull([])).toBe(true);
    });
  });

  describe('validateUser function', () => {
    it('should return validation error when user object is null', () => {
      const result = userController.validateUser(null);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('User object cannot be null or undefined');
    });

    it('should return validation error when user object is undefined', () => {
      const result = userController.validateUser(undefined);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('User object cannot be null or undefined');
    });

    it('should return validation error when email is null', () => {
      const user = { name: 'John Doe', email: null };
      const result = userController.validateUser(user);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Email is required and cannot be null');
    });

    it('should return validation error when name is null', () => {
      const user = { email: 'john@example.com', name: null };
      const result = userController.validateUser(user);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Name is required and cannot be null');
    });

    it('should return validation error for invalid email format', () => {
      const user = { email: 'invalid-email', name: 'John Doe' };
      const result = userController.validateUser(user);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

    it('should return valid for correct user object', () => {
      const user = { email: 'john@example.com', name: 'John Doe' };
      const result = userController.validateUser(user);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('create function', () => {
    it('should handle null request object', () => {
      userController.create(null, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Request object cannot be null or undefined'
      });
    });

    it('should handle null request body', () => {
      req.body = null;
      userController.create(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Request body cannot be null or undefined'
      });
    });

    it('should handle empty request body', () => {
      req.body = {};
      userController.create(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Content cannot be empty!'
      });
    });

    it('should handle request body with null email', () => {
      req.body = { email: null, name: 'John Doe' };
      userController.create(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: ['Email is required and cannot be null']
      });
    });

    it('should handle request body with null name', () => {
      req.body = { email: 'john@example.com', name: null };
      userController.create(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Validation failed',
        errors: ['Name is required and cannot be null']
      });
    });

    it('should successfully create user with valid data', () => {
      req.body = { email: 'john@example.com', name: 'John Doe' };
      User.create.mockImplementation((user, callback) => {
        callback(null, { id: 1, ...user });
      });

      userController.create(req, res);
      
      expect(User.create).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('findOne function', () => {
    it('should handle null request object', () => {
      userController.findOne(null, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Request object cannot be null or undefined'
      });
    });

    it('should handle null request params', () => {
      req.params = null;
      userController.findOne(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Request parameters cannot be null or undefined'
      });
    });

    it('should handle null userId parameter', () => {
      req.params = { userId: null };
      userController.findOne(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'User ID cannot be null or undefined'
      });
    });

    it('should handle empty userId parameter', () => {
      req.params = { userId: '' };
      userController.findOne(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'User ID cannot be empty'
      });
    });

    it('should successfully find user with valid userId', () => {
      req.params = { userId: '1' };
      User.findById.mockImplementation((id, callback) => {
        callback(null, { id: 1, email: 'john@example.com', name: 'John Doe' });
      });

      userController.findOne(req, res);
      
      expect(User.findById).toHaveBeenCalledWith('1', expect.any(Function));
      expect(res.send).toHaveBeenCalledWith({ id: 1, email: 'john@example.com', name: 'John Doe' });
    });
  });

  describe('update function', () => {
    it('should handle null request object', () => {
      userController.update(null, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Request object cannot be null or undefined'
      });
    });

    it('should handle null request body', () => {
      req.body = null;
      req.params = { userId: '1' };
      userController.update(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Request body cannot be null or undefined'
      });
    });

    it('should handle null userId parameter', () => {
      req.body = { email: 'john@example.com' };
      req.params = { userId: null };
      userController.update(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'User ID cannot be null or undefined'
      });
    });

    it('should handle null values in update data', () => {
      req.body = { email: null };
      req.params = { userId: '1' };
      userController.update(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'email cannot be null'
      });
    });

    it('should successfully update user with valid data', () => {
      req.body = { email: 'john.updated@example.com', name: 'John Updated' };
      req.params = { userId: '1' };
      User.updateById.mockImplementation((id, user, callback) => {
        callback(null, { id: 1, ...user });
      });

      userController.update(req, res);
      
      expect(User.updateById).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalled();
    });
  });

  describe('delete function', () => {
    it('should handle null request object', () => {
      userController.delete(null, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Request object cannot be null or undefined'
      });
    });

    it('should handle null userId parameter', () => {
      req.params = { userId: null };
      userController.delete(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'User ID cannot be null or undefined'
      });
    });

    it('should handle empty userId parameter', () => {
      req.params = { userId: '' };
      userController.delete(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'User ID cannot be empty'
      });
    });

    it('should successfully delete user with valid userId', () => {
      req.params = { userId: '1' };
      User.remove.mockImplementation((id, callback) => {
        callback(null, { affectedRows: 1 });
      });

      userController.delete(req, res);
      
      expect(User.remove).toHaveBeenCalledWith('1', expect.any(Function));
      expect(res.send).toHaveBeenCalledWith({ message: 'User was deleted successfully!' });
    });
  });

  describe('findAll function', () => {
    it('should handle null request object', () => {
      userController.findAll(null, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Request object cannot be null or undefined'
      });
    });

    it('should successfully retrieve all users', () => {
      User.getAll.mockImplementation((callback) => {
        callback(null, [{ id: 1, email: 'john@example.com', name: 'John Doe' }]);
      });

      userController.findAll(req, res);
      
      expect(User.getAll).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith([{ id: 1, email: 'john@example.com', name: 'John Doe' }]);
    });

    it('should handle null data from database', () => {
      User.getAll.mockImplementation((callback) => {
        callback(null, null);
      });

      userController.findAll(req, res);
      
      expect(User.getAll).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith([]);
    });
  });

  describe('deleteAll function', () => {
    it('should handle null request object', () => {
      userController.deleteAll(null, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Request object cannot be null or undefined'
      });
    });

    it('should successfully delete all users', () => {
      User.removeAll.mockImplementation((callback) => {
        callback(null, { affectedRows: 5 });
      });

      userController.deleteAll(req, res);
      
      expect(User.removeAll).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith({ message: 'All Users were deleted successfully!' });
    });
  });
});
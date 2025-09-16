const { validateInput, validateUserData, createUser, getUserById, updateUser, deleteUser, getAllUsers } = require('../src/api/user.js');

// Mock the User model
jest.mock('../app/models/user.model.js', () => {
  const MockUser = jest.fn().mockImplementation((userData) => {
    if (!userData) {
      throw new Error("User data cannot be null or undefined");
    }
    return userData;
  });
  
  MockUser.create = jest.fn();
  MockUser.findById = jest.fn();
  MockUser.updateById = jest.fn();
  MockUser.remove = jest.fn();
  MockUser.getAll = jest.fn();
  
  return MockUser;
});

const User = require('../app/models/user.model.js');

describe('User API Null Input Validation Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    jest.clearAllMocks();
  });

  describe('validateInput function', () => {
    test('should return error for null input', () => {
      const errors = validateInput(null);
      expect(errors).toContain('Input cannot be null or undefined');
    });

    test('should return error for undefined input', () => {
      const errors = validateInput(undefined);
      expect(errors).toContain('Input cannot be null or undefined');
    });

    test('should return error for non-object input', () => {
      const errors = validateInput('string');
      expect(errors).toContain('Input must be an object');
    });

    test('should return error for array input', () => {
      const errors = validateInput([]);
      expect(errors).toContain('Input must be an object');
    });

    test('should return empty array for valid object', () => {
      const errors = validateInput({});
      expect(errors).toHaveLength(0);
    });
  });

  describe('validateUserData function', () => {
    test('should return error for null userData', () => {
      const errors = validateUserData(null);
      expect(errors).toContain('Input cannot be null or undefined');
    });

    test('should return error for undefined userData', () => {
      const errors = validateUserData(undefined);
      expect(errors).toContain('Input cannot be null or undefined');
    });

    test('should return error for missing name', () => {
      const errors = validateUserData({ email: 'test@example.com' });
      expect(errors).toContain('Name is required');
    });

    test('should return error for non-string name', () => {
      const errors = validateUserData({ name: 123, email: 'test@example.com' });
      expect(errors).toContain('Name must be a string');
    });

    test('should return error for empty name', () => {
      const errors = validateUserData({ name: '   ', email: 'test@example.com' });
      expect(errors).toContain('Name cannot be empty');
    });

    test('should return error for missing email', () => {
      const errors = validateUserData({ name: 'John Doe' });
      expect(errors).toContain('Email is required');
    });

    test('should return error for invalid email format', () => {
      const errors = validateUserData({ name: 'John Doe', email: 'invalid-email' });
      expect(errors).toContain('Email must be a valid email address');
    });

    test('should return error for invalid age', () => {
      const errors = validateUserData({ 
        name: 'John Doe', 
        email: 'john@example.com', 
        age: 'not-a-number' 
      });
      expect(errors).toContain('Age must be a number');
    });

    test('should return error for negative age', () => {
      const errors = validateUserData({ 
        name: 'John Doe', 
        email: 'john@example.com', 
        age: -5 
      });
      expect(errors).toContain('Age must be between 0 and 150');
    });

    test('should return empty array for valid user data', () => {
      const errors = validateUserData({ 
        name: 'John Doe', 
        email: 'john@example.com', 
        age: 30 
      });
      expect(errors).toHaveLength(0);
    });

    test('should return empty array for valid user data without age', () => {
      const errors = validateUserData({ 
        name: 'John Doe', 
        email: 'john@example.com'
      });
      expect(errors).toHaveLength(0);
    });
  });

  describe('createUser function', () => {
    test('should handle null request body', () => {
      req.body = null;
      
      createUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Request body cannot be null or empty",
        error: "NULL_INPUT_ERROR"
      });
    });

    test('should handle undefined request body', () => {
      req.body = undefined;
      
      createUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Request body cannot be null or empty",
        error: "NULL_INPUT_ERROR"
      });
    });

    test('should handle null request object', () => {
      createUser(null, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Request body cannot be null or empty",
        error: "NULL_INPUT_ERROR"
      });
    });

    test('should handle invalid user data', () => {
      req.body = { name: '', email: 'invalid-email' };
      
      createUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Validation failed",
        errors: expect.arrayContaining([
          'Name is required',
          'Email must be a valid email address'
        ])
      });
    });

    test('should create user with valid data', () => {
      req.body = { 
        name: 'John Doe', 
        email: 'john@example.com', 
        age: 30 
      };
      
      User.create.mockImplementation((user, callback) => {
        callback(null, { id: 1, ...user });
      });
      
      createUser(req, res);
      
      expect(User.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User created successfully",
        data: expect.objectContaining({
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          age: 30
        })
      });
    });

    test('should handle database error', () => {
      req.body = { 
        name: 'John Doe', 
        email: 'john@example.com'
      };
      
      User.create.mockImplementation((user, callback) => {
        callback(new Error('Database error'), null);
      });
      
      createUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error creating user",
        error: "Database error"
      });
    });
  });

  describe('getUserById function', () => {
    test('should handle null request object', () => {
      getUserById(null, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Request parameters cannot be null",
        error: "NULL_PARAMS_ERROR"
      });
    });

    test('should handle null params', () => {
      req.params = null;
      
      getUserById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Request parameters cannot be null",
        error: "NULL_PARAMS_ERROR"
      });
    });

    test('should handle null user ID', () => {
      req.params.id = null;
      
      getUserById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User ID is required and cannot be null",
        error: "INVALID_USER_ID"
      });
    });

    test('should handle string "null" user ID', () => {
      req.params.id = 'null';
      
      getUserById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User ID is required and cannot be null",
        error: "INVALID_USER_ID"
      });
    });

    test('should find user with valid ID', () => {
      req.params.id = '1';
      
      User.findById.mockImplementation((id, callback) => {
        callback(null, { id: 1, name: 'John Doe', email: 'john@example.com' });
      });
      
      getUserById(req, res);
      
      expect(User.findById).toHaveBeenCalledWith('1', expect.any(Function));
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, name: 'John Doe', email: 'john@example.com' }
      });
    });

    test('should handle user not found', () => {
      req.params.id = '999';
      
      User.findById.mockImplementation((id, callback) => {
        callback({ kind: 'not_found' }, null);
      });
      
      getUserById(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User with ID 999 not found"
      });
    });
  });

  describe('updateUser function', () => {
    test('should handle null request', () => {
      updateUser(null, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Request parameters and body cannot be null",
        error: "NULL_REQUEST_ERROR"
      });
    });

    test('should handle null params and body', () => {
      req.params = null;
      req.body = null;
      
      updateUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Request parameters and body cannot be null",
        error: "NULL_REQUEST_ERROR"
      });
    });

    test('should handle null user ID', () => {
      req.params.id = null;
      req.body = { name: 'John Doe', email: 'john@example.com' };
      
      updateUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User ID is required and cannot be null",
        error: "INVALID_USER_ID"
      });
    });

    test('should update user with valid data', () => {
      req.params.id = '1';
      req.body = { name: 'John Updated', email: 'john.updated@example.com', age: 31 };
      
      User.updateById.mockImplementation((id, user, callback) => {
        callback(null, { id: parseInt(id), ...user });
      });
      
      updateUser(req, res);
      
      expect(User.updateById).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User updated successfully",
        data: expect.objectContaining({
          id: 1,
          name: 'John Updated',
          email: 'john.updated@example.com',
          age: 31
        })
      });
    });
  });

  describe('deleteUser function', () => {
    test('should handle null request', () => {
      deleteUser(null, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Request parameters cannot be null",
        error: "NULL_PARAMS_ERROR"
      });
    });

    test('should handle null user ID', () => {
      req.params.id = null;
      
      deleteUser(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User ID is required and cannot be null",
        error: "INVALID_USER_ID"
      });
    });

    test('should delete user with valid ID', () => {
      req.params.id = '1';
      
      User.remove.mockImplementation((id, callback) => {
        callback(null, { affectedRows: 1 });
      });
      
      deleteUser(req, res);
      
      expect(User.remove).toHaveBeenCalledWith('1', expect.any(Function));
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User deleted successfully"
      });
    });
  });

  describe('getAllUsers function', () => {
    test('should get all users', () => {
      const users = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' }
      ];
      
      User.getAll.mockImplementation((callback) => {
        callback(null, users);
      });
      
      getAllUsers(req, res);
      
      expect(User.getAll).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: users,
        count: 2
      });
    });

    test('should handle null data from database', () => {
      User.getAll.mockImplementation((callback) => {
        callback(null, null);
      });
      
      getAllUsers(req, res);
      
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
        count: 0
      });
    });

    test('should handle database error', () => {
      User.getAll.mockImplementation((callback) => {
        callback(new Error('Database connection failed'), null);
      });
      
      getAllUsers(req, res);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Error retrieving users",
        error: "Database connection failed"
      });
    });
  });
});
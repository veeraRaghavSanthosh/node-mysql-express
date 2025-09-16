// Auth Controller Register Function Unit Tests
const authController = require('../../app/controllers/auth.controller.js');

describe('Auth Controller - Register Function', () => {
  const mockRequest = (body = {}) => ({ body });
  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    test('should register new user successfully', () => {
      const req = mockRequest({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      });
      const res = mockResponse();

      authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User registered successfully',
        user: {
          id: expect.any(Number),
          email: 'newuser@example.com',
          name: 'New User',
          role: 'user'
        }
      });
    });
  });

  describe('Failure Cases', () => {
    test('should fail with missing email', () => {
      const req = mockRequest({ password: 'password123', name: 'Test User' });
      const res = mockResponse();

      authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Email, password, and name are required'
      });
    });

    test('should fail with invalid email format', () => {
      const req = mockRequest({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      });
      const res = mockResponse();

      authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Invalid email format'
      });
    });

    test('should fail with password too short', () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: '12345',
        name: 'Test User'
      });
      const res = mockResponse();

      authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Password must be at least 6 characters long'
      });
    });

    test('should fail when user already exists', () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      const res = mockResponse();

      authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Conflict',
        message: 'User with this email already exists'
      });
    });
  });

  describe('Boundary Cases', () => {
    test('should handle empty string values', () => {
      const req = mockRequest({ email: '', password: '', name: '' });
      const res = mockResponse();

      authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should handle very long email', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const req = mockRequest({
        email: longEmail,
        password: 'password123',
        name: 'Long Email User'
      });
      const res = mockResponse();

      authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });
  });
});

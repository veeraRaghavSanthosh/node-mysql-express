// Auth Controller Unit Tests
const authController = require('../../app/controllers/auth.controller.js');

describe('Auth Controller', () => {
  // Mock Express request and response objects
  const mockRequest = (body = {}) => ({
    body
  });

  const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Login Function - Success Cases', () => {
    test('should login successfully with valid user credentials', () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'valid-token',
        user: {
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          role: 'user'
        }
      });
    });

    test('should login successfully with valid admin credentials', () => {
      const req = mockRequest({
        email: 'admin@example.com',
        password: 'admin123'
      });
      const res = mockResponse();

      authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Login successful',
        token: 'admin-token',
        user: {
          id: 2,
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin'
        }
      });
    });
  });

  describe('Login Function - Failure Cases', () => {
    test('should fail with empty request body', () => {
      const req = { body: null };
      const res = mockResponse();

      authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Bad Request',
        message: 'Request body cannot be empty'
      });
    });

    test('should fail with missing email', () => {
      const req = mockRequest({
        password: 'password123'
      });
      const res = mockResponse();

      authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Email is required'
      });
    });

    test('should fail with missing password', () => {
      const req = mockRequest({
        email: 'test@example.com'
      });
      const res = mockResponse();

      authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Password is required'
      });
    });

    test('should fail with invalid email format', () => {
      const req = mockRequest({
        email: 'invalid-email',
        password: 'password123'
      });
      const res = mockResponse();

      authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Invalid email format'
      });
    });

    test('should fail with non-existent user', () => {
      const req = mockRequest({
        email: 'nonexistent@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    });

    test('should fail with incorrect password', () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: 'wrongpassword'
      });
      const res = mockResponse();

      authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Authentication Failed',
        message: 'Invalid email or password'
      });
    });
  });

  describe('Login Function - Boundary Cases', () => {
    test('should handle email with special characters', () => {
      const req = mockRequest({
        email: 'test+special@example.co.uk',
        password: 'password123'
      });
      const res = mockResponse();

      authController.login(req, res);

      // Should fail because user doesn't exist
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('should handle very long email', () => {
      const longEmail = 'a'.repeat(100) + '@example.com';
      const req = mockRequest({
        email: longEmail,
        password: 'password123'
      });
      const res = mockResponse();

      authController.login(req, res);

      // Should fail because user doesn't exist
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('should handle empty string email', () => {
      const req = mockRequest({
        email: '',
        password: 'password123'
      });
      const res = mockResponse();

      authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Email is required'
      });
    });

    test('should handle empty string password', () => {
      const req = mockRequest({
        email: 'test@example.com',
        password: ''
      });
      const res = mockResponse();

      authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation Error',
        message: 'Password is required'
      });
    });
  });
});

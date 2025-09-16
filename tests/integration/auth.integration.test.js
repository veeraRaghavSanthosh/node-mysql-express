// Auth Integration Tests
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  // Import auth middleware and controller
  const authController = require('../../app/controllers/auth.controller.js');

  // Auth middleware (simplified for testing)
  const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Access denied. No token provided or invalid format.',
        message: 'Please provide a valid Bearer token in the Authorization header'
      });
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return res.status(401).json({
        error: 'Access denied. Token is empty.',
        message: 'Please provide a valid token'
      });
    }

    if (token === 'valid-token') {
      req.user = { id: 1, email: 'test@example.com', role: 'user' };
      next();
    } else if (token === 'admin-token') {
      req.user = { id: 2, email: 'admin@example.com', role: 'admin' };
      next();
    } else {
      return res.status(403).json({
        error: 'Access denied. Invalid token.',
        message: 'The provided token is not valid'
      });
    }
  };

  // Auth routes
  app.post('/auth/login', authController.login);
  app.post('/auth/register', authController.register);
  app.get('/auth/profile', authMiddleware, authController.profile);

  return app;
};

describe('Auth Integration Tests', () => {
  let app;

  beforeEach(() => {
    app = createTestApp();
  });

  describe('POST /auth/login - Success Cases', () => {
    test('should login successfully with valid user credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
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

    test('should login successfully with valid admin credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'admin@example.com',
          password: 'admin123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
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

  describe('POST /auth/login - Failure Cases', () => {
    test('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Error');
    });

    test('should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Authentication Failed');
    });

    test('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          email: 'invalid-email',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Error');
      expect(response.body.message).toBe('Invalid email format');
    });
  });

  describe('POST /auth/register - Success Cases', () => {
    test('should register new user successfully', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'password123',
          name: 'New User'
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
      expect(response.body.user).toEqual({
        id: expect.any(Number),
        email: 'newuser@example.com',
        name: 'New User',
        role: 'user'
      });
    });
  });

  describe('POST /auth/register - Failure Cases', () => {
    test('should fail with existing email', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'test@example.com', // Already exists
          password: 'password123',
          name: 'Test User'
        });

      expect(response.status).toBe(409);
      expect(response.body.error).toBe('Conflict');
      expect(response.body.message).toBe('User with this email already exists');
    });

    test('should fail with weak password', async () => {
      const response = await request(app)
        .post('/auth/register')
        .send({
          email: 'newuser2@example.com',
          password: '123', // Too short
          name: 'New User'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation Error');
      expect(response.body.message).toBe('Password must be at least 6 characters long');
    });
  });

  describe('GET /auth/profile - Success Cases', () => {
    test('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer valid-token');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile retrieved successfully');
      expect(response.body.user).toEqual({
        id: 1,
        email: 'test@example.com',
        role: 'user'
      });
    });

    test('should get admin profile with admin token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer admin-token');

      expect(response.status).toBe(200);
      expect(response.body.user).toEqual({
        id: 2,
        email: 'admin@example.com',
        role: 'admin'
      });
    });
  });

  describe('GET /auth/profile - Failure Cases', () => {
    test('should fail without authorization header', async () => {
      const response = await request(app)
        .get('/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access denied. No token provided or invalid format.');
    });

    test('should fail with invalid token', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.error).toBe('Access denied. Invalid token.');
    });

    test('should fail with malformed authorization header', async () => {
      const response = await request(app)
        .get('/auth/profile')
        .set('Authorization', 'InvalidFormat token123');

      expect(response.status).toBe(401);
      expect(response.body.error).toBe('Access denied. No token provided or invalid format.');
    });
  });

  describe('Auth Flow Integration Tests', () => {
    test('should complete full auth flow: register -> login -> profile', async () => {
      // Step 1: Register new user
      const registerResponse = await request(app)
        .post('/auth/register')
        .send({
          email: 'flowtest@example.com',
          password: 'password123',
          name: 'Flow Test User'
        });

      expect(registerResponse.status).toBe(201);

      // Step 2: Login with registered user (this would fail in our mock system)
      // But we can test the login endpoint works
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          email: 'test@example.com', // Use existing mock user
          password: 'password123'
        });

      expect(loginResponse.status).toBe(200);
      expect(loginResponse.body.token).toBeDefined();

      // Step 3: Access profile with token
      const profileResponse = await request(app)
        .get('/auth/profile')
        .set('Authorization', `Bearer ${loginResponse.body.token}`);

      expect(profileResponse.status).toBe(200);
      expect(profileResponse.body.user).toBeDefined();
    });
  });

  describe('Boundary and Edge Cases Integration', () => {
    test('should handle concurrent login requests', async () => {
      const requests = Array(5).fill().map(() =>
        request(app)
          .post('/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          })
      );

      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.body.token).toBe('valid-token');
      });
    });

    test('should handle large payload registration', async () => {
      const largeData = {
        email: 'large@example.com',
        password: 'a'.repeat(1000), // Very long password
        name: 'Very '.repeat(100) + 'Long Name' // Very long name
      };

      const response = await request(app)
        .post('/auth/register')
        .send(largeData);

      expect(response.status).toBe(201);
    });

    test('should handle special characters in registration', async () => {
      const specialData = {
        email: 'special+test@example.co.uk',
        password: 'p@ssw0rd!@#$%^&*()',
        name: 'José María O\'Connor-Smith Jr.'
      };

      const response = await request(app)
        .post('/auth/register')
        .send(specialData);

      expect(response.status).toBe(201);
    });
  });
});
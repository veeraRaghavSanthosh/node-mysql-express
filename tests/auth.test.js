const request = require('supertest');
const app = require('../server.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Mock the database connection
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

const sql = require('../app/models/db.js');

describe('Authentication API', () => {
  const testUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    password: '$2b$10$hashedpassword',
    role: 'user',
    active: true,
    created_at: new Date()
  };

  const adminUser = {
    id: 2,
    email: 'admin@example.com',
    name: 'Admin User',
    password: '$2b$10$hashedpassword',
    role: 'admin',
    active: true,
    created_at: new Date()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      // Mock database queries
      sql.query
        .mockImplementationOnce((query, params, callback) => {
          // Mock findByEmail - user doesn't exist
          callback({ kind: 'not_found' }, null);
        })
        .mockImplementationOnce((query, params, callback) => {
          // Mock create user
          callback(null, { insertId: 1 });
        });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          name: 'New User',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User registered successfully!');
      expect(response.body.data.user.email).toBe('newuser@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com'
          // missing name and password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email, name, and password are required!');
    });

    it('should return error for invalid email format', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          name: 'Test User',
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Please provide a valid email address!');
    });

    it('should return error for password too short', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Password must be at least 6 characters long!');
    });

    it('should return error for existing email', async () => {
      sql.query.mockImplementationOnce((query, params, callback) => {
        // Mock findByEmail - user exists
        callback(null, testUser);
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123'
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User with this email already exists!');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login user successfully', async () => {
      sql.query.mockImplementationOnce((query, params, callback) => {
        // Mock findByEmail
        callback(null, testUser);
      });

      // Mock bcrypt.compare
      jest.spyOn(bcrypt, 'compare').mockImplementation((password, hash, callback) => {
        callback(null, true);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful!');
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.token).toBeDefined();
    });

    it('should return error for missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com'
          // missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email and password are required!');
    });

    it('should return error for invalid email', async () => {
      sql.query.mockImplementationOnce((query, params, callback) => {
        // Mock findByEmail - user not found
        callback({ kind: 'not_found' }, null);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password!');
    });

    it('should return error for inactive user', async () => {
      const inactiveUser = { ...testUser, active: false };
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, inactiveUser);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Account is deactivated. Please contact administrator.');
    });

    it('should return error for wrong password', async () => {
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, testUser);
      });

      jest.spyOn(bcrypt, 'compare').mockImplementation((password, hash, callback) => {
        callback(null, false);
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid email or password!');
    });
  });

  describe('GET /api/auth/profile', () => {
    let token;

    beforeEach(() => {
      token = jwt.sign(
        { id: testUser.id, email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
    });

    it('should get user profile successfully', async () => {
      sql.query.mockImplementationOnce((query, callback) => {
        callback(null, testUser);
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@example.com');
      expect(response.body.data.user.password).toBeUndefined();
    });

    it('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token is required');
    });

    it('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });
  });

  describe('PUT /api/auth/profile', () => {
    let token;

    beforeEach(() => {
      token = jwt.sign(
        { id: testUser.id, email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
    });

    it('should update profile successfully', async () => {
      sql.query.mockImplementationOnce((query, params, callback) => {
        // Mock updateById
        callback(null, { ...testUser, name: 'Updated Name' });
      });

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Updated Name'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe('Updated Name');
    });

    it('should return error without authentication', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({
          name: 'Updated Name'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('PUT /api/auth/change-password', () => {
    let token;

    beforeEach(() => {
      token = jwt.sign(
        { id: testUser.id, email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
    });

    it('should change password successfully', async () => {
      sql.query
        .mockImplementationOnce((query, callback) => {
          // Mock findById
          callback(null, testUser);
        })
        .mockImplementationOnce((query, params, callback) => {
          // Mock updateById
          callback(null, { ...testUser });
        });

      jest.spyOn(bcrypt, 'compare').mockImplementation((password, hash, callback) => {
        callback(null, true);
      });

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Password changed successfully!');
    });

    it('should return error for missing fields', async () => {
      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'password123'
          // missing newPassword
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should return error for wrong current password', async () => {
      sql.query.mockImplementationOnce((query, callback) => {
        callback(null, testUser);
      });

      jest.spyOn(bcrypt, 'compare').mockImplementation((password, hash, callback) => {
        callback(null, false);
      });

      const response = await request(app)
        .put('/api/auth/change-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Current password is incorrect!');
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let token;

    beforeEach(() => {
      token = jwt.sign(
        { id: testUser.id, email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
    });

    it('should refresh token successfully', async () => {
      sql.query.mockImplementationOnce((query, callback) => {
        callback(null, testUser);
      });

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.token).not.toBe(token);
    });
  });

  describe('POST /api/auth/logout', () => {
    let token;

    beforeEach(() => {
      token = jwt.sign(
        { id: testUser.id, email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
    });

    it('should logout successfully', async () => {
      sql.query.mockImplementationOnce((query, callback) => {
        callback(null, testUser);
      });

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('Logout successful');
    });
  });

  describe('GET /api/auth/users (Admin only)', () => {
    let adminToken, userToken;

    beforeEach(() => {
      adminToken = jwt.sign(
        { id: adminUser.id, email: adminUser.email, role: adminUser.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      userToken = jwt.sign(
        { id: testUser.id, email: testUser.email, role: testUser.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );
    });

    it('should get all users for admin', async () => {
      sql.query
        .mockImplementationOnce((query, callback) => {
          // Mock findById for admin user
          callback(null, adminUser);
        })
        .mockImplementationOnce((query, callback) => {
          // Mock getAll users
          callback(null, [testUser, adminUser]);
        });

      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.users).toHaveLength(2);
    });

    it('should deny access for non-admin user', async () => {
      sql.query.mockImplementationOnce((query, callback) => {
        // Mock findById for regular user
        callback(null, testUser);
      });

      const response = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Insufficient permissions');
    });
  });

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      sql.query.mockImplementation((query, params, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      // Make multiple login attempts
      const promises = [];
      for (let i = 0; i < 6; i++) {
        promises.push(
          request(app)
            .post('/api/auth/login')
            .send({
              email: 'test@example.com',
              password: 'wrongpassword'
            })
        );
      }

      const responses = await Promise.all(promises);
      
      // First 5 should be 401 (invalid credentials)
      // 6th should be 429 (rate limited)
      const rateLimitedResponse = responses[5];
      expect(rateLimitedResponse.status).toBe(429);
      expect(rateLimitedResponse.body.message).toContain('Too many attempts');
    });
  });
});

// Middleware tests
describe('Authentication Middleware', () => {
  const { authenticateToken, authorizeRoles } = require('../app/middleware/auth.middleware.js');
  
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {},
      user: null
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', async () => {
      const token = jwt.sign(
        { id: 1, email: 'test@example.com', role: 'user' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      req.headers.authorization = `Bearer ${token}`;

      sql.query.mockImplementationOnce((query, callback) => {
        callback(null, testUser);
      });

      await authenticateToken(req, res, next);

      expect(req.user).toBeDefined();
      expect(req.user.id).toBe(1);
      expect(next).toHaveBeenCalled();
    });

    it('should reject missing token', async () => {
      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Access token is required'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject invalid token', async () => {
      req.headers.authorization = 'Bearer invalid-token';

      await authenticateToken(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('authorizeRoles', () => {
    it('should authorize user with correct role', () => {
      req.user = { id: 1, email: 'admin@example.com', role: 'admin' };

      const middleware = authorizeRoles('admin');
      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
    });

    it('should reject user with incorrect role', () => {
      req.user = { id: 1, email: 'user@example.com', role: 'user' };

      const middleware = authorizeRoles('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Insufficient permissions'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should reject unauthenticated user', () => {
      req.user = null;

      const middleware = authorizeRoles('admin');
      middleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });
});
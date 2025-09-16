const request = require('supertest');
const express = require('express');

describe('Authentication Security Tests', () => {
  let app;
  
  // Security-focused auth middleware
  const securityAuthMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Invalid authentication format' });
    }
    
    const token = authHeader.substring(7);
    
    // Simulate token validation with security checks
    if (token === 'valid-secure-token') {
      req.user = { 
        id: 1, 
        name: 'Secure User',
        roles: ['user']
      };
      return next();
    }
    
    if (token === 'admin-token') {
      req.user = { 
        id: 2, 
        name: 'Admin User',
        roles: ['admin', 'user']
      };
      return next();
    }
    
    // Security: Don't reveal specific reason for failure
    return res.status(401).json({ error: 'Authentication failed' });
  };
  
  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/*', securityAuthMiddleware);
    
    app.get('/api/user-data', (req, res) => {
      res.json({ 
        data: 'User specific data',
        user: req.user.name,
        roles: req.user.roles
      });
    });
    
    app.get('/api/admin-only', (req, res) => {
      if (!req.user.roles.includes('admin')) {
        return res.status(403).json({ error: 'Admin access required' });
      }
      res.json({ 
        data: 'Admin only data',
        user: req.user.name
      });
    });
  });
  
  describe('Security Success Cases', () => {
    test('should authenticate valid user token', async () => {
      const response = await request(app)
        .get('/api/user-data')
        .set('Authorization', 'Bearer valid-secure-token')
        .expect(200);
      
      expect(response.body.user).toBe('Secure User');
      expect(response.body.roles).toContain('user');
    });
    
    test('should authenticate admin token with elevated privileges', async () => {
      const response = await request(app)
        .get('/api/admin-only')
        .set('Authorization', 'Bearer admin-token')
        .expect(200);
      
      expect(response.body.user).toBe('Admin User');
      expect(response.body.data).toBe('Admin only data');
    });
  });
  
  describe('Security Failure Cases', () => {
    test('should reject access without token', async () => {
      const response = await request(app)
        .get('/api/user-data')
        .expect(401);
      
      expect(response.body.error).toBe('Authentication required');
    });
    
    test('should reject user access to admin endpoints', async () => {
      const response = await request(app)
        .get('/api/admin-only')
        .set('Authorization', 'Bearer valid-secure-token')
        .expect(403);
      
      expect(response.body.error).toBe('Admin access required');
    });
  });
});
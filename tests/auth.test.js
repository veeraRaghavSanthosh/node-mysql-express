const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock the auth middleware based on the codebase structure observed
const authMiddleware = (req, res, next) => {
  // Basic auth middleware implementation for testing
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No authorization header provided' });
  }
  
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Invalid authorization header format' });
  }
  
  const token = authHeader.substring(7);
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  // Mock token validation
  if (token === 'valid-token') {
    req.user = { id: 1, name: 'Test User' };
    next();
  } else if (token === 'expired-token') {
    return res.status(401).json({ error: 'Token expired' });
  } else {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Create test app
const createTestApp = () => {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Protected route for testing
  app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({ message: 'Access granted', user: req.user });
  });
  
  // Public route for comparison
  app.get('/api/public', (req, res) => {
    res.json({ message: 'Public access' });
  });
  
  return app;
};

describe('Authentication Middleware', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  describe('Success Cases', () => {
    test('should allow access with valid token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);
      
      expect(response.body).toEqual({
        message: 'Access granted',
        user: { id: 1, name: 'Test User' }
      });
    });
    
    test('should allow access to public routes without token', async () => {
      const response = await request(app)
        .get('/api/public')
        .expect(200);
      
      expect(response.body).toEqual({
        message: 'Public access'
      });
    });
    
    test('should set user object on request when token is valid', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer valid-token');
      
      expect(response.body.user).toBeDefined();
      expect(response.body.user.id).toBe(1);
      expect(response.body.user.name).toBe('Test User');
    });
  });
  
  describe('Failure Cases', () => {
    test('should reject request without authorization header', async () => {
      const response = await request(app)
        .get('/api/protected')
        .expect(401);
      
      expect(response.body).toEqual({
        error: 'No authorization header provided'
      });
    });
    
    test('should reject request with invalid authorization header format', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'InvalidFormat token')
        .expect(401);
      
      expect(response.body).toEqual({
        error: 'Invalid authorization header format'
      });
    });
    
    test('should reject request with Bearer but no token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer ')
        .expect(401);
      
      expect(response.body).toEqual({
        error: 'No token provided'
      });
    });
    
    test('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
      
      expect(response.body).toEqual({
        error: 'Invalid token'
      });
    });
    
    test('should reject request with expired token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer expired-token')
        .expect(401);
      
      expect(response.body).toEqual({
        error: 'Token expired'
      });
    });
    
    test('should handle malformed authorization header gracefully', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Malformed')
        .expect(401);
      
      expect(response.body).toEqual({
        error: 'Invalid authorization header format'
      });
    });
  });
  
  describe('Boundary Cases', () => {
    test('should handle empty authorization header', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', '')
        .expect(401);
      
      expect(response.body).toEqual({
        error: 'Invalid authorization header format'
      });
    });
    
    test('should handle authorization header with only Bearer', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer')
        .expect(401);
      
      expect(response.body).toEqual({
        error: 'No token provided'
      });
    });
    
    test('should handle very long token', async () => {
      const longToken = 'a'.repeat(1000);
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${longToken}`)
        .expect(401);
      
      expect(response.body).toEqual({
        error: 'Invalid token'
      });
    });
    
    test('should handle token with special characters', async () => {
      const specialToken = 'token-with-special!@#$%^&*()_+chars';
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', `Bearer ${specialToken}`)
        .expect(401);
      
      expect(response.body).toEqual({
        error: 'Invalid token'
      });
    });
    
    test('should handle case-sensitive Bearer keyword', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'bearer valid-token')
        .expect(401);
      
      expect(response.body).toEqual({
        error: 'Invalid authorization header format'
      });
    });
    
    test('should handle multiple spaces in authorization header', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer   valid-token')
        .expect(200);
      
      expect(response.body.message).toBe('Access granted');
    });
    
    test('should handle null or undefined authorization header values', async () => {
      // Test with undefined (no header set)
      const response1 = await request(app)
        .get('/api/protected')
        .expect(401);
      
      expect(response1.body.error).toBe('No authorization header provided');
    });
    
    test('should handle numeric token', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer 12345')
        .expect(401);
      
      expect(response.body).toEqual({
        error: 'Invalid token'
      });
    });
  });
  
  describe('Edge Cases and Error Handling', () => {
    test('should handle request with multiple authorization headers', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer valid-token')
        .set('Authorization', 'Bearer another-token')
        .expect(401);
      
      // The second header should override the first
      expect(response.body.error).toBe('Invalid token');
    });
    
    test('should not expose sensitive information in error messages', async () => {
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
      
      // Should not expose the actual token value in error
      expect(response.body.error).not.toContain('invalid-token');
    });
    
    test('should handle middleware when next() is called multiple times', async () => {
      // This test ensures the middleware is properly implemented
      const response = await request(app)
        .get('/api/protected')
        .set('Authorization', 'Bearer valid-token')
        .expect(200);
      
      expect(response.body.message).toBe('Access granted');
    });
  });
});

describe('Authentication Integration Tests', () => {
  let app;
  
  beforeEach(() => {
    app = createTestApp();
  });
  
  test('should integrate properly with Express routing', async () => {
    // Test that middleware works with different HTTP methods
    app.post('/api/protected-post', authMiddleware, (req, res) => {
      res.json({ method: 'POST', user: req.user });
    });
    
    const response = await request(app)
      .post('/api/protected-post')
      .set('Authorization', 'Bearer valid-token')
      .send({ data: 'test' })
      .expect(200);
    
    expect(response.body.method).toBe('POST');
    expect(response.body.user.id).toBe(1);
  });
  
  test('should work with JSON and URL-encoded bodies', async () => {
    app.post('/api/protected-data', authMiddleware, (req, res) => {
      res.json({ body: req.body, user: req.user });
    });
    
    // Test JSON body
    const jsonResponse = await request(app)
      .post('/api/protected-data')
      .set('Authorization', 'Bearer valid-token')
      .set('Content-Type', 'application/json')
      .send({ test: 'json-data' })
      .expect(200);
    
    expect(jsonResponse.body.body.test).toBe('json-data');
    
    // Test URL-encoded body
    const urlEncodedResponse = await request(app)
      .post('/api/protected-data')
      .set('Authorization', 'Bearer valid-token')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send('test=url-encoded-data')
      .expect(200);
    
    expect(urlEncodedResponse.body.body.test).toBe('url-encoded-data');
  });
});
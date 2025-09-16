const request = require('supertest');
const express = require('express');

// Mock the server.js functionality for testing
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enhanced middleware with null validation
const authMiddleware = (req, res, next) => {
  if (!req) {
    return res.status(400).json({ error: 'Invalid request' });
  }
  next();
};

app.use('/api/*', authMiddleware);

function middleware1(req, res, next) {
  if (!req) {
    return res.status(400).json({ error: 'Invalid request object' });
  }

  const users = [
    {
      "id": 1,
      "name": "test3"
    },
    {
      "id": 2,
      "name": "test4"
    }
  ];
  req.users = users;
  next();
}

function middleware2(req, res, next) {
  if (!req) {
    return res.status(400).json({ error: 'Invalid request object' });
  }
  if (!res) {
    throw new Error('Invalid response object');
  }
  
  const users = req.users;
  
  if (!users || !Array.isArray(users)) {
    return res.status(500).json({ error: 'Users data not found or invalid' });
  }
  
  res.json({ user: users });
}

app.get("/user", middleware1, middleware2);

describe('Server API Tests', () => {
  describe('GET /user', () => {
    test('should return users successfully', async () => {
      const response = await request(app)
        .get('/user')
        .expect(200);
      
      expect(response.body).toHaveProperty('user');
      expect(Array.isArray(response.body.user)).toBe(true);
      expect(response.body.user).toHaveLength(2);
    });

    test('should handle null request gracefully', async () => {
      // This test simulates what happens when middleware receives null input
      const mockReq = null;
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      authMiddleware(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid request' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    test('should handle missing users data', async () => {
      const mockReq = {};
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      middleware2(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Users data not found or invalid' });
    });

    test('should handle invalid users data type', async () => {
      const mockReq = { users: "not an array" };
      const mockRes = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      const mockNext = jest.fn();

      middleware2(mockReq, mockRes, mockNext);
      
      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({ error: 'Users data not found or invalid' });
    });
  });
});

module.exports = app;
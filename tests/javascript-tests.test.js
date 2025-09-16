/**
 * Unit Tests for JavaScript Usage Example
 * Testing framework: Jest
 * 
 * To run these tests:
 * npm install --save-dev jest supertest mysql2
 * npm test
 */

const request = require('supertest');
const mysql = require('mysql2');
const app = require('../examples/javascript-usage');

// Mock MySQL pool
jest.mock('mysql2', () => ({
  createPool: jest.fn(() => ({
    query: jest.fn(),
    end: jest.fn()
  }))
}));

describe('Customer API - JavaScript', () => {
  let mockPool;

  beforeEach(() => {
    mockPool = mysql.createPool();
    jest.clearAllMocks();
  });

  describe('GET /api/customers', () => {
    it('should return all customers successfully', async () => {
      const mockCustomers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '098-765-4321' }
      ];

      mockPool.query.mockImplementation((query, callback) => {
        callback(null, mockCustomers);
      });

      const response = await request(app)
        .get('/api/customers')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockCustomers,
        count: 2
      });
    });

    it('should handle database errors gracefully', async () => {
      const mockError = new Error('Database connection failed');

      mockPool.query.mockImplementation((query, callback) => {
        callback(mockError, null);
      });

      const response = await request(app)
        .get('/api/customers')
        .expect(500);

      expect(response.body).toEqual({
        error: 'Database operation failed',
        message: 'Database connection failed'
      });
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer successfully', async () => {
      const newCustomer = {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '555-123-4567'
      };

      mockPool.query.mockImplementation((query, params, callback) => {
        expect(params).toEqual([newCustomer.name, newCustomer.email, newCustomer.phone]);
        callback(null, { insertId: 3 });
      });

      const response = await request(app)
        .post('/api/customers')
        .send(newCustomer)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Customer created successfully',
        data: {
          id: 3,
          ...newCustomer
        }
      });
    });

    it('should validate required fields', async () => {
      const invalidCustomer = {
        phone: '555-123-4567'
      };

      const response = await request(app)
        .post('/api/customers')
        .send(invalidCustomer)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Name and email are required'
      });
    });
  });

  describe('GET /health', () => {
    it('should return healthy status when database is connected', async () => {
      mockPool.query.mockImplementation((query, callback) => {
        callback(null, [{ '1': 1 }]);
      });

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.database).toBe('connected');
    });
  });
});
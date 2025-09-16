/**
 * Unit Tests for TypeScript Usage Example
 * Testing framework: Jest with TypeScript support
 * 
 * To run these tests:
 * npm install --save-dev jest @types/jest ts-jest supertest @types/supertest mysql2
 * npx ts-jest config:init
 * npm test
 */

import request from 'supertest';
import mysql from 'mysql2/promise';
import app from '../examples/typescript-usage';

// Mock MySQL pool
jest.mock('mysql2/promise', () => ({
  createPool: jest.fn(() => ({
    execute: jest.fn(),
    end: jest.fn()
  }))
}));

describe('Customer API - TypeScript', () => {
  let mockPool: jest.Mocked<mysql.Pool>;

  beforeEach(() => {
    mockPool = mysql.createPool() as jest.Mocked<mysql.Pool>;
    jest.clearAllMocks();
  });

  describe('GET /api/customers', () => {
    it('should return all customers with proper typing', async () => {
      const mockCustomers = [
        { 
          id: 1, 
          name: 'John Doe', 
          email: 'john@example.com', 
          phone: '123-456-7890',
          created_at: new Date('2023-01-01'),
          updated_at: new Date('2023-01-02')
        },
        { 
          id: 2, 
          name: 'Jane Smith', 
          email: 'jane@example.com', 
          phone: '098-765-4321',
          created_at: new Date('2023-01-03'),
          updated_at: new Date('2023-01-04')
        }
      ];

      mockPool.execute.mockResolvedValue([mockCustomers, []]);

      const response = await request(app)
        .get('/api/customers')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockCustomers,
        count: 2
      });

      expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM customers ORDER BY created_at DESC');
    });

    it('should handle database errors with proper error types', async () => {
      const mockError = new Error('Database connection failed');
      mockPool.execute.mockRejectedValue(mockError);

      const response = await request(app)
        .get('/api/customers')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        error: 'Database operation failed',
        message: 'Database connection failed'
      });
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should return a specific customer with type safety', async () => {
      const mockCustomer = { 
        id: 1, 
        name: 'John Doe', 
        email: 'john@example.com', 
        phone: '123-456-7890',
        created_at: new Date('2023-01-01')
      };

      mockPool.execute.mockResolvedValue([[mockCustomer], []]);

      const response = await request(app)
        .get('/api/customers/1')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockCustomer
      });

      expect(mockPool.execute).toHaveBeenCalledWith(
        'SELECT * FROM customers WHERE id = ?', 
        [1]
      );
    });

    it('should validate customer ID parameter', async () => {
      const response = await request(app)
        .get('/api/customers/invalid')
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Invalid customer ID'
      });
    });

    it('should return 404 for non-existent customer', async () => {
      mockPool.execute.mockResolvedValue([[], []]);

      const response = await request(app)
        .get('/api/customers/999')
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        message: 'Customer not found'
      });
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer with proper validation', async () => {
      const newCustomer = {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '555-123-4567'
      };

      const mockResult = { insertId: 3, affectedRows: 1 };
      mockPool.execute.mockResolvedValue([mockResult, []]);

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

      expect(mockPool.execute).toHaveBeenCalledWith(
        'INSERT INTO customers (name, email, phone, created_at) VALUES (?, ?, ?, NOW())',
        [newCustomer.name, newCustomer.email, newCustomer.phone]
      );
    });

    it('should validate required fields with detailed messages', async () => {
      const invalidCustomer = {
        name: '',
        email: 'invalid-email'
      };

      const response = await request(app)
        .post('/api/customers')
        .send(invalidCustomer)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('required');
    });

    it('should validate email format', async () => {
      const invalidCustomer = {
        name: 'Valid Name',
        email: 'invalid-email-format'
      };

      const response = await request(app)
        .post('/api/customers')
        .send(invalidCustomer)
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Valid email is required'
      });
    });

    it('should handle duplicate email with proper error code', async () => {
      const duplicateCustomer = {
        name: 'Bob Wilson',
        email: 'existing@example.com'
      };

      const duplicateError: any = new Error('Duplicate entry');
      duplicateError.code = 'ER_DUP_ENTRY';
      mockPool.execute.mockRejectedValue(duplicateError);

      const response = await request(app)
        .post('/api/customers')
        .send(duplicateCustomer)
        .expect(409);

      expect(response.body).toEqual({
        success: false,
        message: 'Email already exists'
      });
    });
  });

  describe('Health Check', () => {
    it('should return healthy status with timestamp', async () => {
      mockPool.execute.mockResolvedValue([[], []]);

      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.status).toBe('healthy');
      expect(response.body.database).toBe('connected');
      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    it('should return unhealthy status when database fails', async () => {
      const dbError = new Error('Connection refused');
      mockPool.execute.mockRejectedValue(dbError);

      const response = await request(app)
        .get('/health')
        .expect(503);

      expect(response.body.status).toBe('unhealthy');
      expect(response.body.database).toBe('disconnected');
      expect(response.body.error).toBe('Connection refused');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Type Safety Tests', () => {
    it('should enforce proper request/response types', async () => {
      // This test ensures our TypeScript interfaces are working correctly
      const validCustomerData = {
        name: 'Test User',
        email: 'test@example.com',
        phone: '123-456-7890'
      };

      mockPool.execute.mockResolvedValue([{ insertId: 1, affectedRows: 1 }, []]);

      const response = await request(app)
        .post('/api/customers')
        .send(validCustomerData)
        .expect(201);

      // Verify response structure matches our ApiResponse<T> interface
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('data');
      expect(typeof response.body.success).toBe('boolean');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.data).toBe('object');
    });
  });
});

// Mock data for consistent testing
export const mockCustomerData = {
  valid: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '123-456-7890'
  },
  invalid: {
    emptyName: { name: '', email: 'test@example.com' },
    invalidEmail: { name: 'John Doe', email: 'invalid-email' },
    missingRequired: { phone: '123-456-7890' }
  }
};

// Helper functions for testing
export const createMockCustomer = (overrides = {}) => ({
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  phone: '123-456-7890',
  created_at: new Date(),
  ...overrides
});

export const createMockError = (code?: string) => {
  const error: any = new Error('Test error');
  if (code) error.code = code;
  return error;
};
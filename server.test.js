const request = require('supertest');
const mysql = require('mysql2/promise');
const app = require('./server_converted');

// Mock mysql2/promise
jest.mock('mysql2/promise');

describe('Server API Tests', () => {
  let mockPool;
  let mockConnection;

  beforeEach(() => {
    mockConnection = {
      release: jest.fn(),
      execute: jest.fn(),
    };

    mockPool = {
      getConnection: jest.fn().mockResolvedValue(mockConnection),
      execute: jest.fn(),
      end: jest.fn().mockResolvedValue(undefined),
    };

    mysql.createPool.mockReturnValue(mockPool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /', () => {
    it('should return welcome message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toEqual({
        message: 'Welcome to the application.'
      });
    });
  });

  describe('GET /api/customers', () => {
    it('should return all customers successfully', async () => {
      const mockCustomers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '098-765-4321' }
      ];

      mockPool.execute.mockResolvedValue([mockCustomers]);

      const response = await request(app)
        .get('/api/customers')
        .expect(200);

      expect(response.body).toEqual({
        success: true,
        data: mockCustomers
      });

      expect(mockPool.execute).toHaveBeenCalledWith('SELECT * FROM customers');
    });

    it('should handle database errors', async () => {
      const error = new Error('Database connection failed');
      mockPool.execute.mockRejectedValue(error);

      const response = await request(app)
        .get('/api/customers')
        .expect(500);

      expect(response.body).toEqual({
        success: false,
        message: 'Error retrieving customers',
        error: 'Database connection failed'
      });
    });
  });

  describe('POST /api/customers', () => {
    it('should create a new customer successfully', async () => {
      const newCustomer = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '123-456-7890'
      };

      const mockResult = { insertId: 1 };
      mockPool.execute.mockResolvedValue([mockResult]);

      const response = await request(app)
        .post('/api/customers')
        .send(newCustomer)
        .expect(201);

      expect(response.body).toEqual({
        success: true,
        message: 'Customer created successfully',
        data: {
          id: 1,
          ...newCustomer
        }
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/customers')
        .send({ name: 'John Doe' }) // missing email
        .expect(400);

      expect(response.body).toEqual({
        success: false,
        message: 'Name and email are required'
      });
    });

    it('should handle duplicate email error', async () => {
      const error = new Error('Duplicate entry');
      error.code = 'ER_DUP_ENTRY';
      mockPool.execute.mockRejectedValue(error);

      const response = await request(app)
        .post('/api/customers')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
          phone: '123-456-7890'
        })
        .expect(409);

      expect(response.body).toEqual({
        success: false,
        message: 'Customer with this email already exists'
      });
    });
  });
});

module.exports = { app, mockPool };
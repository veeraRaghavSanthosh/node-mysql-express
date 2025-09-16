const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock the database connection
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

// Create test app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Add routes
require('../app/routes/customer.routes.js')(app);

describe('Customer API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /customers', () => {
    test('should return all customers', async () => {
      const mockCustomers = [
        { id: 1, email: 'test1@example.com', name: 'Test User 1', active: true },
        { id: 2, email: 'test2@example.com', name: 'Test User 2', active: false }
      ];

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, callback) => {
        callback(null, mockCustomers);
      });

      const response = await request(app)
        .get('/customers')
        .expect(200);

      expect(response.body).toEqual(mockCustomers);
    });

    test('should handle database error', async () => {
      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/customers')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /customers/:id', () => {
    test('should return customer by ID', async () => {
      const mockCustomer = { 
        id: 1, 
        email: 'test@example.com', 
        name: 'Test User', 
        active: true 
      };

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, callback) => {
        callback(null, [mockCustomer]);
      });

      const response = await request(app)
        .get('/customers/1')
        .expect(200);

      expect(response.body).toEqual(mockCustomer);
    });

    test('should return 404 for non-existent customer', async () => {
      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, callback) => {
        callback(null, []); // Empty result
      });

      const response = await request(app)
        .get('/customers/999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Not found Customer with id 999');
    });
  });

  describe('POST /customers', () => {
    test('should create a new customer', async () => {
      const newCustomer = {
        email: 'new@example.com',
        name: 'New User',
        active: true
      };

      const mockResult = { insertId: 3 };

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, data, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .post('/customers')
        .send(newCustomer)
        .expect(200);

      expect(response.body).toEqual({ id: 3, ...newCustomer });
    });

    test('should return 400 for empty body', async () => {
      const response = await request(app)
        .post('/customers')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Content can not be empty!');
    });

    test('should handle database error during creation', async () => {
      const newCustomer = {
        email: 'new@example.com',
        name: 'New User',
        active: true
      };

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, data, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .post('/customers')
        .send(newCustomer)
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('PUT /customers/:id', () => {
    test('should update customer successfully', async () => {
      const updatedCustomer = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      const mockResult = { affectedRows: 1 };

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .put('/customers/1')
        .send(updatedCustomer)
        .expect(200);

      expect(response.body).toEqual({ id: 1, ...updatedCustomer });
    });

    test('should return 404 for non-existent customer', async () => {
      const updatedCustomer = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      const mockResult = { affectedRows: 0 };

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, params, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .put('/customers/999')
        .send(updatedCustomer)
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Not found Customer with id 999');
    });

    test('should return 400 for empty body', async () => {
      const response = await request(app)
        .put('/customers/1')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Content can not be empty!');
    });
  });

  describe('DELETE /customers/:id', () => {
    test('should delete customer successfully', async () => {
      const mockResult = { affectedRows: 1 };

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, id, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .delete('/customers/1')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('Customer was deleted successfully!');
    });

    test('should return 404 for non-existent customer', async () => {
      const mockResult = { affectedRows: 0 };

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, id, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .delete('/customers/999')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('Not found Customer with id 999');
    });
  });

  describe('DELETE /customers', () => {
    test('should delete all customers successfully', async () => {
      const mockResult = { affectedRows: 5 };

      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .delete('/customers')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toBe('All Customers were deleted successfully!');
    });

    test('should handle database error during deletion', async () => {
      const sql = require('../app/models/db.js');
      sql.query.mockImplementation((query, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .delete('/customers')
        .expect(500);

      expect(response.body).toHaveProperty('message');
    });
  });
});
/**
 * Unit Tests for Node.js Express MySQL Customer API
 * 
 * This file contains comprehensive unit tests for the customer management system
 * using Jest testing framework with supertest for API testing
 */

const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock the database connection to avoid actual database calls during testing
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

const Customer = require('../app/models/customer.model');
const customerController = require('../app/controllers/customer.controller');

// Test data
const mockCustomerData = {
  email: 'test@example.com',
  name: 'Test User',
  active: true
};

const mockCustomer = {
  id: 1,
  ...mockCustomerData
};

const mockCustomers = [
  { id: 1, email: 'user1@test.com', name: 'User 1', active: true },
  { id: 2, email: 'user2@test.com', name: 'User 2', active: false }
];

// Setup Express app for testing
function createTestApp() {
  const app = express();
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Load customer routes
  require('../app/routes/customer.routes')(app);
  
  return app;
}

describe('Customer Model Tests', () => {
  let mockQuery;
  
  beforeEach(() => {
    const db = require('../app/models/db.js');
    mockQuery = db.query;
    mockQuery.mockClear();
  });

  describe('Customer.create', () => {
    it('should create a new customer successfully', (done) => {
      const insertResult = { insertId: 1 };
      mockQuery.mockImplementation((query, data, callback) => {
        callback(null, insertResult);
      });

      const newCustomer = new Customer(mockCustomerData);
      Customer.create(newCustomer, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual({ id: 1, ...mockCustomerData });
        expect(mockQuery).toHaveBeenCalledWith(
          'INSERT INTO customers SET ?',
          newCustomer,
          expect.any(Function)
        );
        done();
      });
    });

    it('should handle database errors during creation', (done) => {
      const dbError = new Error('Database connection failed');
      mockQuery.mockImplementation((query, data, callback) => {
        callback(dbError, null);
      });

      const newCustomer = new Customer(mockCustomerData);
      Customer.create(newCustomer, (err, data) => {
        expect(err).toBe(dbError);
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('Customer.findById', () => {
    it('should find a customer by ID successfully', (done) => {
      mockQuery.mockImplementation((query, callback) => {
        callback(null, [mockCustomer]);
      });

      Customer.findById(1, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual(mockCustomer);
        expect(mockQuery).toHaveBeenCalledWith(
          'SELECT * FROM customers WHERE id = 1',
          expect.any(Function)
        );
        done();
      });
    });

    it('should handle customer not found', (done) => {
      mockQuery.mockImplementation((query, callback) => {
        callback(null, []);
      });

      Customer.findById(999, (err, data) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(data).toBeNull();
        done();
      });
    });

    it('should handle database errors during find', (done) => {
      const dbError = new Error('Database query failed');
      mockQuery.mockImplementation((query, callback) => {
        callback(dbError, null);
      });

      Customer.findById(1, (err, data) => {
        expect(err).toBe(dbError);
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('Customer.getAll', () => {
    it('should retrieve all customers successfully', (done) => {
      mockQuery.mockImplementation((query, callback) => {
        callback(null, mockCustomers);
      });

      Customer.getAll((err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual(mockCustomers);
        expect(mockQuery).toHaveBeenCalledWith(
          'SELECT * FROM customers',
          expect.any(Function)
        );
        done();
      });
    });

    it('should handle database errors during getAll', (done) => {
      const dbError = new Error('Database query failed');
      mockQuery.mockImplementation((query, callback) => {
        callback(dbError, null);
      });

      Customer.getAll((err, data) => {
        expect(data).toBeNull();
        expect(err).toBe(dbError);
        done();
      });
    });
  });

  describe('Customer.updateById', () => {
    it('should update a customer successfully', (done) => {
      const updateResult = { affectedRows: 1 };
      mockQuery.mockImplementation((query, params, callback) => {
        callback(null, updateResult);
      });

      const updateData = { email: 'updated@test.com', name: 'Updated User', active: false };
      Customer.updateById(1, updateData, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual({ id: 1, ...updateData });
        expect(mockQuery).toHaveBeenCalledWith(
          'UPDATE customers SET email = ?, name = ?, active = ? WHERE id = ?',
          [updateData.email, updateData.name, updateData.active, 1],
          expect.any(Function)
        );
        done();
      });
    });

    it('should handle customer not found during update', (done) => {
      const updateResult = { affectedRows: 0 };
      mockQuery.mockImplementation((query, params, callback) => {
        callback(null, updateResult);
      });

      Customer.updateById(999, mockCustomerData, (err, data) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('Customer.remove', () => {
    it('should delete a customer successfully', (done) => {
      const deleteResult = { affectedRows: 1 };
      mockQuery.mockImplementation((query, id, callback) => {
        callback(null, deleteResult);
      });

      Customer.remove(1, (err, data) => {
        expect(err).toBeNull();
        expect(data).toBe(deleteResult);
        expect(mockQuery).toHaveBeenCalledWith(
          'DELETE FROM customers WHERE id = ?',
          1,
          expect.any(Function)
        );
        done();
      });
    });

    it('should handle customer not found during delete', (done) => {
      const deleteResult = { affectedRows: 0 };
      mockQuery.mockImplementation((query, id, callback) => {
        callback(null, deleteResult);
      });

      Customer.remove(999, (err, data) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('Customer.removeAll', () => {
    it('should delete all customers successfully', (done) => {
      const deleteResult = { affectedRows: 5 };
      mockQuery.mockImplementation((query, callback) => {
        callback(null, deleteResult);
      });

      Customer.removeAll((err, data) => {
        expect(err).toBeNull();
        expect(data).toBe(deleteResult);
        expect(mockQuery).toHaveBeenCalledWith(
          'DELETE FROM customers',
          expect.any(Function)
        );
        done();
      });
    });
  });
});

describe('Customer Controller Tests', () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
      json: jest.fn()
    };
  });

  describe('create controller', () => {
    it('should create a customer successfully', () => {
      req.body = mockCustomerData;
      
      // Mock Customer.create to simulate successful creation
      jest.spyOn(Customer, 'create').mockImplementation((customer, callback) => {
        callback(null, mockCustomer);
      });

      customerController.create(req, res);

      expect(Customer.create).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(mockCustomer);
    });

    it('should handle empty request body', () => {
      req.body = null;

      customerController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Content can not be empty!'
      });
    });

    it('should handle creation errors', () => {
      req.body = mockCustomerData;
      const error = new Error('Database error');

      jest.spyOn(Customer, 'create').mockImplementation((customer, callback) => {
        callback(error, null);
      });

      customerController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Database error'
      });
    });
  });

  describe('findAll controller', () => {
    it('should retrieve all customers successfully', () => {
      jest.spyOn(Customer, 'getAll').mockImplementation((callback) => {
        callback(null, mockCustomers);
      });

      customerController.findAll(req, res);

      expect(Customer.getAll).toHaveBeenCalled();
      expect(res.send).toHaveBeenCalledWith(mockCustomers);
    });

    it('should handle retrieval errors', () => {
      const error = new Error('Database error');
      jest.spyOn(Customer, 'getAll').mockImplementation((callback) => {
        callback(error, null);
      });

      customerController.findAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Database error'
      });
    });
  });

  describe('findOne controller', () => {
    it('should find a customer by ID successfully', () => {
      req.params.customerId = '1';

      jest.spyOn(Customer, 'findById').mockImplementation((id, callback) => {
        callback(null, mockCustomer);
      });

      customerController.findOne(req, res);

      expect(Customer.findById).toHaveBeenCalledWith('1', expect.any(Function));
      expect(res.send).toHaveBeenCalledWith(mockCustomer);
    });

    it('should handle customer not found', () => {
      req.params.customerId = '999';

      jest.spyOn(Customer, 'findById').mockImplementation((id, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      customerController.findOne(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.send).toHaveBeenCalledWith({
        message: 'Not found Customer with id 999.'
      });
    });
  });
});

describe('API Integration Tests', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /customers', () => {
    it('should create a new customer', async () => {
      jest.spyOn(Customer, 'create').mockImplementation((customer, callback) => {
        callback(null, mockCustomer);
      });

      const response = await request(app)
        .post('/customers')
        .send(mockCustomerData)
        .expect(200);

      expect(response.body).toEqual(mockCustomer);
    });

    it('should return 400 for empty body', async () => {
      await request(app)
        .post('/customers')
        .send({})
        .expect(400);
    });
  });

  describe('GET /customers', () => {
    it('should retrieve all customers', async () => {
      jest.spyOn(Customer, 'getAll').mockImplementation((callback) => {
        callback(null, mockCustomers);
      });

      const response = await request(app)
        .get('/customers')
        .expect(200);

      expect(response.body).toEqual(mockCustomers);
    });
  });

  describe('GET /customers/:id', () => {
    it('should retrieve a specific customer', async () => {
      jest.spyOn(Customer, 'findById').mockImplementation((id, callback) => {
        callback(null, mockCustomer);
      });

      const response = await request(app)
        .get('/customers/1')
        .expect(200);

      expect(response.body).toEqual(mockCustomer);
    });

    it('should return 404 for non-existent customer', async () => {
      jest.spyOn(Customer, 'findById').mockImplementation((id, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      await request(app)
        .get('/customers/999')
        .expect(404);
    });
  });

  describe('PUT /customers/:id', () => {
    it('should update a customer', async () => {
      const updatedCustomer = { id: 1, ...mockCustomerData, name: 'Updated Name' };
      
      jest.spyOn(Customer, 'updateById').mockImplementation((id, customer, callback) => {
        callback(null, updatedCustomer);
      });

      const response = await request(app)
        .put('/customers/1')
        .send({ ...mockCustomerData, name: 'Updated Name' })
        .expect(200);

      expect(response.body).toEqual(updatedCustomer);
    });
  });

  describe('DELETE /customers/:id', () => {
    it('should delete a customer', async () => {
      jest.spyOn(Customer, 'remove').mockImplementation((id, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const response = await request(app)
        .delete('/customers/1')
        .expect(200);

      expect(response.body).toEqual({ message: 'Customer was deleted successfully!' });
    });
  });

  describe('DELETE /customers', () => {
    it('should delete all customers', async () => {
      jest.spyOn(Customer, 'removeAll').mockImplementation((callback) => {
        callback(null, { affectedRows: 5 });
      });

      const response = await request(app)
        .delete('/customers')
        .expect(200);

      expect(response.body).toEqual({ message: 'All Customers were deleted successfully!' });
    });
  });
});

// Cleanup after tests
afterAll(() => {
  jest.restoreAllMocks();
});
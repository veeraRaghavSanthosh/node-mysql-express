const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');

// Mock the database connection
jest.mock('mysql');
jest.mock('../app/models/db.js');

// Import the app components
const Customer = require('../app/models/customer.model.js');

// Create express app for testing
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import routes
require('../app/routes/customer.routes.js')(app);

describe('Customer API', () => {
  let mockConnection;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock the database connection
    mockConnection = {
      query: jest.fn()
    };
    
    // Mock the mysql module
    mysql.createPool = jest.fn().mockReturnValue(mockConnection);
  });

  describe('POST /customers', () => {
    it('should create a new customer successfully', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        active: true
      };

      const expectedResponse = {
        id: 1,
        ...customerData
      };

      // Mock successful database insertion
      mockConnection.query.mockImplementation((query, data, callback) => {
        callback(null, { insertId: 1 });
      });

      const response = await request(app)
        .post('/customers')
        .send(customerData)
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
    });

    it('should return 400 when request body is empty', async () => {
      const response = await request(app)
        .post('/customers')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Content can not be empty!');
    });

    it('should return 500 when database error occurs', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        active: true
      };

      // Mock database error
      mockConnection.query.mockImplementation((query, data, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .post('/customers')
        .send(customerData)
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('error occurred while creating');
    });
  });

  describe('GET /customers', () => {
    it('should retrieve all customers successfully', async () => {
      const mockCustomers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', active: true },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', active: false }
      ];

      // Mock successful database query
      mockConnection.query.mockImplementation((query, callback) => {
        callback(null, mockCustomers);
      });

      const response = await request(app)
        .get('/customers')
        .expect(200);

      expect(response.body).toEqual(mockCustomers);
    });

    it('should return 500 when database error occurs', async () => {
      // Mock database error
      mockConnection.query.mockImplementation((query, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .get('/customers')
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('error occurred while retrieving');
    });
  });

  describe('GET /customers/:customerId', () => {
    it('should retrieve a single customer successfully', async () => {
      const mockCustomer = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        active: true
      };

      // Mock successful database query
      mockConnection.query.mockImplementation((query, callback) => {
        callback(null, [mockCustomer]);
      });

      const response = await request(app)
        .get('/customers/1')
        .expect(200);

      expect(response.body).toEqual(mockCustomer);
    });

    it('should return 404 when customer is not found', async () => {
      // Mock empty result
      mockConnection.query.mockImplementation((query, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .get('/customers/999')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Not found Customer with id 999.');
    });

    it('should return 500 when database error occurs', async () => {
      // Mock database error
      mockConnection.query.mockImplementation((query, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .get('/customers/1')
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Error retrieving Customer with id 1');
    });
  });

  describe('PUT /customers/:customerId', () => {
    it('should update a customer successfully', async () => {
      const updateData = {
        name: 'John Smith',
        email: 'john.smith@example.com',
        active: false
      };

      const expectedResponse = {
        id: 1,
        ...updateData
      };

      // Mock successful database update
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const response = await request(app)
        .put('/customers/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(expectedResponse);
    });

    it('should return 400 when request body is empty', async () => {
      const response = await request(app)
        .put('/customers/1')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('message', 'Content can not be empty!');
    });

    it('should return 404 when customer is not found', async () => {
      const updateData = {
        name: 'John Smith',
        email: 'john.smith@example.com',
        active: false
      };

      // Mock no affected rows (customer not found)
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      const response = await request(app)
        .put('/customers/999')
        .send(updateData)
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Not found Customer with id 999.');
    });
  });

  describe('DELETE /customers/:customerId', () => {
    it('should delete a customer successfully', async () => {
      // Mock successful database deletion
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const response = await request(app)
        .delete('/customers/1')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Customer was deleted successfully!');
    });

    it('should return 404 when customer is not found', async () => {
      // Mock no affected rows (customer not found)
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      const response = await request(app)
        .delete('/customers/999')
        .expect(404);

      expect(response.body).toHaveProperty('message', 'Not found Customer with id 999.');
    });

    it('should return 500 when database error occurs', async () => {
      // Mock database error
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .delete('/customers/1')
        .expect(500);

      expect(response.body).toHaveProperty('message', 'Could not delete Customer with id 1');
    });
  });

  describe('DELETE /customers', () => {
    it('should delete all customers successfully', async () => {
      // Mock successful database deletion
      mockConnection.query.mockImplementation((query, callback) => {
        callback(null, { affectedRows: 5 });
      });

      const response = await request(app)
        .delete('/customers')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'All Customers were deleted successfully!');
    });

    it('should return 500 when database error occurs', async () => {
      // Mock database error
      mockConnection.query.mockImplementation((query, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .delete('/customers')
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('error occurred while removing all customers');
    });
  });
});

describe('Customer Model', () => {
  let mockConnection;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnection = {
      query: jest.fn()
    };
    mysql.createPool = jest.fn().mockReturnValue(mockConnection);
  });

  describe('Customer.create', () => {
    it('should create a customer and return the result', (done) => {
      const customerData = {
        name: 'Test User',
        email: 'test@example.com',
        active: true
      };

      mockConnection.query.mockImplementation((query, data, callback) => {
        expect(query).toBe('INSERT INTO customers SET ?');
        expect(data).toEqual(customerData);
        callback(null, { insertId: 123 });
      });

      Customer.create(customerData, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({ id: 123, ...customerData });
        done();
      });
    });

    it('should handle database errors', (done) => {
      const customerData = {
        name: 'Test User',
        email: 'test@example.com',
        active: true
      };

      const dbError = new Error('Database error');
      mockConnection.query.mockImplementation((query, data, callback) => {
        callback(dbError, null);
      });

      Customer.create(customerData, (err, result) => {
        expect(err).toBe(dbError);
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('Customer.findById', () => {
    it('should find a customer by ID', (done) => {
      const mockCustomer = {
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        active: true
      };

      mockConnection.query.mockImplementation((query, callback) => {
        expect(query).toBe('SELECT * FROM customers WHERE id = 1');
        callback(null, [mockCustomer]);
      });

      Customer.findById(1, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual(mockCustomer);
        done();
      });
    });

    it('should return not_found error when customer does not exist', (done) => {
      mockConnection.query.mockImplementation((query, callback) => {
        callback(null, []);
      });

      Customer.findById(999, (err, result) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('Customer.getAll', () => {
    it('should return all customers', (done) => {
      const mockCustomers = [
        { id: 1, name: 'User 1', email: 'user1@example.com', active: true },
        { id: 2, name: 'User 2', email: 'user2@example.com', active: false }
      ];

      mockConnection.query.mockImplementation((query, callback) => {
        expect(query).toBe('SELECT * FROM customers');
        callback(null, mockCustomers);
      });

      Customer.getAll((err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual(mockCustomers);
        done();
      });
    });
  });

  describe('Customer.updateById', () => {
    it('should update a customer successfully', (done) => {
      const updateData = {
        name: 'Updated User',
        email: 'updated@example.com',
        active: false
      };

      mockConnection.query.mockImplementation((query, params, callback) => {
        expect(query).toBe('UPDATE customers SET email = ?, name = ?, active = ? WHERE id = ?');
        expect(params).toEqual([updateData.email, updateData.name, updateData.active, 1]);
        callback(null, { affectedRows: 1 });
      });

      Customer.updateById(1, updateData, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({ id: 1, ...updateData });
        done();
      });
    });

    it('should return not_found error when customer does not exist', (done) => {
      const updateData = {
        name: 'Updated User',
        email: 'updated@example.com',
        active: false
      };

      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      Customer.updateById(999, updateData, (err, result) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('Customer.remove', () => {
    it('should remove a customer successfully', (done) => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        expect(query).toBe('DELETE FROM customers WHERE id = ?');
        expect(params).toBe(1);
        callback(null, { affectedRows: 1 });
      });

      Customer.remove(1, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({ affectedRows: 1 });
        done();
      });
    });

    it('should return not_found error when customer does not exist', (done) => {
      mockConnection.query.mockImplementation((query, params, callback) => {
        callback(null, { affectedRows: 0 });
      });

      Customer.remove(999, (err, result) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('Customer.removeAll', () => {
    it('should remove all customers successfully', (done) => {
      mockConnection.query.mockImplementation((query, callback) => {
        expect(query).toBe('DELETE FROM customers');
        callback(null, { affectedRows: 5 });
      });

      Customer.removeAll((err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({ affectedRows: 5 });
        done();
      });
    });
  });
});
const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const customerController = require('../app/controllers/customer.controller');

// Mock the Customer model
jest.mock('../app/models/customer.model.js');
const Customer = require('../app/models/customer.model.js');

describe('Customer Controller', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    // Set up routes
    app.post('/customers', customerController.create);
    app.get('/customers', customerController.findAll);
    app.get('/customers/:customerId', customerController.findOne);
    app.put('/customers/:customerId', customerController.update);
    app.delete('/customers/:customerId', customerController.delete);
    app.delete('/customers', customerController.deleteAll);
    
    jest.clearAllMocks();
  });

  describe('POST /customers', () => {
    it('should create a new customer successfully', async () => {
      const mockCustomer = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const mockCreatedCustomer = {
        id: 1,
        ...mockCustomer
      };

      Customer.create.mockImplementation((customer, callback) => {
        callback(null, mockCreatedCustomer);
      });

      const response = await request(app)
        .post('/customers')
        .send(mockCustomer)
        .expect(200);

      expect(response.body).toEqual(mockCreatedCustomer);
      expect(Customer.create).toHaveBeenCalledWith(
        expect.objectContaining(mockCustomer),
        expect.any(Function)
      );
    });

    it('should return 400 when request body is empty', async () => {
      const response = await request(app)
        .post('/customers')
        .send()
        .expect(400);

      expect(response.body.message).toBe('Content can not be empty!');
    });

    it('should return 500 when database error occurs', async () => {
      const mockCustomer = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      Customer.create.mockImplementation((customer, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .post('/customers')
        .send(mockCustomer)
        .expect(500);

      expect(response.body.message).toBe('Database connection failed');
    });
  });

  describe('GET /customers', () => {
    it('should retrieve all customers successfully', async () => {
      const mockCustomers = [
        { id: 1, email: 'test1@example.com', name: 'Test User 1', active: true },
        { id: 2, email: 'test2@example.com', name: 'Test User 2', active: false }
      ];

      Customer.getAll.mockImplementation((callback) => {
        callback(null, mockCustomers);
      });

      const response = await request(app)
        .get('/customers')
        .expect(200);

      expect(response.body).toEqual(mockCustomers);
      expect(Customer.getAll).toHaveBeenCalled();
    });

    it('should return 500 when database error occurs', async () => {
      Customer.getAll.mockImplementation((callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .get('/customers')
        .expect(500);

      expect(response.body.message).toBe('Database connection failed');
    });
  });

  describe('GET /customers/:customerId', () => {
    it('should retrieve a customer by ID successfully', async () => {
      const mockCustomer = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      Customer.findById.mockImplementation((id, callback) => {
        callback(null, mockCustomer);
      });

      const response = await request(app)
        .get('/customers/1')
        .expect(200);

      expect(response.body).toEqual(mockCustomer);
      expect(Customer.findById).toHaveBeenCalledWith('1', expect.any(Function));
    });

    it('should return 404 when customer not found', async () => {
      Customer.findById.mockImplementation((id, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      const response = await request(app)
        .get('/customers/999')
        .expect(404);

      expect(response.body.message).toBe('Not found Customer with id 999.');
    });

    it('should return 500 when database error occurs', async () => {
      Customer.findById.mockImplementation((id, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .get('/customers/1')
        .expect(500);

      expect(response.body.message).toBe('Error retrieving Customer with id 1');
    });
  });

  describe('PUT /customers/:customerId', () => {
    it('should update a customer successfully', async () => {
      const updateData = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      const mockUpdatedCustomer = {
        id: 1,
        ...updateData
      };

      Customer.updateById.mockImplementation((id, customer, callback) => {
        callback(null, mockUpdatedCustomer);
      });

      const response = await request(app)
        .put('/customers/1')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockUpdatedCustomer);
      expect(Customer.updateById).toHaveBeenCalledWith(
        '1',
        expect.objectContaining(updateData),
        expect.any(Function)
      );
    });

    it('should return 400 when request body is empty', async () => {
      const response = await request(app)
        .put('/customers/1')
        .send()
        .expect(400);

      expect(response.body.message).toBe('Content can not be empty!');
    });

    it('should return 404 when customer not found', async () => {
      const updateData = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      Customer.updateById.mockImplementation((id, customer, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      const response = await request(app)
        .put('/customers/999')
        .send(updateData)
        .expect(404);

      expect(response.body.message).toBe('Not found Customer with id 999.');
    });
  });

  describe('DELETE /customers/:customerId', () => {
    it('should delete a customer successfully', async () => {
      Customer.remove.mockImplementation((id, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const response = await request(app)
        .delete('/customers/1')
        .expect(200);

      expect(response.body.message).toBe('Customer was deleted successfully!');
      expect(Customer.remove).toHaveBeenCalledWith('1', expect.any(Function));
    });

    it('should return 404 when customer not found', async () => {
      Customer.remove.mockImplementation((id, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      const response = await request(app)
        .delete('/customers/999')
        .expect(404);

      expect(response.body.message).toBe('Not found Customer with id 999.');
    });

    it('should return 500 when database error occurs', async () => {
      Customer.remove.mockImplementation((id, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .delete('/customers/1')
        .expect(500);

      expect(response.body.message).toBe('Could not delete Customer with id 1');
    });
  });

  describe('DELETE /customers', () => {
    it('should delete all customers successfully', async () => {
      Customer.removeAll.mockImplementation((callback) => {
        callback(null, { affectedRows: 5 });
      });

      const response = await request(app)
        .delete('/customers')
        .expect(200);

      expect(response.body.message).toBe('All Customers were deleted successfully!');
      expect(Customer.removeAll).toHaveBeenCalled();
    });

    it('should return 500 when database error occurs', async () => {
      Customer.removeAll.mockImplementation((callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .delete('/customers')
        .expect(500);

      expect(response.body.message).toBe('Database connection failed');
    });
  });
});
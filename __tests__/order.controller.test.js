const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const Order = require('../app/models/order.model.js');
const orderController = require('../app/controllers/order.controller.js');

// Mock the Order model
jest.mock('../app/models/order.model.js');

describe('Order Controller', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    app.post('/v1/orders', orderController.create);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /v1/orders', () => {
    const validOrderData = {
      customer_id: 1,
      total_amount: 99.99,
      status: 'pending',
      items: [
        {
          product_name: 'Test Product',
          quantity: 2,
          price: 49.99
        }
      ]
    };

    it('should create a new order with valid data', async () => {
      const mockCreatedOrder = {
        id: 1,
        ...validOrderData,
        order_date: new Date().toISOString()
      };

      Order.create.mockImplementation((order, callback) => {
        callback(null, mockCreatedOrder);
      });

      const response = await request(app)
        .post('/v1/orders')
        .send(validOrderData)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Order created successfully',
        data: mockCreatedOrder
      });

      expect(Order.create).toHaveBeenCalledTimes(1);
      expect(Order.create).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('should create an order without items', async () => {
      const orderWithoutItems = {
        customer_id: 1,
        total_amount: 50.00,
        status: 'pending'
      };

      const mockCreatedOrder = {
        id: 1,
        ...orderWithoutItems,
        order_date: new Date().toISOString()
      };

      Order.create.mockImplementation((order, callback) => {
        callback(null, mockCreatedOrder);
      });

      const response = await request(app)
        .post('/v1/orders')
        .send(orderWithoutItems)
        .expect(201);

      expect(response.body).toEqual({
        message: 'Order created successfully',
        data: mockCreatedOrder
      });
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app)
        .post('/v1/orders')
        .send()
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(Order.create).not.toHaveBeenCalled();
    });

    it('should return 400 for missing required fields', async () => {
      const invalidData = {
        total_amount: 99.99
        // missing customer_id
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Customer ID is required');
      expect(Order.create).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid customer_id', async () => {
      const invalidData = {
        customer_id: 'invalid',
        total_amount: 99.99
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Customer ID must be a number');
      expect(Order.create).not.toHaveBeenCalled();
    });

    it('should return 400 for negative customer_id', async () => {
      const invalidData = {
        customer_id: -1,
        total_amount: 99.99
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Customer ID must be positive');
      expect(Order.create).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid total_amount', async () => {
      const invalidData = {
        customer_id: 1,
        total_amount: 'invalid'
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Total amount must be a number');
      expect(Order.create).not.toHaveBeenCalled();
    });

    it('should return 400 for negative total_amount', async () => {
      const invalidData = {
        customer_id: 1,
        total_amount: -10.00
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Total amount must be positive');
      expect(Order.create).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid status', async () => {
      const invalidData = {
        customer_id: 1,
        total_amount: 99.99,
        status: 'invalid_status'
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Status must be one of: pending, processing, shipped, delivered, cancelled');
      expect(Order.create).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid items structure', async () => {
      const invalidData = {
        customer_id: 1,
        total_amount: 99.99,
        items: [
          {
            product_name: '',
            quantity: 'invalid',
            price: -10
          }
        ]
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Product name cannot be empty');
      expect(response.body.errors).toContain('Quantity must be a number');
      expect(response.body.errors).toContain('Price must be positive');
      expect(Order.create).not.toHaveBeenCalled();
    });

    it('should return 400 for empty items array', async () => {
      const invalidData = {
        customer_id: 1,
        total_amount: 99.99,
        items: []
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('At least one item is required if items are provided');
      expect(Order.create).not.toHaveBeenCalled();
    });

    it('should return 400 for non-existent customer', async () => {
      Order.create.mockImplementation((order, callback) => {
        const error = new Error('Foreign key constraint fails');
        error.code = 'ER_NO_REFERENCED_ROW_2';
        callback(error, null);
      });

      const response = await request(app)
        .post('/v1/orders')
        .send(validOrderData)
        .expect(400);

      expect(response.body.message).toBe('Invalid customer_id. Customer does not exist.');
    });

    it('should return 500 for database errors', async () => {
      Order.create.mockImplementation((order, callback) => {
        const error = new Error('Database connection failed');
        callback(error, null);
      });

      const response = await request(app)
        .post('/v1/orders')
        .send(validOrderData)
        .expect(500);

      expect(response.body.message).toBe('Database connection failed');
    });

    it('should handle default values correctly', async () => {
      const minimalData = {
        customer_id: 1,
        total_amount: 99.99
      };

      const mockCreatedOrder = {
        id: 1,
        customer_id: 1,
        total_amount: 99.99,
        status: 'pending',
        order_date: new Date().toISOString()
      };

      Order.create.mockImplementation((order, callback) => {
        // Capture the order object that was passed to create
        const orderArg = order;
        callback(null, mockCreatedOrder);
      });

      const response = await request(app)
        .post('/v1/orders')
        .send(minimalData)
        .expect(201);

      expect(Order.create).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Function)
      );
    });

    it('should validate all valid status values', async () => {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      for (const status of validStatuses) {
        const orderData = {
          customer_id: 1,
          total_amount: 99.99,
          status: status
        };

        const mockCreatedOrder = {
          id: 1,
          ...orderData,
          order_date: new Date()
        };

        Order.create.mockImplementation((order, callback) => {
          callback(null, mockCreatedOrder);
        });

        const response = await request(app)
          .post('/v1/orders')
          .send(orderData)
          .expect(201);

        expect(response.body.data.status).toBe(status);
      }
    });
  });
});
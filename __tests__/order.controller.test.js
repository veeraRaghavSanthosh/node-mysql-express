const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const Order = require('../app/models/order.model');
const orderController = require('../app/controllers/order.controller');

// Mock the Order model
jest.mock('../app/models/order.model');

describe('Order Controller', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(bodyParser.json());
    
    // Set up routes
    app.post('/v1/orders', orderController.create);
    app.get('/v1/orders', orderController.findAll);
    app.get('/v1/orders/:orderId', orderController.findOne);
    app.put('/v1/orders/:orderId', orderController.update);
    app.delete('/v1/orders/:orderId', orderController.delete);
    app.delete('/v1/orders', orderController.deleteAll);

    // Clear all mocks
    jest.clearAllMocks();
  });

  describe('POST /v1/orders', () => {
    const validOrderData = {
      customer_id: 1,
      product_name: 'Test Product',
      quantity: 2,
      unit_price: 25.99
    };

    it('should create a new order with valid data', async () => {
      const expectedOrder = {
        id: 1,
        ...validOrderData,
        total_amount: 51.98,
        status: 'pending'
      };

      Order.create.mockImplementation((order, callback) => {
        callback(null, expectedOrder);
      });

      const response = await request(app)
        .post('/v1/orders')
        .send(validOrderData);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(expectedOrder);
      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_id: validOrderData.customer_id,
          product_name: validOrderData.product_name,
          quantity: validOrderData.quantity,
          unit_price: validOrderData.unit_price,
          total_amount: 51.98,
          status: 'pending'
        }),
        expect.any(Function)
      );
    });

    it('should return 400 when request body is empty', async () => {
      const response = await request(app)
        .post('/v1/orders')
        .send();

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Content can not be empty!');
    });

    it('should return 400 when customer_id is missing', async () => {
      const invalidData = { ...validOrderData };
      delete invalidData.customer_id;

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('customer_id is required');
    });

    it('should return 400 when customer_id is not a positive integer', async () => {
      const invalidData = { ...validOrderData, customer_id: -1 };

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('customer_id must be a positive integer');
    });

    it('should return 400 when product_name is missing', async () => {
      const invalidData = { ...validOrderData };
      delete invalidData.product_name;

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('product_name is required');
    });

    it('should return 400 when product_name is empty string', async () => {
      const invalidData = { ...validOrderData, product_name: '   ' };

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('product_name must be a non-empty string');
    });

    it('should return 400 when quantity is missing', async () => {
      const invalidData = { ...validOrderData };
      delete invalidData.quantity;

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('quantity is required');
    });

    it('should return 400 when quantity is not a positive integer', async () => {
      const invalidData = { ...validOrderData, quantity: 0 };

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('quantity must be a positive integer');
    });

    it('should return 400 when unit_price is missing', async () => {
      const invalidData = { ...validOrderData };
      delete invalidData.unit_price;

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('unit_price is required');
    });

    it('should return 400 when unit_price is not a positive number', async () => {
      const invalidData = { ...validOrderData, unit_price: -10.99 };

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('unit_price must be a positive number');
    });

    it('should return 400 when status is invalid', async () => {
      const invalidData = { ...validOrderData, status: 'invalid_status' };

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.errors).toContain('status must be one of: pending, processing, shipped, delivered, cancelled');
    });

    it('should accept valid status values', async () => {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      for (const status of validStatuses) {
        Order.create.mockImplementation((order, callback) => {
          callback(null, { id: 1, ...order });
        });

        const response = await request(app)
          .post('/v1/orders')
          .send({ ...validOrderData, status });

        expect(response.status).toBe(201);
        expect(response.body.status).toBe(status);
      }
    });

    it('should return 500 when database error occurs', async () => {
      Order.create.mockImplementation((order, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .post('/v1/orders')
        .send(validOrderData);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Database connection failed');
    });

    it('should calculate total_amount correctly', async () => {
      const orderData = {
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 3,
        unit_price: 15.50
      };

      Order.create.mockImplementation((order, callback) => {
        callback(null, { id: 1, ...order });
      });

      const response = await request(app)
        .post('/v1/orders')
        .send(orderData);

      expect(response.status).toBe(201);
      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          total_amount: 46.50 // 3 * 15.50
        }),
        expect.any(Function)
      );
    });

    it('should trim whitespace from product_name', async () => {
      const orderData = {
        ...validOrderData,
        product_name: '  Test Product  '
      };

      Order.create.mockImplementation((order, callback) => {
        callback(null, { id: 1, ...order });
      });

      const response = await request(app)
        .post('/v1/orders')
        .send(orderData);

      expect(response.status).toBe(201);
      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          product_name: 'Test Product'
        }),
        expect.any(Function)
      );
    });
  });

  describe('GET /v1/orders', () => {
    it('should retrieve all orders', async () => {
      const mockOrders = [
        { id: 1, customer_id: 1, product_name: 'Product 1', quantity: 1, unit_price: 10.00, total_amount: 10.00, status: 'pending' },
        { id: 2, customer_id: 2, product_name: 'Product 2', quantity: 2, unit_price: 15.00, total_amount: 30.00, status: 'processing' }
      ];

      Order.getAll.mockImplementation((callback) => {
        callback(null, mockOrders);
      });

      const response = await request(app).get('/v1/orders');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrders);
    });

    it('should return 500 when database error occurs', async () => {
      Order.getAll.mockImplementation((callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/v1/orders');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Database error');
    });
  });

  describe('GET /v1/orders/:orderId', () => {
    it('should retrieve a single order by id', async () => {
      const mockOrder = { id: 1, customer_id: 1, product_name: 'Product 1', quantity: 1, unit_price: 10.00, total_amount: 10.00, status: 'pending' };

      Order.findById.mockImplementation((id, callback) => {
        callback(null, mockOrder);
      });

      const response = await request(app).get('/v1/orders/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockOrder);
    });

    it('should return 404 when order not found', async () => {
      Order.findById.mockImplementation((id, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      const response = await request(app).get('/v1/orders/999');

      expect(response.status).toBe(404);
      expect(response.body.message).toBe('Not found Order with id 999.');
    });

    it('should return 500 when database error occurs', async () => {
      Order.findById.mockImplementation((id, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app).get('/v1/orders/1');

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Error retrieving Order with id 1');
    });
  });
});
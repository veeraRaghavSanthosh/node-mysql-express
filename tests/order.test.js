const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Mock the database connection
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

const Order = require('../app/models/order.model.js');
const orderController = require('../app/controllers/order.controller.js');

// Create test app
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup routes
require('../app/routes/order.routes.js')(app);

describe('Order API Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /v1/orders', () => {
    it('should create a new order with valid payload', async () => {
      const mockOrder = {
        id: 1,
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 10.50,
        total_amount: 21.00,
        status: 'pending'
      };

      // Mock Order.create to simulate successful creation
      Order.create = jest.fn((order, callback) => {
        callback(null, mockOrder);
      });

      const orderPayload = {
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 10.50
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(201);

      expect(response.body).toEqual(mockOrder);
      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_id: 1,
          product_name: 'Test Product',
          quantity: 2,
          unit_price: 10.50,
          total_amount: 21.00,
          status: 'pending'
        }),
        expect.any(Function)
      );
    });

    it('should return 400 when customer_id is missing', async () => {
      const orderPayload = {
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 10.50
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('customer_id is required');
    });

    it('should return 400 when customer_id is not a positive integer', async () => {
      const orderPayload = {
        customer_id: -1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 10.50
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('customer_id must be a positive integer');
    });

    it('should return 400 when product_name is missing', async () => {
      const orderPayload = {
        customer_id: 1,
        quantity: 2,
        unit_price: 10.50
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('product_name is required');
    });

    it('should return 400 when product_name is empty string', async () => {
      const orderPayload = {
        customer_id: 1,
        product_name: '   ',
        quantity: 2,
        unit_price: 10.50
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('product_name must be a non-empty string');
    });

    it('should return 400 when product_name is too long', async () => {
      const orderPayload = {
        customer_id: 1,
        product_name: 'a'.repeat(256),
        quantity: 2,
        unit_price: 10.50
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('product_name must be less than 255 characters');
    });

    it('should return 400 when quantity is missing', async () => {
      const orderPayload = {
        customer_id: 1,
        product_name: 'Test Product',
        unit_price: 10.50
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('quantity is required');
    });

    it('should return 400 when quantity is not a positive integer', async () => {
      const orderPayload = {
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 0,
        unit_price: 10.50
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('quantity must be a positive integer');
    });

    it('should return 400 when unit_price is missing', async () => {
      const orderPayload = {
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('unit_price is required');
    });

    it('should return 400 when unit_price is not a positive number', async () => {
      const orderPayload = {
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: -10.50
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('unit_price must be a positive number');
    });

    it('should return 400 when status is invalid', async () => {
      const orderPayload = {
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 10.50,
        status: 'invalid_status'
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('status must be one of: pending, processing, shipped, delivered, cancelled');
    });

    it('should return 400 when order_date is invalid', async () => {
      const orderPayload = {
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 10.50,
        order_date: 'invalid-date'
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('order_date must be a valid date');
    });

    it('should return 400 when request body is empty', async () => {
      const response = await request(app)
        .post('/v1/orders')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toEqual(expect.arrayContaining([
        'customer_id is required',
        'product_name is required',
        'quantity is required',
        'unit_price is required'
      ]));
    });

    it('should return 500 when database error occurs', async () => {
      Order.create = jest.fn((order, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const orderPayload = {
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 10.50
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(500);

      expect(response.body.message).toBe('Database connection failed');
    });

    it('should accept valid status values', async () => {
      const mockOrder = {
        id: 1,
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 10.50,
        total_amount: 21.00,
        status: 'processing'
      };

      Order.create = jest.fn((order, callback) => {
        callback(null, mockOrder);
      });

      const orderPayload = {
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 10.50,
        status: 'processing'
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(201);

      expect(response.body).toEqual(mockOrder);
    });

    it('should use provided total_amount if given', async () => {
      const mockOrder = {
        id: 1,
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 10.50,
        total_amount: 25.00, // Custom total amount
        status: 'pending'
      };

      Order.create = jest.fn((order, callback) => {
        callback(null, mockOrder);
      });

      const orderPayload = {
        customer_id: 1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 10.50,
        total_amount: 25.00
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(orderPayload)
        .expect(201);

      expect(response.body).toEqual(mockOrder);
      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          total_amount: 25.00
        }),
        expect.any(Function)
      );
    });
  });

  describe('GET /v1/orders', () => {
    it('should retrieve all orders', async () => {
      const mockOrders = [
        { id: 1, customer_id: 1, product_name: 'Product 1', quantity: 1, unit_price: 10.00, total_amount: 10.00, status: 'pending' },
        { id: 2, customer_id: 2, product_name: 'Product 2', quantity: 2, unit_price: 15.00, total_amount: 30.00, status: 'shipped' }
      ];

      Order.getAll = jest.fn((callback) => {
        callback(null, mockOrders);
      });

      const response = await request(app)
        .get('/v1/orders')
        .expect(200);

      expect(response.body).toEqual(mockOrders);
    });

    it('should return 500 when database error occurs', async () => {
      Order.getAll = jest.fn((callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/v1/orders')
        .expect(500);

      expect(response.body.message).toBe('Database error');
    });
  });

  describe('GET /v1/orders/:orderId', () => {
    it('should retrieve a single order by ID', async () => {
      const mockOrder = { id: 1, customer_id: 1, product_name: 'Product 1', quantity: 1, unit_price: 10.00, total_amount: 10.00, status: 'pending' };

      Order.findById = jest.fn((id, callback) => {
        callback(null, mockOrder);
      });

      const response = await request(app)
        .get('/v1/orders/1')
        .expect(200);

      expect(response.body).toEqual(mockOrder);
    });

    it('should return 404 when order is not found', async () => {
      Order.findById = jest.fn((id, callback) => {
        callback({ kind: "not_found" }, null);
      });

      const response = await request(app)
        .get('/v1/orders/999')
        .expect(404);

      expect(response.body.message).toBe('Not found Order with id 999.');
    });

    it('should return 500 when database error occurs', async () => {
      Order.findById = jest.fn((id, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/v1/orders/1')
        .expect(500);

      expect(response.body.message).toBe('Error retrieving Order with id 1');
    });
  });
});
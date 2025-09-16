const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const Order = require('../app/models/order.model.js');

// Mock the Order model
jest.mock('../app/models/order.model.js');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import and setup routes
require('../app/routes/order.routes.js')(app);

describe('Order Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /v1/orders', () => {
    it('should create a new order with valid payload', async () => {
      const mockOrder = {
        id: 1,
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 29.99,
        total_amount: 59.98,
        status: 'pending',
        order_date: new Date()
      };

      Order.create.mockImplementation((order, callback) => {
        callback(null, mockOrder);
      });

      const payload = {
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 29.99
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(201);

      expect(response.body).toEqual(mockOrder);
      expect(Order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          customer_id: 123,
          product_name: 'Test Product',
          quantity: 2,
          unit_price: 29.99,
          total_amount: 59.98,
          status: 'pending'
        }),
        expect.any(Function)
      );
    });

    it('should return 400 when customer_id is missing', async () => {
      const payload = {
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 29.99
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('customer_id is required');
      expect(Order.create).not.toHaveBeenCalled();
    });

    it('should return 400 when customer_id is not a positive integer', async () => {
      const payload = {
        customer_id: -1,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 29.99
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('customer_id must be a positive integer');
    });

    it('should return 400 when product_name is missing', async () => {
      const payload = {
        customer_id: 123,
        quantity: 2,
        unit_price: 29.99
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('product_name is required');
    });

    it('should return 400 when product_name is empty string', async () => {
      const payload = {
        customer_id: 123,
        product_name: '   ',
        quantity: 2,
        unit_price: 29.99
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('product_name must be a non-empty string');
    });

    it('should return 400 when product_name exceeds 255 characters', async () => {
      const payload = {
        customer_id: 123,
        product_name: 'a'.repeat(256),
        quantity: 2,
        unit_price: 29.99
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('product_name must not exceed 255 characters');
    });

    it('should return 400 when quantity is missing', async () => {
      const payload = {
        customer_id: 123,
        product_name: 'Test Product',
        unit_price: 29.99
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('quantity is required');
    });

    it('should return 400 when quantity is not a positive integer', async () => {
      const payload = {
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 0,
        unit_price: 29.99
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('quantity must be a positive integer');
    });

    it('should return 400 when unit_price is missing', async () => {
      const payload = {
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 2
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('unit_price is required');
    });

    it('should return 400 when unit_price is negative', async () => {
      const payload = {
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: -10
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('unit_price must be a non-negative number');
    });

    it('should return 400 when status is invalid', async () => {
      const payload = {
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 29.99,
        status: 'invalid_status'
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('status must be one of: pending, confirmed, shipped, delivered, cancelled');
    });

    it('should accept valid status values', async () => {
      const mockOrder = {
        id: 1,
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 29.99,
        total_amount: 59.98,
        status: 'confirmed',
        order_date: new Date()
      };

      Order.create.mockImplementation((order, callback) => {
        callback(null, mockOrder);
      });

      const payload = {
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 29.99,
        status: 'confirmed'
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(201);

      expect(response.body.status).toBe('confirmed');
    });

    it('should return 400 when order_date is invalid', async () => {
      const payload = {
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 29.99,
        order_date: 'invalid-date'
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('order_date must be a valid date');
    });

    it('should handle database errors', async () => {
      Order.create.mockImplementation((order, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const payload = {
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 2,
        unit_price: 29.99
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(500);

      expect(response.body.message).toBe('Database connection failed');
    });

    it('should calculate total_amount correctly', async () => {
      let capturedOrder;
      Order.create.mockImplementation((order, callback) => {
        capturedOrder = order;
        callback(null, { id: 1, ...order });
      });

      const payload = {
        customer_id: 123,
        product_name: 'Test Product',
        quantity: 3,
        unit_price: 15.50
      };

      await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(201);

      expect(capturedOrder.total_amount).toBe(46.5); // 3 * 15.50
    });

    it('should trim whitespace from product_name', async () => {
      let capturedOrder;
      Order.create.mockImplementation((order, callback) => {
        capturedOrder = order;
        callback(null, { id: 1, ...order });
      });

      const payload = {
        customer_id: 123,
        product_name: '  Test Product  ',
        quantity: 1,
        unit_price: 10.00
      };

      await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(201);

      expect(capturedOrder.product_name).toBe('Test Product');
    });
  });

  describe('GET /v1/orders', () => {
    it('should retrieve all orders', async () => {
      const mockOrders = [
        { id: 1, customer_id: 123, product_name: 'Product 1' },
        { id: 2, customer_id: 456, product_name: 'Product 2' }
      ];

      Order.getAll.mockImplementation((callback) => {
        callback(null, mockOrders);
      });

      const response = await request(app)
        .get('/v1/orders')
        .expect(200);

      expect(response.body).toEqual(mockOrders);
      expect(Order.getAll).toHaveBeenCalled();
    });

    it('should handle database errors when retrieving orders', async () => {
      Order.getAll.mockImplementation((callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get('/v1/orders')
        .expect(500);

      expect(response.body.message).toContain('Some error occurred while retrieving orders');
    });
  });

  describe('GET /v1/orders/:orderId', () => {
    it('should retrieve a single order by ID', async () => {
      const mockOrder = { id: 1, customer_id: 123, product_name: 'Test Product' };

      Order.findById.mockImplementation((id, callback) => {
        callback(null, mockOrder);
      });

      const response = await request(app)
        .get('/v1/orders/1')
        .expect(200);

      expect(response.body).toEqual(mockOrder);
      expect(Order.findById).toHaveBeenCalledWith('1', expect.any(Function));
    });

    it('should return 404 when order is not found', async () => {
      Order.findById.mockImplementation((id, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      const response = await request(app)
        .get('/v1/orders/999')
        .expect(404);

      expect(response.body.message).toBe('Not found Order with id 999.');
    });
  });
});
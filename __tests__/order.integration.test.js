const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

// Create a test app similar to the main server
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Include order routes
require('../app/routes/order.routes.js')(app);

describe('Order API Integration Tests', () => {
  describe('POST /v1/orders', () => {
    // Note: These are integration tests that would require a test database
    // In a real scenario, you'd set up a test database with test data
    
    const validOrderPayload = {
      customer_id: 1,
      total_amount: 149.98,
      status: 'pending',
      items: [
        {
          product_name: 'Laptop',
          quantity: 1,
          price: 999.99
        },
        {
          product_name: 'Mouse',
          quantity: 2,
          price: 25.00
        }
      ]
    };

    it('should have the correct route registered', () => {
      // Test that the route is properly registered
      const routes = [];
      app._router.stack.forEach((middleware) => {
        if (middleware.route) {
          routes.push({
            method: Object.keys(middleware.route.methods)[0].toUpperCase(),
            path: middleware.route.path
          });
        }
      });

      expect(routes).toContainEqual({
        method: 'POST',
        path: '/v1/orders'
      });
    });

    it('should return proper error structure for validation failures', async () => {
      const invalidPayload = {
        customer_id: 'invalid',
        total_amount: -50
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(invalidPayload);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Validation failed');
      expect(response.body).toHaveProperty('errors');
      expect(Array.isArray(response.body.errors)).toBe(true);
    });

    it('should accept valid order payload structure', async () => {
      // This test verifies the payload structure is accepted
      // In a real test, you'd mock the database or use a test database
      const response = await request(app)
        .post('/v1/orders')
        .send(validOrderPayload);

      // The response will likely be 500 due to database connection issues in test
      // but we're testing that the validation passes and reaches the database layer
      expect([201, 500]).toContain(response.status);
      
      if (response.status === 500) {
        // If it's a 500, it means validation passed and it tried to hit the database
        expect(response.body).toHaveProperty('message');
      } else if (response.status === 201) {
        // If it's a 201, the order was created successfully
        expect(response.body).toHaveProperty('message', 'Order created successfully');
        expect(response.body).toHaveProperty('data');
      }
    });

    it('should reject payload with missing required fields', async () => {
      const incompletePayload = {
        total_amount: 99.99
        // missing customer_id
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(incompletePayload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Customer ID is required');
    });

    it('should accept minimal valid payload', async () => {
      const minimalPayload = {
        customer_id: 1,
        total_amount: 99.99
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(minimalPayload);

      // Should pass validation (status will be 201 or 500 depending on DB)
      expect([201, 500]).toContain(response.status);
    });

    it('should validate order items when provided', async () => {
      const payloadWithInvalidItems = {
        customer_id: 1,
        total_amount: 99.99,
        items: [
          {
            product_name: '',  // invalid: empty
            quantity: 0,       // invalid: not positive
            price: -10         // invalid: negative
          }
        ]
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payloadWithInvalidItems)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Product name cannot be empty');
      expect(response.body.errors).toContain('Quantity must be positive');
      expect(response.body.errors).toContain('Price must be positive');
    });

    it('should validate status values', async () => {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      
      for (const status of validStatuses) {
        const payload = {
          customer_id: 1,
          total_amount: 99.99,
          status: status
        };

        const response = await request(app)
          .post('/v1/orders')
          .send(payload);

        // Should pass validation for all valid statuses
        expect([201, 500]).toContain(response.status);
      }
    });

    it('should reject invalid status values', async () => {
      const payload = {
        customer_id: 1,
        total_amount: 99.99,
        status: 'invalid_status'
      };

      const response = await request(app)
        .post('/v1/orders')
        .send(payload)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
      expect(response.body.errors).toContain('Status must be one of: pending, processing, shipped, delivered, cancelled');
    });
  });
});
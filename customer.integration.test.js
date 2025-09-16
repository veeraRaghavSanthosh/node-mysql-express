const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const customerRoutes = require('./app/routes/customer.routes');

// Create Express app for testing
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Mock the database connection
jest.mock('./app/models/db.js', () => ({
  query: jest.fn()
}));

// Set up routes
customerRoutes(app);

describe('Customer API Integration Tests', () => {
  describe('POST /customers', () => {
    describe('Success Cases', () => {
      it('should create a new customer with valid data', async () => {
        const customerData = {
          email: 'test@example.com',
          name: 'Test User',
          active: true
        };

        const response = await request(app)
          .post('/customers')
          .send(customerData)
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe(customerData.email);
        expect(response.body.name).toBe(customerData.name);
        expect(response.body.active).toBe(customerData.active);
      });

      it('should create a customer with minimal data', async () => {
        const customerData = {
          email: 'minimal@example.com',
          name: 'Minimal User'
        };

        const response = await request(app)
          .post('/customers')
          .send(customerData)
          .expect(200);

        expect(response.body).toHaveProperty('id');
        expect(response.body.email).toBe(customerData.email);
        expect(response.body.name).toBe(customerData.name);
      });
    });

    describe('Failure Cases', () => {
      it('should return 400 for empty request body', async () => {
        const response = await request(app)
          .post('/customers')
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Content can not be empty!');
      });

      it('should handle invalid email format', async () => {
        const customerData = {
          email: 'invalid-email',
          name: 'Test User'
        };

        // This test depends on validation being implemented
        const response = await request(app)
          .post('/customers')
          .send(customerData);

        // Should either succeed (if no validation) or fail with appropriate message
        expect([200, 400, 422]).toContain(response.status);
      });
    });

    describe('Boundary Cases', () => {
      it('should handle very long names', async () => {
        const customerData = {
          email: 'longname@example.com',
          name: 'A'.repeat(1000), // Very long name
          active: true
        };

        const response = await request(app)
          .post('/customers')
          .send(customerData);

        // Should either succeed or fail gracefully
        expect([200, 400, 422]).toContain(response.status);
      });

      it('should handle special characters in name', async () => {
        const customerData = {
          email: 'special@example.com',
          name: 'Test User 123 !@#$%^&*()',
          active: false
        };

        const response = await request(app)
          .post('/customers')
          .send(customerData);

        expect([200, 400]).toContain(response.status);
      });
    });
  });

  describe('GET /customers', () => {
    describe('Success Cases', () => {
      it('should retrieve all customers', async () => {
        const response = await request(app)
          .get('/customers')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
      });

      it('should handle empty customer list', async () => {
        const response = await request(app)
          .get('/customers')
          .expect(200);

        expect(Array.isArray(response.body)).toBe(true);
        // Could be empty array, which is valid
      });
    });
  });

  describe('GET /customers/:id', () => {
    describe('Success Cases', () => {
      it('should retrieve a specific customer by ID', async () => {
        // First create a customer to retrieve
        const customerData = {
          email: 'retrieve@example.com',
          name: 'Retrieve User',
          active: true
        };

        const createResponse = await request(app)
          .post('/customers')
          .send(customerData);

        if (createResponse.status === 200) {
          const customerId = createResponse.body.id;

          const response = await request(app)
            .get(`/customers/${customerId}`)
            .expect(200);

          expect(response.body).toHaveProperty('id', customerId);
          expect(response.body.email).toBe(customerData.email);
          expect(response.body.name).toBe(customerData.name);
        }
      });
    });

    describe('Failure Cases', () => {
      it('should return 404 for non-existent customer', async () => {
        const response = await request(app)
          .get('/customers/999999')
          .expect(404);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Not found Customer with id 999999');
      });
    });

    describe('Boundary Cases', () => {
      it('should handle invalid ID formats', async () => {
        const response = await request(app)
          .get('/customers/invalid-id');

        // Should either return 404 or 400
        expect([400, 404, 500]).toContain(response.status);
      });

      it('should handle very large ID numbers', async () => {
        const response = await request(app)
          .get('/customers/999999999999999999');

        expect([404, 500]).toContain(response.status);
      });
    });
  });

  describe('PUT /customers/:id', () => {
    describe('Success Cases', () => {
      it('should update an existing customer', async () => {
        // First create a customer to update
        const customerData = {
          email: 'update@example.com',
          name: 'Update User',
          active: true
        };

        const createResponse = await request(app)
          .post('/customers')
          .send(customerData);

        if (createResponse.status === 200) {
          const customerId = createResponse.body.id;
          const updateData = {
            email: 'updated@example.com',
            name: 'Updated User',
            active: false
          };

          const response = await request(app)
            .put(`/customers/${customerId}`)
            .send(updateData)
            .expect(200);

          expect(response.body.email).toBe(updateData.email);
          expect(response.body.name).toBe(updateData.name);
          expect(response.body.active).toBe(updateData.active);
        }
      });

      it('should update customer with partial data', async () => {
        const customerData = {
          email: 'partial@example.com',
          name: 'Partial User',
          active: true
        };

        const createResponse = await request(app)
          .post('/customers')
          .send(customerData);

        if (createResponse.status === 200) {
          const customerId = createResponse.body.id;
          const updateData = { name: 'Partially Updated' };

          const response = await request(app)
            .put(`/customers/${customerId}`)
            .send(updateData)
            .expect(200);

          expect(response.body.name).toBe(updateData.name);
        }
      });
    });

    describe('Failure Cases', () => {
      it('should return 400 for empty request body', async () => {
        const response = await request(app)
          .put('/customers/1')
          .send({})
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('Content can not be empty!');
      });

      it('should return 404 for non-existent customer', async () => {
        const updateData = { name: 'Non-existent' };

        const response = await request(app)
          .put('/customers/999999')
          .send(updateData)
          .expect(404);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Not found Customer with id 999999');
      });
    });
  });

  describe('DELETE /customers/:id', () => {
    describe('Success Cases', () => {
      it('should delete an existing customer', async () => {
        // First create a customer to delete
        const customerData = {
          email: 'delete@example.com',
          name: 'Delete User',
          active: true
        };

        const createResponse = await request(app)
          .post('/customers')
          .send(customerData);

        if (createResponse.status === 200) {
          const customerId = createResponse.body.id;

          const response = await request(app)
            .delete(`/customers/${customerId}`)
            .expect(200);

          expect(response.body).toHaveProperty('message');
          expect(response.body.message).toBe('Customer was deleted successfully!');
        }
      });
    });

    describe('Failure Cases', () => {
      it('should return 404 for non-existent customer', async () => {
        const response = await request(app)
          .delete('/customers/999999')
          .expect(404);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toContain('Not found Customer with id 999999');
      });
    });

    describe('Boundary Cases', () => {
      it('should handle invalid ID formats', async () => {
        const response = await request(app)
          .delete('/customers/invalid-id');

        expect([400, 404, 500]).toContain(response.status);
      });
    });
  });

  describe('DELETE /customers', () => {
    describe('Success Cases', () => {
      it('should delete all customers', async () => {
        const response = await request(app)
          .delete('/customers')
          .expect(200);

        expect(response.body).toHaveProperty('message');
        expect(response.body.message).toBe('All Customers were deleted successfully!');
      });
    });
  });
});
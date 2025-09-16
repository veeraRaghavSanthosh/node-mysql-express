const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const paymentController = require('../app/controllers/payment.controller.js');

// Mock the Payment model
jest.mock('../app/models/payment.model.js');
const Payment = require('../app/models/payment.model.js');

// Create Express app for testing
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup routes
app.post('/payments', paymentController.create);
app.get('/payments/:paymentId', paymentController.findOne);
app.post('/payments/:paymentId/process', paymentController.process);

describe('Payment Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /payments (create)', () => {
    it('should create a payment successfully', async () => {
      const paymentData = {
        customer_id: 1,
        amount: 100.50,
        currency: 'USD',
        payment_method: 'credit_card',
        description: 'Test payment'
      };

      const mockResult = { id: 123, ...paymentData };

      Payment.create = jest.fn((payment, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .post('/payments')
        .send(paymentData)
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(Payment.create).toHaveBeenCalledWith(
        expect.objectContaining(paymentData),
        expect.any(Function)
      );
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app)
        .post('/payments')
        .expect(400);

      expect(response.body).toEqual({
        message: 'Content can not be empty!'
      });
      expect(Payment.create).not.toHaveBeenCalled();
    });

    it('should return 400 for validation errors', async () => {
      const paymentData = {
        customer_id: 1,
        amount: -50,
        currency: 'USD'
      };

      Payment.create = jest.fn((payment, callback) => {
        callback({ message: 'Amount must be greater than 0' }, null);
      });

      const response = await request(app)
        .post('/payments')
        .send(paymentData)
        .expect(400);

      expect(response.body).toEqual({
        message: 'Amount must be greater than 0'
      });
    });

    it('should return 500 for database errors', async () => {
      const paymentData = {
        customer_id: 1,
        amount: 100.50,
        currency: 'USD'
      };

      Payment.create = jest.fn((payment, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      const response = await request(app)
        .post('/payments')
        .send(paymentData)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Database connection failed'
      });
    });

    // Boundary case: missing required fields
    it('should handle missing customer_id', async () => {
      const paymentData = {
        amount: 100.50,
        currency: 'USD'
      };

      Payment.create = jest.fn((payment, callback) => {
        callback({ message: 'Missing required fields' }, null);
      });

      const response = await request(app)
        .post('/payments')
        .send(paymentData)
        .expect(400);

      expect(response.body).toEqual({
        message: 'Missing required fields'
      });
    });

    // Boundary case: very large amounts
    it('should handle very large payment amounts', async () => {
      const paymentData = {
        customer_id: 1,
        amount: 999999999.99,
        currency: 'USD'
      };

      const mockResult = { id: 456, ...paymentData };
      Payment.create = jest.fn((payment, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .post('/payments')
        .send(paymentData)
        .expect(200);

      expect(response.body).toEqual(mockResult);
    });
  });

  describe('GET /payments/:paymentId (findOne)', () => {
    it('should find a payment by id successfully', async () => {
      const paymentId = '123';
      const mockPayment = {
        id: 123,
        customer_id: 1,
        amount: 100.50,
        currency: 'USD',
        status: 'pending'
      };

      Payment.findById = jest.fn((id, callback) => {
        callback(null, mockPayment);
      });

      const response = await request(app)
        .get(`/payments/${paymentId}`)
        .expect(200);

      expect(response.body).toEqual(mockPayment);
      expect(Payment.findById).toHaveBeenCalledWith(
        paymentId,
        expect.any(Function)
      );
    });

    it('should return 404 when payment not found', async () => {
      const paymentId = '999';

      Payment.findById = jest.fn((id, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      const response = await request(app)
        .get(`/payments/${paymentId}`)
        .expect(404);

      expect(response.body).toEqual({
        message: `Not found Payment with id ${paymentId}.`
      });
    });

    it('should return 500 for database errors', async () => {
      const paymentId = '123';

      Payment.findById = jest.fn((id, callback) => {
        callback(new Error('Database error'), null);
      });

      const response = await request(app)
        .get(`/payments/${paymentId}`)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Error retrieving Payment with id ' + paymentId
      });
    });

    // Boundary case: invalid payment ID formats
    it('should handle non-numeric payment IDs', async () => {
      const paymentId = 'abc123';
      const mockPayment = { id: 'abc123', amount: 50 };

      Payment.findById = jest.fn((id, callback) => {
        callback(null, mockPayment);
      });

      const response = await request(app)
        .get(`/payments/${paymentId}`)
        .expect(200);

      expect(response.body).toEqual(mockPayment);
    });
  });

  describe('POST /payments/:paymentId/process (process)', () => {
    it('should process a payment successfully', async () => {
      const paymentId = '123';
      const mockResult = {
        id: 123,
        status: 'completed',
        success: true
      };

      Payment.processPayment = jest.fn((id, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .post(`/payments/${paymentId}/process`)
        .expect(200);

      expect(response.body).toEqual(mockResult);
      expect(Payment.processPayment).toHaveBeenCalledWith(
        paymentId,
        expect.any(Function)
      );
    });

    it('should process a payment with failure', async () => {
      const paymentId = '123';
      const mockResult = {
        id: 123,
        status: 'failed',
        success: false
      };

      Payment.processPayment = jest.fn((id, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .post(`/payments/${paymentId}/process`)
        .expect(200);

      expect(response.body).toEqual(mockResult);
    });

    it('should return 404 when payment not found', async () => {
      const paymentId = '999';

      Payment.processPayment = jest.fn((id, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      const response = await request(app)
        .post(`/payments/${paymentId}/process`)
        .expect(404);

      expect(response.body).toEqual({
        message: `Not found Payment with id ${paymentId}.`
      });
    });

    it('should return 400 for invalid payment state', async () => {
      const paymentId = '123';

      Payment.processPayment = jest.fn((id, callback) => {
        callback({ message: 'Payment must be pending to process' }, null);
      });

      const response = await request(app)
        .post(`/payments/${paymentId}/process`)
        .expect(400);

      expect(response.body).toEqual({
        message: 'Payment must be pending to process'
      });
    });

    it('should return 500 for database errors', async () => {
      const paymentId = '123';

      Payment.processPayment = jest.fn((id, callback) => {
        callback(new Error('Processing failed'), null);
      });

      const response = await request(app)
        .post(`/payments/${paymentId}/process`)
        .expect(500);

      expect(response.body).toEqual({
        message: 'Error processing Payment with id ' + paymentId
      });
    });

    // Boundary case: processing already processed payment
    it('should handle attempting to process already completed payment', async () => {
      const paymentId = '123';

      Payment.processPayment = jest.fn((id, callback) => {
        callback({ message: 'Payment must be pending to process' }, null);
      });

      const response = await request(app)
        .post(`/payments/${paymentId}/process`)
        .expect(400);

      expect(response.body.message).toContain('Payment must be pending to process');
    });

    // Boundary case: processing cancelled payment
    it('should handle attempting to process cancelled payment', async () => {
      const paymentId = '123';

      Payment.processPayment = jest.fn((id, callback) => {
        callback({ message: 'Payment must be pending to process' }, null);
      });

      const response = await request(app)
        .post(`/payments/${paymentId}/process`)
        .expect(400);

      expect(response.body.message).toContain('Payment must be pending to process');
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/payments')
        .send('invalid json')
        .set('Content-Type', 'application/json')
        .expect(400);

      // Express will handle malformed JSON before our controller
    });

    it('should handle very long payment descriptions', async () => {
      const paymentData = {
        customer_id: 1,
        amount: 100.50,
        currency: 'USD',
        description: 'A'.repeat(1000) // Very long description
      };

      const mockResult = { id: 789, ...paymentData };
      Payment.create = jest.fn((payment, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .post('/payments')
        .send(paymentData)
        .expect(200);

      expect(response.body).toEqual(mockResult);
    });

    it('should handle special characters in payment description', async () => {
      const paymentData = {
        customer_id: 1,
        amount: 100.50,
        currency: 'USD',
        description: 'Payment with special chars: !@#$%^&*()'
      };

      const mockResult = { id: 101, ...paymentData };
      Payment.create = jest.fn((payment, callback) => {
        callback(null, mockResult);
      });

      const response = await request(app)
        .post('/payments')
        .send(paymentData)
        .expect(200);

      expect(response.body).toEqual(mockResult);
    });
  });
});

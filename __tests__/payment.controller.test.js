const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const Payment = require('../app/models/payment.model');
const logger = require('../app/config/logger.config');

// Mock the Payment model
jest.mock('../app/models/payment.model');

// Mock the logger
jest.mock('../app/config/logger.config', () => ({
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

// Create Express app for testing
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Import payment controller after mocking
const paymentController = require('../app/controllers/payment.controller');

// Setup routes
app.post('/payments', paymentController.create);
app.get('/payments', paymentController.findAll);
app.get('/payments/:paymentId', paymentController.findOne);
app.get('/customers/:customerId/payments', paymentController.findByCustomerId);
app.put('/payments/:paymentId', paymentController.update);
app.delete('/payments/:paymentId', paymentController.delete);

describe('Payment Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /payments', () => {
    it('should create a payment successfully and log appropriately', async () => {
      const mockPaymentData = {
        customer_id: 1,
        amount: 100.50,
        currency: 'USD',
        payment_method: 'credit_card'
      };

      const mockCreatedPayment = {
        id: 123,
        ...mockPaymentData,
        status: 'completed',
        transaction_id: 'txn_123456789'
      };

      Payment.processPayment.mockImplementation((data, callback) => {
        callback(null, mockCreatedPayment);
      });

      const response = await request(app)
        .post('/payments')
        .send(mockPaymentData)
        .expect(200);

      expect(response.body).toEqual(mockCreatedPayment);
      expect(Payment.processPayment).toHaveBeenCalledWith(mockPaymentData, expect.any(Function));
      
      // Verify logging calls
      expect(logger.trace).toHaveBeenCalledWith('Payment controller create called', expect.objectContaining({
        body: mockPaymentData
      }));
      expect(logger.info).toHaveBeenCalledWith('Processing new payment request', expect.objectContaining({
        customer_id: mockPaymentData.customer_id,
        amount: mockPaymentData.amount
      }));
      expect(logger.info).toHaveBeenCalledWith('Payment processed successfully in controller', expect.objectContaining({
        payment_id: mockCreatedPayment.id,
        status: mockCreatedPayment.status
      }));
    });

    it('should return 400 for empty request body and log warning', async () => {
      const response = await request(app)
        .post('/payments')
        .send()
        .expect(400);

      expect(response.body.message).toBe('Content can not be empty!');
      expect(logger.warn).toHaveBeenCalledWith('Payment creation attempted with empty body', expect.any(Object));
    });

    it('should return 400 for missing required fields and log warning', async () => {
      const incompleteData = {
        customer_id: 1,
        // missing amount and payment_method
      };

      const response = await request(app)
        .post('/payments')
        .send(incompleteData)
        .expect(400);

      expect(response.body.message).toContain('Missing required fields');
      expect(logger.warn).toHaveBeenCalledWith('Payment creation attempted with missing required fields', expect.objectContaining({
        missing_fields: expect.arrayContaining(['amount', 'payment_method'])
      }));
    });

    it('should return 400 for invalid amount and log warning', async () => {
      const invalidData = {
        customer_id: 1,
        amount: -50, // invalid negative amount
        payment_method: 'credit_card'
      };

      const response = await request(app)
        .post('/payments')
        .send(invalidData)
        .expect(400);

      expect(response.body.message).toBe('Amount must be a positive number');
      expect(logger.warn).toHaveBeenCalledWith('Payment creation attempted with invalid amount', expect.objectContaining({
        amount: invalidData.amount
      }));
    });

    it('should handle payment processing errors and log appropriately', async () => {
      const mockPaymentData = {
        customer_id: 1,
        amount: 100.50,
        payment_method: 'credit_card'
      };

      const mockError = new Error('Payment processing failed');
      Payment.processPayment.mockImplementation((data, callback) => {
        callback(mockError, null);
      });

      const response = await request(app)
        .post('/payments')
        .send(mockPaymentData)
        .expect(500);

      expect(response.body.message).toBe('Payment processing failed');
      expect(logger.error).toHaveBeenCalledWith('Payment processing failed in controller', expect.objectContaining({
        error: mockError.message
      }));
    });
  });

  describe('GET /payments', () => {
    it('should retrieve all payments and log appropriately', async () => {
      const mockPayments = [
        { id: 1, customer_id: 1, amount: 100.50 },
        { id: 2, customer_id: 2, amount: 200.75 }
      ];

      Payment.getAll.mockImplementation((callback) => {
        callback(null, mockPayments);
      });

      const response = await request(app)
        .get('/payments')
        .expect(200);

      expect(response.body).toEqual(mockPayments);
      expect(Payment.getAll).toHaveBeenCalledWith(expect.any(Function));
      
      // Verify logging calls
      expect(logger.trace).toHaveBeenCalledWith('Payment controller findAll called', expect.any(Object));
      expect(logger.debug).toHaveBeenCalledWith('Retrieving all payments', expect.any(Object));
      expect(logger.info).toHaveBeenCalledWith('Successfully retrieved all payments', expect.objectContaining({
        count: mockPayments.length
      }));
    });

    it('should handle database errors and log appropriately', async () => {
      const mockError = new Error('Database connection failed');
      Payment.getAll.mockImplementation((callback) => {
        callback(mockError, null);
      });

      const response = await request(app)
        .get('/payments')
        .expect(500);

      expect(response.body.message).toBe('Database connection failed');
      expect(logger.error).toHaveBeenCalledWith('Error retrieving all payments in controller', expect.objectContaining({
        error: mockError.message
      }));
    });
  });

  describe('GET /payments/:paymentId', () => {
    it('should retrieve payment by ID and log appropriately', async () => {
      const mockPayment = {
        id: 123,
        customer_id: 1,
        amount: 100.50,
        status: 'completed'
      };

      Payment.findById.mockImplementation((id, callback) => {
        callback(null, mockPayment);
      });

      const response = await request(app)
        .get('/payments/123')
        .expect(200);

      expect(response.body).toEqual(mockPayment);
      expect(Payment.findById).toHaveBeenCalledWith('123', expect.any(Function));
      
      // Verify logging calls
      expect(logger.trace).toHaveBeenCalledWith('Payment controller findOne called', expect.objectContaining({
        payment_id: '123'
      }));
      expect(logger.info).toHaveBeenCalledWith('Successfully retrieved payment', expect.objectContaining({
        payment_id: '123',
        customer_id: mockPayment.customer_id
      }));
    });

    it('should return 404 when payment not found and log warning', async () => {
      Payment.findById.mockImplementation((id, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      const response = await request(app)
        .get('/payments/999')
        .expect(404);

      expect(response.body.message).toContain('Not found Payment with id 999');
      expect(logger.warn).toHaveBeenCalledWith('Payment not found', expect.objectContaining({
        payment_id: '999'
      }));
    });
  });

  describe('GET /customers/:customerId/payments', () => {
    it('should retrieve payments by customer ID and log appropriately', async () => {
      const mockPayments = [
        { id: 1, customer_id: 1, amount: 100.50 },
        { id: 2, customer_id: 1, amount: 75.25 }
      ];

      Payment.getByCustomerId.mockImplementation((customerId, callback) => {
        callback(null, mockPayments);
      });

      const response = await request(app)
        .get('/customers/1/payments')
        .expect(200);

      expect(response.body).toEqual(mockPayments);
      expect(Payment.getByCustomerId).toHaveBeenCalledWith('1', expect.any(Function));
      
      // Verify logging calls
      expect(logger.trace).toHaveBeenCalledWith('Payment controller findByCustomerId called', expect.objectContaining({
        customer_id: '1'
      }));
      expect(logger.info).toHaveBeenCalledWith('Successfully retrieved payments for customer', expect.objectContaining({
        customer_id: '1',
        count: mockPayments.length
      }));
    });
  });

  describe('PUT /payments/:paymentId', () => {
    it('should update payment and log appropriately', async () => {
      const updateData = {
        customer_id: 1,
        amount: 150.75,
        status: 'completed'
      };

      const mockUpdatedPayment = {
        id: 123,
        ...updateData
      };

      Payment.updateById.mockImplementation((id, data, callback) => {
        callback(null, mockUpdatedPayment);
      });

      const response = await request(app)
        .put('/payments/123')
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual(mockUpdatedPayment);
      expect(Payment.updateById).toHaveBeenCalledWith('123', expect.any(Object), expect.any(Function));
      
      // Verify logging calls
      expect(logger.trace).toHaveBeenCalledWith('Payment controller update called', expect.objectContaining({
        payment_id: '123'
      }));
      expect(logger.info).toHaveBeenCalledWith('Payment updated successfully', expect.objectContaining({
        payment_id: '123'
      }));
    });

    it('should return 400 for empty request body', async () => {
      const response = await request(app)
        .put('/payments/123')
        .send()
        .expect(400);

      expect(response.body.message).toBe('Content can not be empty!');
      expect(logger.warn).toHaveBeenCalledWith('Payment update attempted with empty body', expect.objectContaining({
        payment_id: '123'
      }));
    });
  });

  describe('DELETE /payments/:paymentId', () => {
    it('should delete payment and log appropriately', async () => {
      Payment.remove.mockImplementation((id, callback) => {
        callback(null, { affectedRows: 1 });
      });

      const response = await request(app)
        .delete('/payments/123')
        .expect(200);

      expect(response.body.message).toBe('Payment was deleted successfully!');
      expect(Payment.remove).toHaveBeenCalledWith('123', expect.any(Function));
      
      // Verify logging calls
      expect(logger.trace).toHaveBeenCalledWith('Payment controller delete called', expect.objectContaining({
        payment_id: '123'
      }));
      expect(logger.info).toHaveBeenCalledWith('Payment deleted successfully', expect.objectContaining({
        payment_id: '123'
      }));
    });

    it('should return 404 when payment not found for deletion', async () => {
      Payment.remove.mockImplementation((id, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      const response = await request(app)
        .delete('/payments/999')
        .expect(404);

      expect(response.body.message).toContain('Not found Payment with id 999');
      expect(logger.warn).toHaveBeenCalledWith('Payment not found for deletion', expect.objectContaining({
        payment_id: '999'
      }));
    });
  });
});
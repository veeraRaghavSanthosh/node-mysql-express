const Payment = require('../app/models/payment.model');
const logger = require('../app/config/logger.config');

// Mock the database connection
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

// Mock the logger to avoid console output during tests
jest.mock('../app/config/logger.config', () => ({
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
}));

const mockDb = require('../app/models/db.js');

describe('Payment Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Payment.create', () => {
    it('should create a new payment and log appropriately', (done) => {
      const mockPayment = {
        customer_id: 1,
        amount: 100.50,
        currency: 'USD',
        payment_method: 'credit_card',
        status: 'pending'
      };

      const mockResult = { insertId: 123 };
      mockDb.query.mockImplementation((query, data, callback) => {
        callback(null, mockResult);
      });

      Payment.create(mockPayment, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({ id: 123, ...mockPayment });
        
        // Verify logging calls
        expect(logger.trace).toHaveBeenCalledWith('Payment.create called', {
          customer_id: mockPayment.customer_id,
          amount: mockPayment.amount,
          currency: mockPayment.currency,
          payment_method: mockPayment.payment_method
        });
        expect(logger.debug).toHaveBeenCalledWith('Attempting to create payment in database', {
          payment_data: mockPayment
        });
        expect(logger.info).toHaveBeenCalledWith('Payment created successfully', {
          payment_id: 123,
          customer_id: mockPayment.customer_id,
          amount: mockPayment.amount,
          currency: mockPayment.currency
        });
        expect(logger.trace).toHaveBeenCalledWith('Payment.create completed', {
          payment: { id: 123, ...mockPayment }
        });
        
        done();
      });
    });

    it('should handle database errors and log appropriately', (done) => {
      const mockPayment = {
        customer_id: 1,
        amount: 100.50,
        payment_method: 'credit_card'
      };

      const mockError = new Error('Database connection failed');
      mockDb.query.mockImplementation((query, data, callback) => {
        callback(mockError, null);
      });

      Payment.create(mockPayment, (err, result) => {
        expect(err).toBe(mockError);
        expect(result).toBeNull();
        
        // Verify error logging
        expect(logger.error).toHaveBeenCalledWith('Error creating payment', {
          error: mockError.message,
          stack: mockError.stack,
          customer_id: mockPayment.customer_id,
          amount: mockPayment.amount
        });
        
        done();
      });
    });
  });

  describe('Payment.findById', () => {
    it('should find payment by ID and log appropriately', (done) => {
      const paymentId = 123;
      const mockPayment = {
        id: 123,
        customer_id: 1,
        amount: 100.50,
        status: 'completed'
      };

      mockDb.query.mockImplementation((query, callback) => {
        callback(null, [mockPayment]);
      });

      Payment.findById(paymentId, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual(mockPayment);
        
        // Verify logging calls
        expect(logger.trace).toHaveBeenCalledWith('Payment.findById called', {
          payment_id: paymentId
        });
        expect(logger.debug).toHaveBeenCalledWith('Querying payment by ID', {
          payment_id: paymentId
        });
        expect(logger.info).toHaveBeenCalledWith('Payment found', {
          payment_id: paymentId,
          customer_id: mockPayment.customer_id,
          amount: mockPayment.amount,
          status: mockPayment.status
        });
        
        done();
      });
    });

    it('should handle payment not found and log appropriately', (done) => {
      const paymentId = 999;

      mockDb.query.mockImplementation((query, callback) => {
        callback(null, []);
      });

      Payment.findById(paymentId, (err, result) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(result).toBeNull();
        
        // Verify warning log
        expect(logger.warn).toHaveBeenCalledWith('Payment not found', {
          payment_id: paymentId
        });
        
        done();
      });
    });

    it('should handle database errors and log appropriately', (done) => {
      const paymentId = 123;
      const mockError = new Error('Database error');

      mockDb.query.mockImplementation((query, callback) => {
        callback(mockError, null);
      });

      Payment.findById(paymentId, (err, result) => {
        expect(err).toBe(mockError);
        expect(result).toBeNull();
        
        // Verify error logging
        expect(logger.error).toHaveBeenCalledWith('Error finding payment by ID', {
          error: mockError.message,
          stack: mockError.stack,
          payment_id: paymentId
        });
        
        done();
      });
    });
  });

  describe('Payment.getAll', () => {
    it('should retrieve all payments and log appropriately', (done) => {
      const mockPayments = [
        { id: 1, customer_id: 1, amount: 100.50 },
        { id: 2, customer_id: 2, amount: 200.75 }
      ];

      mockDb.query.mockImplementation((query, callback) => {
        callback(null, mockPayments);
      });

      Payment.getAll((err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual(mockPayments);
        
        // Verify logging calls
        expect(logger.trace).toHaveBeenCalledWith('Payment.getAll called');
        expect(logger.debug).toHaveBeenCalledWith('Querying all payments from database');
        expect(logger.info).toHaveBeenCalledWith('Retrieved all payments', {
          count: mockPayments.length
        });
        
        done();
      });
    });
  });

  describe('Payment.processPayment', () => {
    beforeEach(() => {
      // Mock setTimeout to make tests run faster
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should process payment successfully and log all steps', (done) => {
      const mockPaymentData = {
        customer_id: 1,
        amount: 100.50,
        currency: 'USD',
        payment_method: 'credit_card'
      };

      // Mock successful creation
      mockDb.query.mockImplementation((query, data, callback) => {
        if (query.includes('INSERT')) {
          callback(null, { insertId: 123 });
        } else if (query.includes('UPDATE')) {
          callback(null, { affectedRows: 1 });
        }
      });

      // Mock Math.random to ensure success (> 0.1)
      jest.spyOn(Math, 'random').mockReturnValue(0.5);

      Payment.processPayment(mockPaymentData, (err, result) => {
        expect(err).toBeNull();
        expect(result.status).toBe('completed');
        expect(result.transaction_id).toMatch(/^txn_\d+_[a-z0-9]+$/);
        
        // Verify trace and info logging for processing start
        expect(logger.trace).toHaveBeenCalledWith('Payment.processPayment called', {
          customer_id: mockPaymentData.customer_id,
          amount: mockPaymentData.amount,
          payment_method: mockPaymentData.payment_method
        });
        expect(logger.info).toHaveBeenCalledWith('Starting payment processing', {
          customer_id: mockPaymentData.customer_id,
          amount: mockPaymentData.amount,
          currency: mockPaymentData.currency,
          payment_method: mockPaymentData.payment_method
        });
        
        // Verify successful completion logging
        expect(logger.info).toHaveBeenCalledWith(
          'Payment processed successfully',
          expect.objectContaining({
            payment_id: 123,
            customer_id: mockPaymentData.customer_id,
            amount: mockPaymentData.amount,
            final_status: 'completed'
          })
        );
        
        Math.random.mockRestore();
        done();
      });

      // Fast-forward time to trigger the setTimeout callback
      jest.runAllTimers();
    });

    it('should handle payment processing failure and log appropriately', (done) => {
      const mockPaymentData = {
        customer_id: 1,
        amount: 100.50,
        payment_method: 'credit_card'
      };

      // Mock successful creation but failed processing
      mockDb.query.mockImplementation((query, data, callback) => {
        if (query.includes('INSERT')) {
          callback(null, { insertId: 123 });
        } else if (query.includes('UPDATE')) {
          callback(null, { affectedRows: 1 });
        }
      });

      // Mock Math.random to ensure failure (<= 0.1)
      jest.spyOn(Math, 'random').mockReturnValue(0.05);

      Payment.processPayment(mockPaymentData, (err, result) => {
        expect(err).toBeNull();
        expect(result.status).toBe('failed');
        
        // Verify warning logging for failed processing
        expect(logger.warn).toHaveBeenCalledWith(
          'Payment processing failed',
          expect.objectContaining({
            payment_id: 123,
            customer_id: mockPaymentData.customer_id,
            amount: mockPaymentData.amount,
            final_status: 'failed'
          })
        );
        
        Math.random.mockRestore();
        done();
      });

      jest.runAllTimers();
    });
  });

  describe('Payment.updateById', () => {
    it('should update payment and log appropriately', (done) => {
      const paymentId = 123;
      const updateData = {
        customer_id: 1,
        amount: 150.75,
        status: 'completed'
      };

      mockDb.query.mockImplementation((query, data, callback) => {
        callback(null, { affectedRows: 1 });
      });

      Payment.updateById(paymentId, updateData, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({ id: paymentId, ...updateData });
        
        // Verify logging calls
        expect(logger.trace).toHaveBeenCalledWith('Payment.updateById called', {
          payment_id: paymentId,
          update_data: updateData
        });
        expect(logger.info).toHaveBeenCalledWith('Payment updated successfully', {
          payment_id: paymentId,
          status: updateData.status,
          amount: updateData.amount
        });
        
        done();
      });
    });

    it('should handle payment not found for update', (done) => {
      const paymentId = 999;
      const updateData = { status: 'completed' };

      mockDb.query.mockImplementation((query, data, callback) => {
        callback(null, { affectedRows: 0 });
      });

      Payment.updateById(paymentId, updateData, (err, result) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(result).toBeNull();
        
        // Verify warning log
        expect(logger.warn).toHaveBeenCalledWith('Payment not found for update', {
          payment_id: paymentId
        });
        
        done();
      });
    });
  });

  describe('Payment.remove', () => {
    it('should delete payment and log appropriately', (done) => {
      const paymentId = 123;

      mockDb.query.mockImplementation((query, data, callback) => {
        callback(null, { affectedRows: 1 });
      });

      Payment.remove(paymentId, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({ affectedRows: 1 });
        
        // Verify logging calls
        expect(logger.trace).toHaveBeenCalledWith('Payment.remove called', {
          payment_id: paymentId
        });
        expect(logger.debug).toHaveBeenCalledWith('Attempting to delete payment', {
          payment_id: paymentId
        });
        expect(logger.info).toHaveBeenCalledWith('Payment deleted successfully', {
          payment_id: paymentId
        });
        
        done();
      });
    });

    it('should handle payment not found for deletion', (done) => {
      const paymentId = 999;

      mockDb.query.mockImplementation((query, data, callback) => {
        callback(null, { affectedRows: 0 });
      });

      Payment.remove(paymentId, (err, result) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(result).toBeNull();
        
        // Verify warning log
        expect(logger.warn).toHaveBeenCalledWith('Payment not found for deletion', {
          payment_id: paymentId
        });
        
        done();
      });
    });
  });
});
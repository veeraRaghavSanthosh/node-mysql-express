const PaymentService = require('../src/services/payment');
const mysql = require('mysql2');

// Mock database connection for testing
jest.mock('mysql2');

describe('PaymentService', () => {
  let mockConnection;
  let mockQuery;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Mock connection and query methods
    mockQuery = jest.fn();
    mockConnection = {
      query: mockQuery
    };
    
    mysql.createConnection.mockReturnValue(mockConnection);
  });

  describe('processPayment', () => {
    const validPaymentData = {
      amount: 100.50,
      currency: 'USD',
      customerId: 1,
      paymentMethod: 'credit_card'
    };

    describe('callback version', () => {
      it('should process payment successfully with callback', (done) => {
        // Mock successful database operations
        mockQuery
          .mockImplementationOnce((query, params, callback) => {
            // Mock INSERT query
            callback(null, { insertId: 123 });
          })
          .mockImplementationOnce((query, params, callback) => {
            // Mock UPDATE query
            callback(null, { affectedRows: 1 });
          });

        PaymentService.processPayment(validPaymentData, (err, result) => {
          expect(err).toBeNull();
          expect(result).toMatchObject({
            paymentId: 123,
            amount: 100.50,
            currency: 'USD',
            customerId: 1
          });
          expect(['completed', 'failed']).toContain(result.status);
          done();
        });
      });

      it('should handle validation errors with callback', (done) => {
        const invalidData = { amount: 0 };
        
        PaymentService.processPayment(invalidData, (err, result) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe('Missing required payment data');
          expect(result).toBeUndefined();
          done();
        });
      });

      it('should handle database errors with callback', (done) => {
        mockQuery.mockImplementationOnce((query, params, callback) => {
          callback(new Error('Database connection failed'));
        });

        PaymentService.processPayment(validPaymentData, (err, result) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe('Database connection failed');
          expect(result).toBeUndefined();
          done();
        });
      });
    });

    describe('async/await version', () => {
      it('should process payment successfully with async/await', async () => {
        // Mock util.promisify to return our mock function
        const mockPromisifiedQuery = jest.fn()
          .mockResolvedValueOnce({ insertId: 456 }) // INSERT
          .mockResolvedValueOnce({ affectedRows: 1 }); // UPDATE
        
        // Mock util.promisify
        const util = require('util');
        jest.spyOn(util, 'promisify').mockReturnValue(mockPromisifiedQuery);

        const result = await PaymentService.processPaymentAsync(validPaymentData);
        
        expect(result).toMatchObject({
          paymentId: 456,
          amount: 100.50,
          currency: 'USD',
          customerId: 1
        });
        expect(['completed', 'failed']).toContain(result.status);
      });

      it('should handle validation errors with async/await', async () => {
        const invalidData = { amount: -10 };
        
        await expect(PaymentService.processPaymentAsync(invalidData))
          .rejects
          .toThrow('Invalid payment amount');
      });

      it('should return promise when no callback provided', () => {
        const util = require('util');
        const mockPromisifiedQuery = jest.fn()
          .mockResolvedValueOnce({ insertId: 789 })
          .mockResolvedValueOnce({ affectedRows: 1 });
        
        jest.spyOn(util, 'promisify').mockReturnValue(mockPromisifiedQuery);

        const result = PaymentService.processPayment(validPaymentData);
        expect(result).toBeInstanceOf(Promise);
      });
    });
  });

  describe('getPayment', () => {
    describe('callback version', () => {
      it('should retrieve payment successfully with callback', (done) => {
        const mockPayment = {
          id: 1,
          customer_id: 1,
          amount: 100.50,
          status: 'completed'
        };

        mockQuery.mockImplementationOnce((query, params, callback) => {
          callback(null, [mockPayment]);
        });

        PaymentService.getPayment(1, (err, result) => {
          expect(err).toBeNull();
          expect(result).toEqual(mockPayment);
          done();
        });
      });

      it('should handle payment not found with callback', (done) => {
        mockQuery.mockImplementationOnce((query, params, callback) => {
          callback(null, []);
        });

        PaymentService.getPayment(999, (err, result) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe('Payment not found');
          expect(result).toBeUndefined();
          done();
        });
      });
    });

    describe('async/await version', () => {
      it('should retrieve payment successfully with async/await', async () => {
        const mockPayment = {
          id: 2,
          customer_id: 2,
          amount: 200.00,
          status: 'completed'
        };

        const util = require('util');
        const mockPromisifiedQuery = jest.fn().mockResolvedValue([mockPayment]);
        jest.spyOn(util, 'promisify').mockReturnValue(mockPromisifiedQuery);

        const result = await PaymentService.getPaymentAsync(2);
        expect(result).toEqual(mockPayment);
      });

      it('should handle payment not found with async/await', async () => {
        const util = require('util');
        const mockPromisifiedQuery = jest.fn().mockResolvedValue([]);
        jest.spyOn(util, 'promisify').mockReturnValue(mockPromisifiedQuery);

        await expect(PaymentService.getPaymentAsync(999))
          .rejects
          .toThrow('Payment not found');
      });
    });
  });

  describe('getPaymentsByCustomer', () => {
    describe('callback version', () => {
      it('should retrieve customer payments successfully with callback', (done) => {
        const mockPayments = [
          { id: 1, customer_id: 1, amount: 100.50 },
          { id: 2, customer_id: 1, amount: 75.25 }
        ];

        mockQuery.mockImplementationOnce((query, params, callback) => {
          callback(null, mockPayments);
        });

        PaymentService.getPaymentsByCustomer(1, (err, result) => {
          expect(err).toBeNull();
          expect(result).toEqual(mockPayments);
          expect(result).toHaveLength(2);
          done();
        });
      });
    });

    describe('async/await version', () => {
      it('should retrieve customer payments successfully with async/await', async () => {
        const mockPayments = [
          { id: 3, customer_id: 2, amount: 150.00 }
        ];

        const util = require('util');
        const mockPromisifiedQuery = jest.fn().mockResolvedValue(mockPayments);
        jest.spyOn(util, 'promisify').mockReturnValue(mockPromisifiedQuery);

        const result = await PaymentService.getPaymentsByCustomerAsync(2);
        expect(result).toEqual(mockPayments);
        expect(result).toHaveLength(1);
      });
    });
  });

  describe('refundPayment', () => {
    const mockPayment = {
      id: 1,
      customer_id: 1,
      amount: 100.00,
      status: 'completed'
    };

    describe('callback version', () => {
      it('should process refund successfully with callback', (done) => {
        // Mock getPayment call
        jest.spyOn(PaymentService, 'getPayment').mockImplementationOnce((id, callback) => {
          callback(null, mockPayment);
        });

        mockQuery
          .mockImplementationOnce((query, params, callback) => {
            // Mock INSERT refund query
            callback(null, { insertId: 10 });
          })
          .mockImplementationOnce((query, params, callback) => {
            // Mock UPDATE refund query
            callback(null, { affectedRows: 1 });
          });

        PaymentService.refundPayment(1, 50.00, (err, result) => {
          expect(err).toBeNull();
          expect(result).toMatchObject({
            refundId: 10,
            paymentId: 1,
            amount: 50.00
          });
          expect(['completed', 'failed']).toContain(result.status);
          done();
        });
      });

      it('should handle invalid refund amount with callback', (done) => {
        jest.spyOn(PaymentService, 'getPayment').mockImplementationOnce((id, callback) => {
          callback(null, mockPayment);
        });

        PaymentService.refundPayment(1, 150.00, (err, result) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe('Refund amount cannot exceed original payment amount');
          expect(result).toBeUndefined();
          done();
        });
      });

      it('should handle non-completed payment with callback', (done) => {
        const pendingPayment = { ...mockPayment, status: 'pending' };
        
        jest.spyOn(PaymentService, 'getPayment').mockImplementationOnce((id, callback) => {
          callback(null, pendingPayment);
        });

        PaymentService.refundPayment(1, 50.00, (err, result) => {
          expect(err).toBeInstanceOf(Error);
          expect(err.message).toBe('Can only refund completed payments');
          expect(result).toBeUndefined();
          done();
        });
      });
    });

    describe('async/await version', () => {
      it('should process refund successfully with async/await', async () => {
        jest.spyOn(PaymentService, 'getPaymentAsync').mockResolvedValue(mockPayment);

        const util = require('util');
        const mockPromisifiedQuery = jest.fn()
          .mockResolvedValueOnce({ insertId: 20 }) // INSERT refund
          .mockResolvedValueOnce({ affectedRows: 1 }); // UPDATE refund
        
        jest.spyOn(util, 'promisify').mockReturnValue(mockPromisifiedQuery);

        const result = await PaymentService.refundPaymentAsync(1, 75.00);
        
        expect(result).toMatchObject({
          refundId: 20,
          paymentId: 1,
          amount: 75.00
        });
        expect(['completed', 'failed']).toContain(result.status);
      });

      it('should handle invalid refund amount with async/await', async () => {
        jest.spyOn(PaymentService, 'getPaymentAsync').mockResolvedValue(mockPayment);

        await expect(PaymentService.refundPaymentAsync(1, 200.00))
          .rejects
          .toThrow('Refund amount cannot exceed original payment amount');
      });
    });
  });

  describe('backward compatibility', () => {
    it('should work with both callback and promise patterns', async () => {
      const util = require('util');
      const mockPromisifiedQuery = jest.fn()
        .mockResolvedValueOnce({ insertId: 999 })
        .mockResolvedValueOnce({ affectedRows: 1 });
      
      jest.spyOn(util, 'promisify').mockReturnValue(mockPromisifiedQuery);

      const validPaymentData = {
        amount: 50.00,
        currency: 'USD',
        customerId: 5,
        paymentMethod: 'debit_card'
      };

      // Test promise-based usage (no callback)
      const promiseResult = await PaymentService.processPayment(validPaymentData);
      expect(promiseResult).toHaveProperty('paymentId');
      expect(promiseResult).toHaveProperty('status');

      // Test callback-based usage
      return new Promise((resolve) => {
        mockQuery
          .mockImplementationOnce((query, params, callback) => {
            callback(null, { insertId: 888 });
          })
          .mockImplementationOnce((query, params, callback) => {
            callback(null, { affectedRows: 1 });
          });

        PaymentService.processPayment(validPaymentData, (err, callbackResult) => {
          expect(err).toBeNull();
          expect(callbackResult).toHaveProperty('paymentId');
          expect(callbackResult).toHaveProperty('status');
          resolve();
        });
      });
    });
  });
});
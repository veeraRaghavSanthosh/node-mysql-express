const Payment = require('../app/models/payment.model.js');

// Mock the database connection
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

const mockDb = require('../app/models/db.js');

describe('Payment Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Payment Constructor', () => {
    it('should create a payment object with all properties', () => {
      const paymentData = {
        customer_id: 1,
        amount: 100.50,
        currency: 'USD',
        payment_method: 'credit_card',
        status: 'pending',
        description: 'Test payment'
      };

      const payment = new Payment(paymentData);

      expect(payment.customer_id).toBe(1);
      expect(payment.amount).toBe(100.50);
      expect(payment.currency).toBe('USD');
      expect(payment.payment_method).toBe('credit_card');
      expect(payment.status).toBe('pending');
      expect(payment.description).toBe('Test payment');
    });

    it('should default status to pending when not provided', () => {
      const paymentData = {
        customer_id: 1,
        amount: 100.50,
        currency: 'USD'
      };

      const payment = new Payment(paymentData);

      expect(payment.status).toBe('pending');
    });
  });

  describe('Payment.create', () => {
    it('should successfully create a payment with valid data', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: 100.50,
        currency: 'USD',
        payment_method: 'credit_card'
      };

      const mockResult = { insertId: 123 };
      mockDb.query.mockImplementation((query, data, callback) => {
        callback(null, mockResult);
      });

      Payment.create(paymentData, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({ id: 123, ...paymentData });
        expect(mockDb.query).toHaveBeenCalledWith(
          'INSERT INTO payments SET ?',
          paymentData,
          expect.any(Function)
        );
        done();
      });
    });

    it('should fail when customer_id is missing', (done) => {
      const paymentData = {
        amount: 100.50,
        currency: 'USD'
      };

      Payment.create(paymentData, (err, result) => {
        expect(err).toEqual({ message: 'Missing required fields' });
        expect(result).toBeNull();
        expect(mockDb.query).not.toHaveBeenCalled();
        done();
      });
    });

    it('should fail when amount is missing', (done) => {
      const paymentData = {
        customer_id: 1,
        currency: 'USD'
      };

      Payment.create(paymentData, (err, result) => {
        expect(err).toEqual({ message: 'Missing required fields' });
        expect(result).toBeNull();
        expect(mockDb.query).not.toHaveBeenCalled();
        done();
      });
    });

    it('should fail when currency is missing', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: 100.50
      };

      Payment.create(paymentData, (err, result) => {
        expect(err).toEqual({ message: 'Missing required fields' });
        expect(result).toBeNull();
        expect(mockDb.query).not.toHaveBeenCalled();
        done();
      });
    });

    it('should fail when amount is zero', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: 0,
        currency: 'USD'
      };

      Payment.create(paymentData, (err, result) => {
        expect(err).toEqual({ message: 'Amount must be greater than 0' });
        expect(result).toBeNull();
        expect(mockDb.query).not.toHaveBeenCalled();
        done();
      });
    });

    it('should fail when amount is negative', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: -50,
        currency: 'USD'
      };

      Payment.create(paymentData, (err, result) => {
        expect(err).toEqual({ message: 'Amount must be greater than 0' });
        expect(result).toBeNull();
        expect(mockDb.query).not.toHaveBeenCalled();
        done();
      });
    });

    it('should handle database errors', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: 100.50,
        currency: 'USD'
      };

      const dbError = new Error('Database connection failed');
      mockDb.query.mockImplementation((query, data, callback) => {
        callback(dbError, null);
      });

      Payment.create(paymentData, (err, result) => {
        expect(err).toBe(dbError);
        expect(result).toBeNull();
        done();
      });
    });

    // Boundary case: very large amount
    it('should handle very large amounts', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: 999999999.99,
        currency: 'USD'
      };

      const mockResult = { insertId: 456 };
      mockDb.query.mockImplementation((query, data, callback) => {
        callback(null, mockResult);
      });

      Payment.create(paymentData, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({ id: 456, ...paymentData });
        done();
      });
    });

    // Boundary case: very small positive amount
    it('should handle very small positive amounts', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: 0.01,
        currency: 'USD'
      };

      const mockResult = { insertId: 789 };
      mockDb.query.mockImplementation((query, data, callback) => {
        callback(null, mockResult);
      });

      Payment.create(paymentData, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({ id: 789, ...paymentData });
        done();
      });
    });
  });

  describe('Payment.findById', () => {
    it('should find a payment by id successfully', (done) => {
      const paymentId = 123;
      const mockPayment = {
        id: 123,
        customer_id: 1,
        amount: 100.50,
        currency: 'USD',
        status: 'pending'
      };

      mockDb.query.mockImplementation((query, params, callback) => {
        callback(null, [mockPayment]);
      });

      Payment.findById(paymentId, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual(mockPayment);
        expect(mockDb.query).toHaveBeenCalledWith(
          'SELECT * FROM payments WHERE id = ?',
          [paymentId],
          expect.any(Function)
        );
        done();
      });
    });

    it('should return not_found error when payment does not exist', (done) => {
      const paymentId = 999;

      mockDb.query.mockImplementation((query, params, callback) => {
        callback(null, []); // Empty result
      });

      Payment.findById(paymentId, (err, result) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(result).toBeNull();
        done();
      });
    });

    it('should handle database errors', (done) => {
      const paymentId = 123;
      const dbError = new Error('Database query failed');

      mockDb.query.mockImplementation((query, params, callback) => {
        callback(dbError, null);
      });

      Payment.findById(paymentId, (err, result) => {
        expect(err).toBe(dbError);
        expect(result).toBeNull();
        done();
      });
    });

    // Boundary case: invalid payment ID types
    it('should handle string payment IDs', (done) => {
      const paymentId = 'abc';
      const mockPayment = { id: 'abc', amount: 50 };

      mockDb.query.mockImplementation((query, params, callback) => {
        callback(null, [mockPayment]);
      });

      Payment.findById(paymentId, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual(mockPayment);
        done();
      });
    });
  });

  describe('Payment.processPayment', () => {
    beforeEach(() => {
      // Mock Math.random to control success/failure
      jest.spyOn(Math, 'random');
    });

    afterEach(() => {
      Math.random.mockRestore();
    });

    it('should successfully process a pending payment (success case)', (done) => {
      const paymentId = 123;
      const mockPayment = {
        id: 123,
        status: 'pending',
        amount: 100.50
      };

      Math.random.mockReturnValue(0.5); // > 0.1, so success

      // Mock findById call
      mockDb.query
        .mockImplementationOnce((query, params, callback) => {
          callback(null, [mockPayment]);
        })
        // Mock update status call
        .mockImplementationOnce((query, params, callback) => {
          callback(null, { affectedRows: 1 });
        });

      Payment.processPayment(paymentId, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({
          id: paymentId,
          status: 'completed',
          success: true
        });
        expect(mockDb.query).toHaveBeenCalledTimes(2);
        done();
      });
    });

    it('should process a pending payment with failure', (done) => {
      const paymentId = 123;
      const mockPayment = {
        id: 123,
        status: 'pending',
        amount: 100.50
      };

      Math.random.mockReturnValue(0.05); // <= 0.1, so failure

      mockDb.query
        .mockImplementationOnce((query, params, callback) => {
          callback(null, [mockPayment]);
        })
        .mockImplementationOnce((query, params, callback) => {
          callback(null, { affectedRows: 1 });
        });

      Payment.processPayment(paymentId, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({
          id: paymentId,
          status: 'failed',
          success: false
        });
        done();
      });
    });

    it('should fail to process non-pending payment', (done) => {
      const paymentId = 123;
      const mockPayment = {
        id: 123,
        status: 'completed',
        amount: 100.50
      };

      mockDb.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [mockPayment]);
      });

      Payment.processPayment(paymentId, (err, result) => {
        expect(err).toEqual({ message: 'Payment must be pending to process' });
        expect(result).toBeNull();
        expect(mockDb.query).toHaveBeenCalledTimes(1); // Only findById called
        done();
      });
    });

    it('should handle payment not found', (done) => {
      const paymentId = 999;

      mockDb.query.mockImplementationOnce((query, params, callback) => {
        callback({ kind: 'not_found' }, null);
      });

      Payment.processPayment(paymentId, (err, result) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(result).toBeNull();
        done();
      });
    });

    it('should handle database error during findById', (done) => {
      const paymentId = 123;
      const dbError = new Error('Database error');

      mockDb.query.mockImplementationOnce((query, params, callback) => {
        callback(dbError, null);
      });

      Payment.processPayment(paymentId, (err, result) => {
        expect(err).toBe(dbError);
        expect(result).toBeNull();
        done();
      });
    });

    it('should handle database error during status update', (done) => {
      const paymentId = 123;
      const mockPayment = {
        id: 123,
        status: 'pending',
        amount: 100.50
      };
      const dbError = new Error('Update failed');

      Math.random.mockReturnValue(0.5);

      mockDb.query
        .mockImplementationOnce((query, params, callback) => {
          callback(null, [mockPayment]);
        })
        .mockImplementationOnce((query, params, callback) => {
          callback(dbError, null);
        });

      Payment.processPayment(paymentId, (err, result) => {
        expect(err).toBe(dbError);
        expect(result).toBeNull();
        done();
      });
    });

    // Boundary case: edge case for random success rate
    it('should handle edge case where random is exactly 0.1', (done) => {
      const paymentId = 123;
      const mockPayment = {
        id: 123,
        status: 'pending',
        amount: 100.50
      };

      Math.random.mockReturnValue(0.1); // Exactly 0.1, should be failure

      mockDb.query
        .mockImplementationOnce((query, params, callback) => {
          callback(null, [mockPayment]);
        })
        .mockImplementationOnce((query, params, callback) => {
          callback(null, { affectedRows: 1 });
        });

      Payment.processPayment(paymentId, (err, result) => {
        expect(err).toBeNull();
        expect(result.status).toBe('failed');
        expect(result.success).toBe(false);
        done();
      });
    });
  });
});

const PaymentService = require('../../src/services/payment');
const sql = require('../../app/models/db');

// Mock the database module
jest.mock('../../app/models/db');

describe('PaymentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.log mock
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore();
  });

  describe('processPayment', () => {
    const validPaymentData = {
      amount: 100.50,
      customerId: 1,
      paymentMethod: 'credit_card'
    };

    it('should successfully process a valid payment', (done) => {
      // Mock customer exists
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ id: 1, name: 'John Doe', email: 'john@example.com' }]);
      });
      
      // Mock payment insertion
      sql.query.mockImplementationOnce((query, payment, callback) => {
        callback(null, { insertId: 123 });
      });

      PaymentService.processPayment(validPaymentData, (err, result) => {
        expect(err).toBeNull();
        expect(result).toMatchObject({
          id: 123,
          customer_id: 1,
          amount: 100.50,
          payment_method: 'credit_card',
          status: 'pending'
        });
        expect(result.transaction_id).toMatch(/^TXN_\d+_[a-z0-9]+_\d+$/);
        done();
      });
    });

    it('should reject payment with invalid amount', (done) => {
      const invalidPaymentData = { ...validPaymentData, amount: -50 };
      
      PaymentService.processPayment(invalidPaymentData, (err, result) => {
        expect(err).toEqual({ error: "Invalid payment amount" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should reject payment with zero amount', (done) => {
      const invalidPaymentData = { ...validPaymentData, amount: 0 };
      
      PaymentService.processPayment(invalidPaymentData, (err, result) => {
        expect(err).toEqual({ error: "Invalid payment amount" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should reject payment exceeding maximum limit', (done) => {
      const invalidPaymentData = { ...validPaymentData, amount: 15000 };
      
      PaymentService.processPayment(invalidPaymentData, (err, result) => {
        expect(err).toEqual({ error: "Payment amount exceeds maximum limit" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should reject payment with invalid amount format', (done) => {
      const invalidPaymentData = { ...validPaymentData, amount: NaN };
      
      PaymentService.processPayment(invalidPaymentData, (err, result) => {
        expect(err).toEqual({ error: "Invalid payment amount format" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should reject payment without customer ID', (done) => {
      const invalidPaymentData = { ...validPaymentData, customerId: null };
      
      PaymentService.processPayment(invalidPaymentData, (err, result) => {
        expect(err).toEqual({ error: "Customer ID is required" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should reject payment without payment method', (done) => {
      const invalidPaymentData = { ...validPaymentData, paymentMethod: '' };
      
      PaymentService.processPayment(invalidPaymentData, (err, result) => {
        expect(err).toEqual({ error: "Payment method is required" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should reject payment with invalid payment method', (done) => {
      const invalidPaymentData = { ...validPaymentData, paymentMethod: 'bitcoin' };
      
      PaymentService.processPayment(invalidPaymentData, (err, result) => {
        expect(err).toEqual({ error: "Invalid payment method" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should reject payment for non-existent customer', (done) => {
      // Mock customer not found
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      });

      PaymentService.processPayment(validPaymentData, (err, result) => {
        expect(err).toEqual({ error: "Customer not found" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should handle database error during customer validation', (done) => {
      // Mock database error
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(new Error('Database connection failed'), null);
      });

      PaymentService.processPayment(validPaymentData, (err, result) => {
        expect(err).toEqual({ error: "Database error occurred" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should handle database error during payment insertion', (done) => {
      // Mock customer exists
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ id: 1, name: 'John Doe', email: 'john@example.com' }]);
      });
      
      // Mock payment insertion error
      sql.query.mockImplementationOnce((query, payment, callback) => {
        callback(new Error('Insert failed'), null);
      });

      PaymentService.processPayment(validPaymentData, (err, result) => {
        expect(err).toEqual({ error: "Database error occurred" });
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('refundPayment', () => {
    const validRefundData = {
      paymentId: 123,
      refundAmount: 50.25
    };

    const mockOriginalPayment = {
      id: 123,
      customer_id: 1,
      amount: 100.50,
      status: 'completed'
    };

    it('should successfully process a valid refund', (done) => {
      // Mock payment lookup
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [mockOriginalPayment]);
      });
      
      // Mock refund insertion
      sql.query.mockImplementationOnce((query, refund, callback) => {
        callback(null, { insertId: 456 });
      });

      PaymentService.refundPayment(validRefundData.paymentId, validRefundData.refundAmount, (err, result) => {
        expect(err).toBeNull();
        expect(result).toMatchObject({
          id: 456,
          original_payment_id: 123,
          customer_id: 1,
          amount: 50.25,
          status: 'completed'
        });
        expect(result.transaction_id).toMatch(/^TXN_\d+_[a-z0-9]+_\d+$/);
        done();
      });
    });

    it('should successfully process a full refund and update payment status', (done) => {
      // Mock payment lookup
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [mockOriginalPayment]);
      });
      
      // Mock refund insertion
      sql.query.mockImplementationOnce((query, refund, callback) => {
        callback(null, { insertId: 456 });
      });

      // Mock payment status update
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, { affectedRows: 1 });
      });

      PaymentService.refundPayment(validRefundData.paymentId, 100.50, (err, result) => {
        expect(err).toBeNull();
        expect(result).toMatchObject({
          id: 456,
          original_payment_id: 123,
          amount: 100.50
        });
        expect(sql.query).toHaveBeenCalledWith(
          "UPDATE payments SET status = 'refunded' WHERE id = ?",
          [123],
          expect.any(Function)
        );
        done();
      });
    });

    it('should reject refund without payment ID', (done) => {
      PaymentService.refundPayment(null, validRefundData.refundAmount, (err, result) => {
        expect(err).toEqual({ error: "Payment ID is required" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should reject refund with invalid amount', (done) => {
      PaymentService.refundPayment(validRefundData.paymentId, -10, (err, result) => {
        expect(err).toEqual({ error: "Invalid refund amount" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should reject refund for non-existent payment', (done) => {
      // Mock payment not found
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      });

      PaymentService.refundPayment(validRefundData.paymentId, validRefundData.refundAmount, (err, result) => {
        expect(err).toEqual({ error: "Payment not found" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should reject refund exceeding original payment amount', (done) => {
      // Mock payment lookup
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [mockOriginalPayment]);
      });

      PaymentService.refundPayment(validRefundData.paymentId, 150.00, (err, result) => {
        expect(err).toEqual({ error: "Refund amount cannot exceed original payment amount" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should reject refund for already refunded payment', (done) => {
      const refundedPayment = { ...mockOriginalPayment, status: 'refunded' };
      
      // Mock payment lookup
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [refundedPayment]);
      });

      PaymentService.refundPayment(validRefundData.paymentId, validRefundData.refundAmount, (err, result) => {
        expect(err).toEqual({ error: "Payment already refunded" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should reject refund for failed payment', (done) => {
      const failedPayment = { ...mockOriginalPayment, status: 'failed' };
      
      // Mock payment lookup
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [failedPayment]);
      });

      PaymentService.refundPayment(validRefundData.paymentId, validRefundData.refundAmount, (err, result) => {
        expect(err).toEqual({ error: "Cannot refund failed payment" });
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('getPaymentHistory', () => {
    const customerId = 1;
    const mockPayments = [
      { id: 1, customer_id: 1, amount: 100, status: 'completed' },
      { id: 2, customer_id: 1, amount: 200, status: 'pending' }
    ];

    it('should successfully retrieve payment history', (done) => {
      // Mock customer exists
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [{ id: 1, name: 'John Doe' }]);
      });
      
      // Mock payment history retrieval
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, mockPayments);
      });

      PaymentService.getPaymentHistory(customerId, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual(mockPayments);
        done();
      });
    });

    it('should reject request without customer ID', (done) => {
      PaymentService.getPaymentHistory(null, (err, result) => {
        expect(err).toEqual({ error: "Customer ID is required" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should reject request for non-existent customer', (done) => {
      // Mock customer not found
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      });

      PaymentService.getPaymentHistory(customerId, (err, result) => {
        expect(err).toEqual({ error: "Customer not found" });
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('validatePaymentMethod', () => {
    it('should validate correct payment methods', (done) => {
      PaymentService.validatePaymentMethod('credit_card', (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({ valid: true, method: 'credit_card' });
        done();
      });
    });

    it('should reject invalid payment method', (done) => {
      PaymentService.validatePaymentMethod('cryptocurrency', (err, result) => {
        expect(err).toEqual({ error: "Invalid payment method" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should reject empty payment method', (done) => {
      PaymentService.validatePaymentMethod('', (err, result) => {
        expect(err).toEqual({ error: "Payment method is required" });
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe('getPaymentById', () => {
    const mockPayment = { id: 123, customer_id: 1, amount: 100, status: 'completed' };

    it('should successfully retrieve payment by ID', (done) => {
      // Mock payment lookup
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, [mockPayment]);
      });

      PaymentService.getPaymentById(123, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual(mockPayment);
        done();
      });
    });

    it('should reject request without payment ID', (done) => {
      PaymentService.getPaymentById(null, (err, result) => {
        expect(err).toEqual({ error: "Payment ID is required" });
        expect(result).toBeNull();
        done();
      });
    });

    it('should handle payment not found', (done) => {
      // Mock payment not found
      sql.query.mockImplementationOnce((query, params, callback) => {
        callback(null, []);
      });

      PaymentService.getPaymentById(999, (err, result) => {
        expect(err).toEqual({ error: "Payment not found" });
        expect(result).toBeNull();
        done();
      });
    });
  });
});
const { expect } = require('chai');
const sinon = require('sinon');
const Payment = require('../../app/models/payment.model.js');
const sql = require('../../app/models/db.js');

describe('Payment Model', () => {
  let sqlStub;

  beforeEach(() => {
    sqlStub = sinon.stub(sql, 'query');
  });

  afterEach(() => {
    sqlStub.restore();
  });

  describe('Payment Constructor', () => {
    it('should create a payment with all required fields', () => {
      const paymentData = {
        customer_id: 1,
        amount: 100.50,
        currency: 'USD',
        payment_method: 'credit_card',
        status: 'pending'
      };

      const payment = new Payment(paymentData);

      expect(payment.customer_id).to.equal(1);
      expect(payment.amount).to.equal(100.50);
      expect(payment.currency).to.equal('USD');
      expect(payment.payment_method).to.equal('credit_card');
      expect(payment.status).to.equal('pending');
      expect(payment.created_at).to.be.a('date');
    });

    it('should set default values for optional fields', () => {
      const paymentData = {
        customer_id: 1,
        amount: 50.00,
        payment_method: 'paypal'
      };

      const payment = new Payment(paymentData);

      expect(payment.currency).to.equal('USD');
      expect(payment.status).to.equal('pending');
    });
  });

  describe('Payment.create - Success Cases', () => {
    it('should create a payment successfully with valid data', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: 100.00,
        currency: 'USD',
        payment_method: 'credit_card',
        status: 'pending'
      };

      const mockResult = { insertId: 123 };
      sqlStub.yields(null, mockResult);

      Payment.create(paymentData, (err, data) => {
        expect(err).to.be.null;
        expect(data).to.deep.equal({ id: 123, ...paymentData });
        expect(sqlStub.calledOnce).to.be.true;
        expect(sqlStub.firstCall.args[0]).to.equal('INSERT INTO payments SET ?');
        expect(sqlStub.firstCall.args[1]).to.deep.equal(paymentData);
        done();
      });
    });

    it('should create a payment with minimum required fields', (done) => {
      const paymentData = {
        customer_id: 2,
        amount: 25.99,
        payment_method: 'paypal'
      };

      const mockResult = { insertId: 456 };
      sqlStub.yields(null, mockResult);

      Payment.create(paymentData, (err, data) => {
        expect(err).to.be.null;
        expect(data.id).to.equal(456);
        expect(data.customer_id).to.equal(2);
        expect(data.amount).to.equal(25.99);
        expect(data.payment_method).to.equal('paypal');
        done();
      });
    });
  });

  describe('Payment.create - Failure Cases', () => {
    it('should fail when customer_id is missing', (done) => {
      const paymentData = {
        amount: 100.00,
        payment_method: 'credit_card'
      };

      Payment.create(paymentData, (err, data) => {
        expect(err).to.deep.equal({ message: "Missing required payment fields" });
        expect(data).to.be.null;
        expect(sqlStub.called).to.be.false;
        done();
      });
    });

    it('should fail when amount is missing', (done) => {
      const paymentData = {
        customer_id: 1,
        payment_method: 'credit_card'
      };

      Payment.create(paymentData, (err, data) => {
        expect(err).to.deep.equal({ message: "Missing required payment fields" });
        expect(data).to.be.null;
        expect(sqlStub.called).to.be.false;
        done();
      });
    });

    it('should fail when payment_method is missing', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: 100.00
      };

      Payment.create(paymentData, (err, data) => {
        expect(err).to.deep.equal({ message: "Missing required payment fields" });
        expect(data).to.be.null;
        expect(sqlStub.called).to.be.false;
        done();
      });
    });

    it('should fail when amount is zero', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: 0,
        payment_method: 'credit_card'
      };

      Payment.create(paymentData, (err, data) => {
        expect(err).to.deep.equal({ message: "Payment amount must be greater than 0" });
        expect(data).to.be.null;
        expect(sqlStub.called).to.be.false;
        done();
      });
    });

    it('should fail when amount is negative', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: -50.00,
        payment_method: 'credit_card'
      };

      Payment.create(paymentData, (err, data) => {
        expect(err).to.deep.equal({ message: "Payment amount must be greater than 0" });
        expect(data).to.be.null;
        expect(sqlStub.called).to.be.false;
        done();
      });
    });

    it('should fail when database error occurs', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: 100.00,
        payment_method: 'credit_card'
      };

      const dbError = new Error('Database connection failed');
      sqlStub.yields(dbError, null);

      Payment.create(paymentData, (err, data) => {
        expect(err).to.equal(dbError);
        expect(data).to.be.null;
        done();
      });
    });
  });

  describe('Payment.create - Boundary Cases', () => {
    it('should fail when amount exceeds maximum limit', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: 100001, // Exceeds 100000 limit
        payment_method: 'credit_card'
      };

      Payment.create(paymentData, (err, data) => {
        expect(err).to.deep.equal({ message: "Payment amount exceeds maximum limit" });
        expect(data).to.be.null;
        expect(sqlStub.called).to.be.false;
        done();
      });
    });

    it('should succeed with amount at maximum limit', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: 100000, // At the limit
        payment_method: 'credit_card'
      };

      const mockResult = { insertId: 789 };
      sqlStub.yields(null, mockResult);

      Payment.create(paymentData, (err, data) => {
        expect(err).to.be.null;
        expect(data.amount).to.equal(100000);
        done();
      });
    });

    it('should succeed with minimum positive amount', (done) => {
      const paymentData = {
        customer_id: 1,
        amount: 0.01, // Minimum positive amount
        payment_method: 'credit_card'
      };

      const mockResult = { insertId: 101 };
      sqlStub.yields(null, mockResult);

      Payment.create(paymentData, (err, data) => {
        expect(err).to.be.null;
        expect(data.amount).to.equal(0.01);
        done();
      });
    });

    it('should handle very large customer_id', (done) => {
      const paymentData = {
        customer_id: 999999999,
        amount: 50.00,
        payment_method: 'credit_card'
      };

      const mockResult = { insertId: 202 };
      sqlStub.yields(null, mockResult);

      Payment.create(paymentData, (err, data) => {
        expect(err).to.be.null;
        expect(data.customer_id).to.equal(999999999);
        done();
      });
    });
  });

  describe('Payment.findById - Success Cases', () => {
    it('should find a payment by ID successfully', (done) => {
      const mockPayment = {
        id: 1,
        customer_id: 1,
        amount: 100.00,
        currency: 'USD',
        payment_method: 'credit_card',
        status: 'pending'
      };

      sqlStub.yields(null, [mockPayment]);

      Payment.findById(1, (err, data) => {
        expect(err).to.be.null;
        expect(data).to.deep.equal(mockPayment);
        expect(sqlStub.calledOnce).to.be.true;
        expect(sqlStub.firstCall.args[0]).to.equal('SELECT * FROM payments WHERE id = 1');
        done();
      });
    });
  });

  describe('Payment.findById - Failure Cases', () => {
    it('should return not_found error when payment does not exist', (done) => {
      sqlStub.yields(null, []); // Empty result

      Payment.findById(999, (err, data) => {
        expect(err).to.deep.equal({ kind: "not_found" });
        expect(data).to.be.null;
        done();
      });
    });

    it('should handle database error', (done) => {
      const dbError = new Error('Database error');
      sqlStub.yields(dbError, null);

      Payment.findById(1, (err, data) => {
        expect(err).to.equal(dbError);
        expect(data).to.be.null;
        done();
      });
    });
  });

  describe('Payment.processPayment - Success Cases', () => {
    let findByIdStub, mathStub;

    beforeEach(() => {
      findByIdStub = sinon.stub(Payment, 'findById');
    });

    afterEach(() => {
      findByIdStub.restore();
      if (mathStub) {
        mathStub.restore();
        mathStub = null;
      }
    });

    it('should process a pending payment successfully', (done) => {
      const mockPayment = {
        id: 1,
        customer_id: 1,
        amount: 100.00,
        status: 'pending'
      };

      findByIdStub.yields(null, mockPayment);
      // Setup stub to respond differently on different calls
      sqlStub.onCall(0).yields(null, [mockPayment]); // For findById internal call
      sqlStub.onCall(1).yields(null, { affectedRows: 1 }); // For update call

      // Mock Math.random to always succeed
      mathStub = sinon.stub(Math, 'random').returns(0.5); // > 0.1, so success

      Payment.processPayment(1, (err, data) => {
        expect(err).to.be.null;
        expect(data.status).to.equal('completed');
        done();
      });
    });

    it('should handle payment processing failure', (done) => {
      const mockPayment = {
        id: 1,
        customer_id: 1,
        amount: 100.00,
        status: 'pending'
      };

      findByIdStub.yields(null, mockPayment);
      // Setup stub to respond differently on different calls
      sqlStub.onCall(0).yields(null, [mockPayment]); // For findById internal call
      sqlStub.onCall(1).yields(null, { affectedRows: 1 }); // For update call

      // Mock Math.random to always fail
      mathStub = sinon.stub(Math, 'random').returns(0.05); // < 0.1, so failure

      Payment.processPayment(1, (err, data) => {
        expect(err).to.be.null;
        expect(data.status).to.equal('failed');
        done();
      });
    });
  });

  describe('Payment.processPayment - Failure Cases', () => {
    let findByIdStub;

    beforeEach(() => {
      findByIdStub = sinon.stub(Payment, 'findById');
    });

    afterEach(() => {
      findByIdStub.restore();
    });

    it('should fail when payment is not found', (done) => {
      findByIdStub.yields({ kind: "not_found" }, null);

      Payment.processPayment(999, (err, data) => {
        expect(err).to.deep.equal({ kind: "not_found" });
        expect(data).to.be.null;
        done();
      });
    });

    it('should fail when payment is not in pending status', (done) => {
      const mockPayment = {
        id: 1,
        customer_id: 1,
        amount: 100.00,
        status: 'completed' // Not pending
      };

      findByIdStub.yields(null, mockPayment);

      Payment.processPayment(1, (err, data) => {
        expect(err).to.deep.equal({ message: "Payment is not in pending status" });
        expect(data).to.be.null;
        done();
      });
    });
  });

  describe('Payment.updateStatus - Success Cases', () => {
    it('should update payment status successfully', (done) => {
      sqlStub.yields(null, { affectedRows: 1 });

      Payment.updateStatus(1, 'completed', (err, data) => {
        expect(err).to.be.null;
        expect(data).to.deep.equal({ id: 1, status: 'completed' });
        expect(sqlStub.firstCall.args[0]).to.equal('UPDATE payments SET status = ? WHERE id = ?');
        expect(sqlStub.firstCall.args[1]).to.deep.equal(['completed', 1]);
        done();
      });
    });
  });

  describe('Payment.updateStatus - Failure Cases', () => {
    it('should fail with invalid status', (done) => {
      Payment.updateStatus(1, 'invalid_status', (err, data) => {
        expect(err).to.deep.equal({ message: "Invalid payment status" });
        expect(data).to.be.null;
        expect(sqlStub.called).to.be.false;
        done();
      });
    });

    it('should fail when payment not found', (done) => {
      sqlStub.yields(null, { affectedRows: 0 });

      Payment.updateStatus(999, 'completed', (err, data) => {
        expect(err).to.deep.equal({ kind: "not_found" });
        expect(data).to.be.null;
        done();
      });
    });
  });

  describe('Payment.refund - Success Cases', () => {
    let findByIdStub;

    beforeEach(() => {
      findByIdStub = sinon.stub(Payment, 'findById');
    });

    afterEach(() => {
      findByIdStub.restore();
    });

    it('should create refund successfully for completed payment', (done) => {
      const mockPayment = {
        id: 1,
        customer_id: 1,
        amount: 100.00,
        currency: 'USD',
        payment_method: 'credit_card',
        status: 'completed'
      };

      findByIdStub.yields(null, mockPayment);
      sqlStub.yields(null, { insertId: 2 });

      Payment.refund(1, 50.00, (err, data) => {
        expect(err).to.be.null;
        expect(data.id).to.equal(2);
        expect(data.amount).to.equal(-50.00); // Negative for refund
        expect(data.original_payment_id).to.equal(1);
        expect(data.customer_id).to.equal(1);
        done();
      });
    });

    it('should create full refund successfully', (done) => {
      const mockPayment = {
        id: 1,
        customer_id: 1,
        amount: 100.00,
        currency: 'USD',
        payment_method: 'credit_card',
        status: 'completed'
      };

      findByIdStub.yields(null, mockPayment);
      sqlStub.yields(null, { insertId: 3 });

      Payment.refund(1, 100.00, (err, data) => {
        expect(err).to.be.null;
        expect(data.amount).to.equal(-100.00); // Full refund
        done();
      });
    });
  });

  describe('Payment.refund - Failure Cases', () => {
    let findByIdStub;

    beforeEach(() => {
      findByIdStub = sinon.stub(Payment, 'findById');
    });

    afterEach(() => {
      findByIdStub.restore();
    });

    it('should fail when payment not found', (done) => {
      findByIdStub.yields({ kind: "not_found" }, null);

      Payment.refund(999, 50.00, (err, data) => {
        expect(err).to.deep.equal({ kind: "not_found" });
        expect(data).to.be.null;
        done();
      });
    });

    it('should fail when payment is not completed', (done) => {
      const mockPayment = {
        id: 1,
        status: 'pending'
      };

      findByIdStub.yields(null, mockPayment);

      Payment.refund(1, 50.00, (err, data) => {
        expect(err).to.deep.equal({ message: "Can only refund completed payments" });
        expect(data).to.be.null;
        done();
      });
    });

    it('should fail when refund amount exceeds original amount', (done) => {
      const mockPayment = {
        id: 1,
        amount: 100.00,
        status: 'completed'
      };

      findByIdStub.yields(null, mockPayment);

      Payment.refund(1, 150.00, (err, data) => {
        expect(err).to.deep.equal({ message: "Refund amount cannot exceed original payment amount" });
        expect(data).to.be.null;
        done();
      });
    });
  });

  describe('Payment.getAll - Success Cases', () => {
    it('should retrieve all payments successfully', (done) => {
      const mockPayments = [
        { id: 1, customer_id: 1, amount: 100.00, status: 'completed' },
        { id: 2, customer_id: 2, amount: 50.00, status: 'pending' }
      ];

      sqlStub.yields(null, mockPayments);

      Payment.getAll((err, data) => {
        expect(err).to.be.null;
        expect(data).to.deep.equal(mockPayments);
        expect(sqlStub.firstCall.args[0]).to.equal('SELECT * FROM payments ORDER BY created_at DESC');
        done();
      });
    });
  });

  describe('Payment.getByCustomerId - Success Cases', () => {
    it('should retrieve customer payments successfully', (done) => {
      const mockPayments = [
        { id: 1, customer_id: 1, amount: 100.00, status: 'completed' },
        { id: 3, customer_id: 1, amount: 75.00, status: 'pending' }
      ];

      sqlStub.yields(null, mockPayments);

      Payment.getByCustomerId(1, (err, data) => {
        expect(err).to.be.null;
        expect(data).to.deep.equal(mockPayments);
        expect(sqlStub.firstCall.args[0]).to.equal('SELECT * FROM payments WHERE customer_id = ? ORDER BY created_at DESC');
        expect(sqlStub.firstCall.args[1]).to.deep.equal([1]);
        done();
      });
    });
  });
});
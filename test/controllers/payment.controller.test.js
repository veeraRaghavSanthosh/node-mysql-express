const { expect } = require('chai');
const sinon = require('sinon');
const paymentController = require('../../app/controllers/payment.controller.js');
const Payment = require('../../app/models/payment.model.js');

describe('Payment Controller', () => {
  let req, res, paymentStub;

  beforeEach(() => {
    req = {
      body: {},
      params: {}
    };
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
      json: sinon.stub()
    };
  });

  afterEach(() => {
    if (paymentStub) {
      paymentStub.restore();
    }
  });

  describe('create - Success Cases', () => {
    it('should create a payment successfully', () => {
      req.body = {
        customer_id: 1,
        amount: 100.00,
        currency: 'USD',
        payment_method: 'credit_card'
      };

      const mockPayment = { id: 1, ...req.body, status: 'pending' };
      paymentStub = sinon.stub(Payment, 'create').yields(null, mockPayment);

      paymentController.create(req, res);

      expect(Payment.create.calledOnce).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(res.send.firstCall.args[0]).to.deep.equal(mockPayment);
      expect(res.status.called).to.be.false;
    });

    it('should create a payment with minimal required fields', () => {
      req.body = {
        customer_id: 2,
        amount: 50.00,
        payment_method: 'paypal'
      };

      const mockPayment = { id: 2, ...req.body, status: 'pending', currency: 'USD' };
      paymentStub = sinon.stub(Payment, 'create').yields(null, mockPayment);

      paymentController.create(req, res);

      expect(Payment.create.calledOnce).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(res.send.firstCall.args[0]).to.deep.equal(mockPayment);
    });
  });

  describe('create - Failure Cases', () => {
    it('should return 400 when request body is empty', () => {
      req.body = null;

      paymentController.create(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(res.send.firstCall.args[0]).to.deep.equal({
        message: "Content can not be empty!"
      });
    });

    it('should return 400 for validation errors', () => {
      req.body = {
        customer_id: 1,
        amount: -50.00, // Invalid amount
        payment_method: 'credit_card'
      };

      const validationError = { message: "Payment amount must be greater than 0" };
      paymentStub = sinon.stub(Payment, 'create').yields(validationError, null);

      paymentController.create(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(res.send.firstCall.args[0]).to.deep.equal({
        message: "Payment amount must be greater than 0"
      });
    });

    it('should return 500 for database errors', () => {
      req.body = {
        customer_id: 1,
        amount: 100.00,
        payment_method: 'credit_card'
      };

      const dbError = new Error('Database connection failed');
      paymentStub = sinon.stub(Payment, 'create').yields(dbError, null);

      paymentController.create(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(res.send.firstCall.args[0].message).to.include('Database connection failed');
    });
  });

  describe('create - Boundary Cases', () => {
    it('should handle maximum allowed amount', () => {
      req.body = {
        customer_id: 1,
        amount: 100000, // Maximum allowed
        payment_method: 'credit_card'
      };

      const mockPayment = { id: 1, ...req.body, status: 'pending' };
      paymentStub = sinon.stub(Payment, 'create').yields(null, mockPayment);

      paymentController.create(req, res);

      expect(Payment.create.calledOnce).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(res.send.firstCall.args[0].amount).to.equal(100000);
    });

    it('should reject amount exceeding maximum', () => {
      req.body = {
        customer_id: 1,
        amount: 100001, // Exceeds maximum
        payment_method: 'credit_card'
      };

      const validationError = { message: "Payment amount exceeds maximum limit" };
      paymentStub = sinon.stub(Payment, 'create').yields(validationError, null);

      paymentController.create(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.equal("Payment amount exceeds maximum limit");
    });
  });

  describe('process - Success Cases', () => {
    it('should process a payment successfully', () => {
      req.params.paymentId = '1';

      const processedPayment = {
        id: 1,
        customer_id: 1,
        amount: 100.00,
        status: 'completed'
      };
      paymentStub = sinon.stub(Payment, 'processPayment').yields(null, processedPayment);

      paymentController.process(req, res);

      expect(Payment.processPayment.calledWith('1')).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(res.send.firstCall.args[0]).to.deep.equal(processedPayment);
    });
  });

  describe('process - Failure Cases', () => {
    it('should return 404 when payment not found', () => {
      req.params.paymentId = '999';

      const notFoundError = { kind: "not_found" };
      paymentStub = sinon.stub(Payment, 'processPayment').yields(notFoundError, null);

      paymentController.process(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.include('Payment with id 999 not found');
    });

    it('should return 400 for business logic errors', () => {
      req.params.paymentId = '1';

      const businessError = { message: "Payment is not in pending status" };
      paymentStub = sinon.stub(Payment, 'processPayment').yields(businessError, null);

      paymentController.process(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.equal("Payment is not in pending status");
    });

    it('should return 500 for processing errors', () => {
      req.params.paymentId = '1';

      const processingError = new Error('Processing service unavailable');
      paymentStub = sinon.stub(Payment, 'processPayment').yields(processingError, null);

      paymentController.process(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.include('Error processing Payment with id 1');
    });
  });

  describe('findOne - Success Cases', () => {
    it('should find a payment by ID successfully', () => {
      req.params.paymentId = '1';

      const mockPayment = {
        id: 1,
        customer_id: 1,
        amount: 100.00,
        status: 'completed'
      };
      paymentStub = sinon.stub(Payment, 'findById').yields(null, mockPayment);

      paymentController.findOne(req, res);

      expect(Payment.findById.calledWith('1')).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(res.send.firstCall.args[0]).to.deep.equal(mockPayment);
    });
  });

  describe('findOne - Failure Cases', () => {
    it('should return 404 when payment not found', () => {
      req.params.paymentId = '999';

      const notFoundError = { kind: "not_found" };
      paymentStub = sinon.stub(Payment, 'findById').yields(notFoundError, null);

      paymentController.findOne(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.include('Payment with id 999 not found');
    });

    it('should return 500 for database errors', () => {
      req.params.paymentId = '1';

      const dbError = new Error('Database error');
      paymentStub = sinon.stub(Payment, 'findById').yields(dbError, null);

      paymentController.findOne(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.include('Error retrieving Payment with id 1');
    });
  });

  describe('findAll - Success Cases', () => {
    it('should retrieve all payments successfully', () => {
      const mockPayments = [
        { id: 1, customer_id: 1, amount: 100.00, status: 'completed' },
        { id: 2, customer_id: 2, amount: 50.00, status: 'pending' }
      ];
      paymentStub = sinon.stub(Payment, 'getAll').yields(null, mockPayments);

      paymentController.findAll(req, res);

      expect(Payment.getAll.calledOnce).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(res.send.firstCall.args[0]).to.deep.equal(mockPayments);
    });
  });

  describe('findAll - Failure Cases', () => {
    it('should return 500 for database errors', () => {
      const dbError = new Error('Database connection lost');
      paymentStub = sinon.stub(Payment, 'getAll').yields(dbError, null);

      paymentController.findAll(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.include('Database connection lost');
    });
  });

  describe('findByCustomer - Success Cases', () => {
    it('should retrieve customer payments successfully', () => {
      req.params.customerId = '1';

      const mockPayments = [
        { id: 1, customer_id: 1, amount: 100.00, status: 'completed' },
        { id: 3, customer_id: 1, amount: 75.00, status: 'pending' }
      ];
      paymentStub = sinon.stub(Payment, 'getByCustomerId').yields(null, mockPayments);

      paymentController.findByCustomer(req, res);

      expect(Payment.getByCustomerId.calledWith('1')).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(res.send.firstCall.args[0]).to.deep.equal(mockPayments);
    });
  });

  describe('findByCustomer - Failure Cases', () => {
    it('should return 500 for database errors', () => {
      req.params.customerId = '1';

      const dbError = new Error('Database error');
      paymentStub = sinon.stub(Payment, 'getByCustomerId').yields(dbError, null);

      paymentController.findByCustomer(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.include('Database error');
    });
  });

  describe('updateStatus - Success Cases', () => {
    it('should update payment status successfully', () => {
      req.params.paymentId = '1';
      req.body.status = 'completed';

      const updatedPayment = { id: 1, status: 'completed' };
      paymentStub = sinon.stub(Payment, 'updateStatus').yields(null, updatedPayment);

      paymentController.updateStatus(req, res);

      expect(Payment.updateStatus.calledWith('1', 'completed')).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(res.send.firstCall.args[0]).to.deep.equal(updatedPayment);
    });
  });

  describe('updateStatus - Failure Cases', () => {
    it('should return 400 when request body is empty', () => {
      req.params.paymentId = '1';
      req.body = null;

      paymentController.updateStatus(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.equal("Status cannot be empty!");
    });

    it('should return 400 when status is missing', () => {
      req.params.paymentId = '1';
      req.body = {};

      paymentController.updateStatus(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.equal("Status cannot be empty!");
    });

    it('should return 404 when payment not found', () => {
      req.params.paymentId = '999';
      req.body.status = 'completed';

      const notFoundError = { kind: "not_found" };
      paymentStub = sinon.stub(Payment, 'updateStatus').yields(notFoundError, null);

      paymentController.updateStatus(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.include('Payment with id 999 not found');
    });

    it('should return 400 for invalid status', () => {
      req.params.paymentId = '1';
      req.body.status = 'invalid_status';

      const validationError = { message: "Invalid payment status" };
      paymentStub = sinon.stub(Payment, 'updateStatus').yields(validationError, null);

      paymentController.updateStatus(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.equal("Invalid payment status");
    });
  });

  describe('refund - Success Cases', () => {
    it('should process refund successfully', () => {
      req.params.paymentId = '1';
      req.body.amount = 50.00;

      const refundPayment = {
        id: 2,
        original_payment_id: 1,
        amount: -50.00,
        status: 'completed'
      };
      paymentStub = sinon.stub(Payment, 'refund').yields(null, refundPayment);

      paymentController.refund(req, res);

      expect(Payment.refund.calledWith('1', 50.00)).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(res.send.firstCall.args[0]).to.deep.equal(refundPayment);
    });
  });

  describe('refund - Failure Cases', () => {
    it('should return 400 when request body is empty', () => {
      req.params.paymentId = '1';
      req.body = null;

      paymentController.refund(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.equal("Refund amount cannot be empty!");
    });

    it('should return 400 when amount is missing', () => {
      req.params.paymentId = '1';
      req.body = {};

      paymentController.refund(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.equal("Refund amount cannot be empty!");
    });

    it('should return 404 when payment not found', () => {
      req.params.paymentId = '999';
      req.body.amount = 50.00;

      const notFoundError = { kind: "not_found" };
      paymentStub = sinon.stub(Payment, 'refund').yields(notFoundError, null);

      paymentController.refund(req, res);

      expect(res.status.calledWith(404)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.include('Payment with id 999 not found');
    });

    it('should return 400 for business logic errors', () => {
      req.params.paymentId = '1';
      req.body.amount = 150.00;

      const businessError = { message: "Refund amount cannot exceed original payment amount" };
      paymentStub = sinon.stub(Payment, 'refund').yields(businessError, null);

      paymentController.refund(req, res);

      expect(res.status.calledWith(400)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.equal("Refund amount cannot exceed original payment amount");
    });

    it('should return 500 for processing errors', () => {
      req.params.paymentId = '1';
      req.body.amount = 50.00;

      const processingError = new Error('Refund service unavailable');
      paymentStub = sinon.stub(Payment, 'refund').yields(processingError, null);

      paymentController.refund(req, res);

      expect(res.status.calledWith(500)).to.be.true;
      expect(res.send.firstCall.args[0].message).to.include('Error processing refund for Payment with id 1');
    });
  });

  describe('refund - Boundary Cases', () => {
    it('should handle minimum refund amount', () => {
      req.params.paymentId = '1';
      req.body.amount = 0.01;

      const refundPayment = {
        id: 2,
        original_payment_id: 1,
        amount: -0.01,
        status: 'completed'
      };
      paymentStub = sinon.stub(Payment, 'refund').yields(null, refundPayment);

      paymentController.refund(req, res);

      expect(Payment.refund.calledWith('1', 0.01)).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(res.send.firstCall.args[0].amount).to.equal(-0.01);
    });

    it('should handle full refund', () => {
      req.params.paymentId = '1';
      req.body.amount = 100.00;

      const refundPayment = {
        id: 2,
        original_payment_id: 1,
        amount: -100.00,
        status: 'completed'
      };
      paymentStub = sinon.stub(Payment, 'refund').yields(null, refundPayment);

      paymentController.refund(req, res);

      expect(Payment.refund.calledWith('1', 100.00)).to.be.true;
      expect(res.send.calledOnce).to.be.true;
      expect(res.send.firstCall.args[0].amount).to.equal(-100.00);
    });
  });
});
const sinon = require('sinon');
const customerController = require('../../app/controllers/customer.controller');
const Customer = require('../../app/models/customer.model');

describe('Customer Controller', () => {
  let req, res;

  beforeEach(() => {
    // Mock request and response objects
    req = {
      body: {},
      params: {}
    };

    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
      json: sinon.stub()
    };

    // Stub Customer model methods
    sinon.stub(Customer, 'create');
    sinon.stub(Customer, 'getAll');
    sinon.stub(Customer, 'findById');
    sinon.stub(Customer, 'updateById');
    sinon.stub(Customer, 'remove');
    sinon.stub(Customer, 'removeAll');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('create', () => {
    it('should create a customer successfully', () => {
      req.body = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const mockCreatedCustomer = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      Customer.create.callsArgWith(1, null, mockCreatedCustomer);

      customerController.create(req, res);

      expect(Customer.create.calledOnce).toBe(true);
      expect(res.send.calledOnce).toBe(true);
      expect(res.send.calledWith(mockCreatedCustomer)).toBe(true);
    });

    it('should handle validation error when request body is empty', () => {
      req.body = null;

      customerController.create(req, res);

      expect(res.status.calledWith(400)).toBe(true);
      expect(res.send.calledWith({
        message: 'Content can not be empty!'
      })).toBe(true);
      expect(Customer.create.called).toBe(false);
    });

    it('should handle validation error when request body is undefined', () => {
      req.body = undefined;

      customerController.create(req, res);

      expect(res.status.calledWith(400)).toBe(true);
      expect(res.send.calledWith({
        message: 'Content can not be empty!'
      })).toBe(true);
      expect(Customer.create.called).toBe(false);
    });

    it('should handle database error during creation', () => {
      req.body = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const mockError = new Error('Database connection failed');
      Customer.create.callsArgWith(1, mockError, null);

      customerController.create(req, res);

      expect(Customer.create.calledOnce).toBe(true);
      expect(res.status.calledWith(500)).toBe(true);
      expect(res.send.calledWith({
        message: 'Database connection failed'
      })).toBe(true);
    });

    it('should handle error without message', () => {
      req.body = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const mockError = {};
      Customer.create.callsArgWith(1, mockError, null);

      customerController.create(req, res);

      expect(res.status.calledWith(500)).toBe(true);
      expect(res.send.calledWith({
        message: 'Some error occurred while creating the Customer.'
      })).toBe(true);
    });

    it('should handle partial customer data (boundary case)', () => {
      req.body = {
        email: 'test@example.com'
        // missing name and active
      };

      const mockCreatedCustomer = {
        id: 1,
        email: 'test@example.com',
        name: undefined,
        active: undefined
      };

      Customer.create.callsArgWith(1, null, mockCreatedCustomer);

      customerController.create(req, res);

      expect(Customer.create.calledOnce).toBe(true);
      expect(res.send.calledWith(mockCreatedCustomer)).toBe(true);
    });
  });

  describe('findAll', () => {
    it('should retrieve all customers successfully', () => {
      const mockCustomers = [
        { id: 1, email: 'test1@example.com', name: 'Test User 1', active: true },
        { id: 2, email: 'test2@example.com', name: 'Test User 2', active: false }
      ];

      Customer.getAll.callsArgWith(0, null, mockCustomers);

      customerController.findAll(req, res);

      expect(Customer.getAll.calledOnce).toBe(true);
      expect(res.send.calledOnce).toBe(true);
      expect(res.send.calledWith(mockCustomers)).toBe(true);
    });

    it('should handle empty customer list', () => {
      Customer.getAll.callsArgWith(0, null, []);

      customerController.findAll(req, res);

      expect(Customer.getAll.calledOnce).toBe(true);
      expect(res.send.calledWith([])).toBe(true);
    });

    it('should handle database error during findAll', () => {
      const mockError = new Error('Database connection failed');
      Customer.getAll.callsArgWith(0, mockError, null);

      customerController.findAll(req, res);

      expect(Customer.getAll.calledOnce).toBe(true);
      expect(res.status.calledWith(500)).toBe(true);
      expect(res.send.calledWith({
        message: 'Database connection failed'
      })).toBe(true);
    });

    it('should handle error without message', () => {
      const mockError = {};
      Customer.getAll.callsArgWith(0, mockError, null);

      customerController.findAll(req, res);

      expect(res.status.calledWith(500)).toBe(true);
      expect(res.send.calledWith({
        message: 'Some error occurred while retrieving customers.'
      })).toBe(true);
    });
  });

  describe('findOne', () => {
    it('should find a customer by id successfully', () => {
      req.params.customerId = '1';
      const mockCustomer = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      Customer.findById.callsArgWith(1, null, mockCustomer);

      customerController.findOne(req, res);

      expect(Customer.findById.calledWith('1')).toBe(true);
      expect(res.send.calledWith(mockCustomer)).toBe(true);
    });

    it('should handle customer not found', () => {
      req.params.customerId = '999';
      const mockError = { kind: 'not_found' };

      Customer.findById.callsArgWith(1, mockError, null);

      customerController.findOne(req, res);

      expect(Customer.findById.calledWith('999')).toBe(true);
      expect(res.status.calledWith(404)).toBe(true);
      expect(res.send.calledWith({
        message: 'Not found Customer with id 999.'
      })).toBe(true);
    });

    it('should handle database error during findOne', () => {
      req.params.customerId = '1';
      const mockError = new Error('Database connection failed');

      Customer.findById.callsArgWith(1, mockError, null);

      customerController.findOne(req, res);

      expect(res.status.calledWith(500)).toBe(true);
      expect(res.send.calledWith({
        message: 'Error retrieving Customer with id 1'
      })).toBe(true);
    });

    it('should handle invalid customer id (boundary case)', () => {
      req.params.customerId = 'invalid';
      const mockError = new Error('Invalid input');

      Customer.findById.callsArgWith(1, mockError, null);

      customerController.findOne(req, res);

      expect(res.status.calledWith(500)).toBe(true);
      expect(res.send.calledWith({
        message: 'Error retrieving Customer with id invalid'
      })).toBe(true);
    });

    it('should handle negative customer id (boundary case)', () => {
      req.params.customerId = '-1';
      const mockError = { kind: 'not_found' };

      Customer.findById.callsArgWith(1, mockError, null);

      customerController.findOne(req, res);

      expect(res.status.calledWith(404)).toBe(true);
      expect(res.send.calledWith({
        message: 'Not found Customer with id -1.'
      })).toBe(true);
    });
  });

  describe('update', () => {
    it('should update a customer successfully', () => {
      req.params.customerId = '1';
      req.body = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      const mockUpdatedCustomer = {
        id: 1,
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      Customer.updateById.callsArgWith(2, null, mockUpdatedCustomer);

      customerController.update(req, res);

      expect(Customer.updateById.calledOnce).toBe(true);
      expect(res.send.calledWith(mockUpdatedCustomer)).toBe(true);
    });

    it('should handle validation error when request body is empty', () => {
      req.params.customerId = '1';
      req.body = null;

      customerController.update(req, res);

      expect(res.status.calledWith(400)).toBe(true);
      expect(res.send.calledWith({
        message: 'Content can not be empty!'
      })).toBe(true);
      expect(Customer.updateById.called).toBe(false);
    });

    it('should handle customer not found during update', () => {
      req.params.customerId = '999';
      req.body = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      const mockError = { kind: 'not_found' };
      Customer.updateById.callsArgWith(2, mockError, null);

      customerController.update(req, res);

      expect(res.status.calledWith(404)).toBe(true);
      expect(res.send.calledWith({
        message: 'Not found Customer with id 999.'
      })).toBe(true);
    });

    it('should handle database error during update', () => {
      req.params.customerId = '1';
      req.body = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      const mockError = new Error('Database connection failed');
      Customer.updateById.callsArgWith(2, mockError, null);

      customerController.update(req, res);

      expect(res.status.calledWith(500)).toBe(true);
      expect(res.send.calledWith({
        message: 'Error updating Customer with id 1'
      })).toBe(true);
    });

    it('should handle partial update data (boundary case)', () => {
      req.params.customerId = '1';
      req.body = {
        email: 'updated@example.com'
        // missing name and active
      };

      const mockUpdatedCustomer = {
        id: 1,
        email: 'updated@example.com',
        name: undefined,
        active: undefined
      };

      Customer.updateById.callsArgWith(2, null, mockUpdatedCustomer);

      customerController.update(req, res);

      expect(res.send.calledWith(mockUpdatedCustomer)).toBe(true);
    });
  });

  describe('delete', () => {
    it('should delete a customer successfully', () => {
      req.params.customerId = '1';
      const mockResult = { affectedRows: 1 };

      Customer.remove.callsArgWith(1, null, mockResult);

      customerController.delete(req, res);

      expect(Customer.remove.calledWith('1')).toBe(true);
      expect(res.send.calledWith({
        message: 'Customer was deleted successfully!'
      })).toBe(true);
    });

    it('should handle customer not found during delete', () => {
      req.params.customerId = '999';
      const mockError = { kind: 'not_found' };

      Customer.remove.callsArgWith(1, mockError, null);

      customerController.delete(req, res);

      expect(res.status.calledWith(404)).toBe(true);
      expect(res.send.calledWith({
        message: 'Not found Customer with id 999.'
      })).toBe(true);
    });

    it('should handle database error during delete', () => {
      req.params.customerId = '1';
      const mockError = new Error('Database connection failed');

      Customer.remove.callsArgWith(1, mockError, null);

      customerController.delete(req, res);

      expect(res.status.calledWith(500)).toBe(true);
      expect(res.send.calledWith({
        message: 'Could not delete Customer with id 1'
      })).toBe(true);
    });

    it('should handle invalid customer id (boundary case)', () => {
      req.params.customerId = 'invalid';
      const mockError = new Error('Invalid input');

      Customer.remove.callsArgWith(1, mockError, null);

      customerController.delete(req, res);

      expect(res.status.calledWith(500)).toBe(true);
      expect(res.send.calledWith({
        message: 'Could not delete Customer with id invalid'
      })).toBe(true);
    });
  });

  describe('deleteAll', () => {
    it('should delete all customers successfully', () => {
      const mockResult = { affectedRows: 5 };

      Customer.removeAll.callsArgWith(0, null, mockResult);

      customerController.deleteAll(req, res);

      expect(Customer.removeAll.calledOnce).toBe(true);
      expect(res.send.calledWith({
        message: 'All Customers were deleted successfully!'
      })).toBe(true);
    });

    it('should handle no customers to delete (boundary case)', () => {
      const mockResult = { affectedRows: 0 };

      Customer.removeAll.callsArgWith(0, null, mockResult);

      customerController.deleteAll(req, res);

      expect(res.send.calledWith({
        message: 'All Customers were deleted successfully!'
      })).toBe(true);
    });

    it('should handle database error during deleteAll', () => {
      const mockError = new Error('Database connection failed');

      Customer.removeAll.callsArgWith(0, mockError, null);

      customerController.deleteAll(req, res);

      expect(res.status.calledWith(500)).toBe(true);
      expect(res.send.calledWith({
        message: 'Database connection failed'
      })).toBe(true);
    });

    it('should handle error without message', () => {
      const mockError = {};

      Customer.removeAll.callsArgWith(0, mockError, null);

      customerController.deleteAll(req, res);

      expect(res.status.calledWith(500)).toBe(true);
      expect(res.send.calledWith({
        message: 'Some error occurred while removing all customers.'
      })).toBe(true);
    });
  });
});
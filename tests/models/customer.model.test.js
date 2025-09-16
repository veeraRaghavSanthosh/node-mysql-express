const sinon = require('sinon');

// Mock the database connection before requiring the Customer model
const mockDb = {
  query: sinon.stub()
};

// Mock the require for db.js
const Module = require('module');
const originalRequire = Module.prototype.require;
Module.prototype.require = function(...args) {
  if (args[0] === './db.js') {
    return mockDb;
  }
  return originalRequire.apply(this, args);
};

const Customer = require('../../app/models/customer.model');

describe('Customer Model', () => {
  beforeEach(() => {
    // Reset all stubs before each test
    mockDb.query.reset();
  });

  afterEach(() => {
    // Clean up after each test
    sinon.resetHistory();
  });

  describe('Customer Constructor', () => {
    it('should create a customer object with correct properties', () => {
      const customerData = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const customer = new Customer(customerData);

      expect(customer.email).toBe('test@example.com');
      expect(customer.name).toBe('Test User');
      expect(customer.active).toBe(true);
    });

    it('should handle undefined properties gracefully', () => {
      const customerData = {
        email: 'test@example.com'
      };

      const customer = new Customer(customerData);

      expect(customer.email).toBe('test@example.com');
      expect(customer.name).toBeUndefined();
      expect(customer.active).toBeUndefined();
    });

    it('should handle empty object (boundary case)', () => {
      const customerData = {};

      const customer = new Customer(customerData);

      expect(customer.email).toBeUndefined();
      expect(customer.name).toBeUndefined();
      expect(customer.active).toBeUndefined();
    });
  });

  describe('Customer.create', () => {
    it('should successfully create a customer', (done) => {
      const newCustomer = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const mockResult = {
        insertId: 1
      };

      mockDb.query.callsArgWith(2, null, mockResult);

      Customer.create(newCustomer, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual({
          id: 1,
          email: 'test@example.com',
          name: 'Test User',
          active: true
        });
        expect(mockDb.query.calledOnce).toBe(true);
        expect(mockDb.query.calledWith('INSERT INTO customers SET ?', newCustomer)).toBe(true);
        done();
      });
    });

    it('should handle database error during creation', (done) => {
      const newCustomer = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const mockError = new Error('Database connection failed');
      mockDb.query.callsArgWith(2, mockError, null);

      Customer.create(newCustomer, (err, data) => {
        expect(err).toBe(mockError);
        expect(data).toBeNull();
        expect(mockDb.query.calledOnce).toBe(true);
        done();
      });
    });

    it('should handle duplicate email error', (done) => {
      const newCustomer = {
        email: 'duplicate@example.com',
        name: 'Test User',
        active: true
      };

      const mockError = new Error('Duplicate entry');
      mockError.code = 'ER_DUP_ENTRY';
      mockDb.query.callsArgWith(2, mockError, null);

      Customer.create(newCustomer, (err, data) => {
        expect(err).toBe(mockError);
        expect(data).toBeNull();
        done();
      });
    });

    it('should handle null customer data (boundary case)', (done) => {
      const newCustomer = null;

      const mockError = new Error('Invalid input');
      mockDb.query.callsArgWith(2, mockError, null);

      Customer.create(newCustomer, (err, data) => {
        expect(err).toBe(mockError);
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('Customer.findById', () => {
    it('should find a customer by id successfully', (done) => {
      const customerId = 1;
      const mockCustomer = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      mockDb.query.callsArgWith(1, null, [mockCustomer]);

      Customer.findById(customerId, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual(mockCustomer);
        expect(mockDb.query.calledOnce).toBe(true);
        expect(mockDb.query.calledWith(`SELECT * FROM customers WHERE id = ${customerId}`)).toBe(true);
        done();
      });
    });

    it('should handle customer not found', (done) => {
      const customerId = 999;
      mockDb.query.callsArgWith(1, null, []);

      Customer.findById(customerId, (err, data) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(data).toBeNull();
        expect(mockDb.query.calledOnce).toBe(true);
        done();
      });
    });

    it('should handle database error during find', (done) => {
      const customerId = 1;
      const mockError = new Error('Database connection failed');
      mockDb.query.callsArgWith(1, mockError, null);

      Customer.findById(customerId, (err, data) => {
        expect(err).toBe(mockError);
        expect(data).toBeNull();
        expect(mockDb.query.calledOnce).toBe(true);
        done();
      });
    });

    it('should handle invalid customer id (boundary case)', (done) => {
      const customerId = 'invalid';
      const mockError = new Error('Invalid input');
      mockDb.query.callsArgWith(1, mockError, null);

      Customer.findById(customerId, (err, data) => {
        expect(err).toBe(mockError);
        expect(data).toBeNull();
        done();
      });
    });

    it('should handle negative customer id (boundary case)', (done) => {
      const customerId = -1;
      mockDb.query.callsArgWith(1, null, []);

      Customer.findById(customerId, (err, data) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(data).toBeNull();
        done();
      });
    });

    it('should handle zero customer id (boundary case)', (done) => {
      const customerId = 0;
      mockDb.query.callsArgWith(1, null, []);

      Customer.findById(customerId, (err, data) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('Customer.getAll', () => {
    it('should retrieve all customers successfully', (done) => {
      const mockCustomers = [
        { id: 1, email: 'test1@example.com', name: 'Test User 1', active: true },
        { id: 2, email: 'test2@example.com', name: 'Test User 2', active: false }
      ];

      mockDb.query.callsArgWith(1, null, mockCustomers);

      Customer.getAll((err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual(mockCustomers);
        expect(mockDb.query.calledOnce).toBe(true);
        expect(mockDb.query.calledWith('SELECT * FROM customers')).toBe(true);
        done();
      });
    });

    it('should handle empty customer list', (done) => {
      mockDb.query.callsArgWith(1, null, []);

      Customer.getAll((err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual([]);
        expect(mockDb.query.calledOnce).toBe(true);
        done();
      });
    });

    it('should handle database error during getAll', (done) => {
      const mockError = new Error('Database connection failed');
      mockDb.query.callsArgWith(1, mockError, null);

      Customer.getAll((err, data) => {
        expect(err).toBe(mockError);
        expect(data).toBeNull();
        expect(mockDb.query.calledOnce).toBe(true);
        done();
      });
    });

    it('should handle large result set (boundary case)', (done) => {
      const mockCustomers = [];
      for (let i = 1; i <= 1000; i++) {
        mockCustomers.push({
          id: i,
          email: `test${i}@example.com`,
          name: `Test User ${i}`,
          active: i % 2 === 0
        });
      }

      mockDb.query.callsArgWith(1, null, mockCustomers);

      Customer.getAll((err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual(mockCustomers);
        expect(data.length).toBe(1000);
        done();
      });
    });
  });

  describe('Customer.updateById', () => {
    it('should update a customer successfully', (done) => {
      const customerId = 1;
      const customerData = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      const mockResult = {
        affectedRows: 1
      };

      mockDb.query.callsArgWith(2, null, mockResult);

      Customer.updateById(customerId, customerData, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual({
          id: customerId,
          email: 'updated@example.com',
          name: 'Updated User',
          active: false
        });
        expect(mockDb.query.calledOnce).toBe(true);
        expect(mockDb.query.calledWith(
          'UPDATE customers SET email = ?, name = ?, active = ? WHERE id = ?',
          [customerData.email, customerData.name, customerData.active, customerId]
        )).toBe(true);
        done();
      });
    });

    it('should handle customer not found during update', (done) => {
      const customerId = 999;
      const customerData = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      const mockResult = {
        affectedRows: 0
      };

      mockDb.query.callsArgWith(2, null, mockResult);

      Customer.updateById(customerId, customerData, (err, data) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(data).toBeNull();
        expect(mockDb.query.calledOnce).toBe(true);
        done();
      });
    });

    it('should handle database error during update', (done) => {
      const customerId = 1;
      const customerData = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      const mockError = new Error('Database connection failed');
      mockDb.query.callsArgWith(2, mockError, null);

      Customer.updateById(customerId, customerData, (err, data) => {
        expect(err).toBe(mockError);
        expect(data).toBeNull();
        expect(mockDb.query.calledOnce).toBe(true);
        done();
      });
    });

    it('should handle partial update data (boundary case)', (done) => {
      const customerId = 1;
      const customerData = {
        email: 'updated@example.com'
        // missing name and active
      };

      const mockResult = {
        affectedRows: 1
      };

      mockDb.query.callsArgWith(2, null, mockResult);

      Customer.updateById(customerId, customerData, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual({
          id: customerId,
          email: 'updated@example.com',
          name: undefined,
          active: undefined
        });
        done();
      });
    });

    it('should handle invalid customer id (boundary case)', (done) => {
      const customerId = 'invalid';
      const customerData = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
      };

      const mockError = new Error('Invalid input');
      mockDb.query.callsArgWith(2, mockError, null);

      Customer.updateById(customerId, customerData, (err, data) => {
        expect(err).toBe(mockError);
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('Customer.remove', () => {
    it('should delete a customer successfully', (done) => {
      const customerId = 1;
      const mockResult = {
        affectedRows: 1
      };

      mockDb.query.callsArgWith(2, null, mockResult);

      Customer.remove(customerId, (err, data) => {
        expect(err).toBeNull();
        expect(data).toBe(mockResult);
        expect(mockDb.query.calledOnce).toBe(true);
        expect(mockDb.query.calledWith('DELETE FROM customers WHERE id = ?', customerId)).toBe(true);
        done();
      });
    });

    it('should handle customer not found during delete', (done) => {
      const customerId = 999;
      const mockResult = {
        affectedRows: 0
      };

      mockDb.query.callsArgWith(2, null, mockResult);

      Customer.remove(customerId, (err, data) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(data).toBeNull();
        expect(mockDb.query.calledOnce).toBe(true);
        done();
      });
    });

    it('should handle database error during delete', (done) => {
      const customerId = 1;
      const mockError = new Error('Database connection failed');
      mockDb.query.callsArgWith(2, mockError, null);

      Customer.remove(customerId, (err, data) => {
        expect(err).toBe(mockError);
        expect(data).toBeNull();
        expect(mockDb.query.calledOnce).toBe(true);
        done();
      });
    });

    it('should handle invalid customer id (boundary case)', (done) => {
      const customerId = 'invalid';
      const mockError = new Error('Invalid input');
      mockDb.query.callsArgWith(2, mockError, null);

      Customer.remove(customerId, (err, data) => {
        expect(err).toBe(mockError);
        expect(data).toBeNull();
        done();
      });
    });

    it('should handle negative customer id (boundary case)', (done) => {
      const customerId = -1;
      const mockResult = {
        affectedRows: 0
      };

      mockDb.query.callsArgWith(2, null, mockResult);

      Customer.remove(customerId, (err, data) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('Customer.removeAll', () => {
    it('should delete all customers successfully', (done) => {
      const mockResult = {
        affectedRows: 5
      };

      mockDb.query.callsArgWith(1, null, mockResult);

      Customer.removeAll((err, data) => {
        expect(err).toBeNull();
        expect(data).toBe(mockResult);
        expect(mockDb.query.calledOnce).toBe(true);
        expect(mockDb.query.calledWith('DELETE FROM customers')).toBe(true);
        done();
      });
    });

    it('should handle no customers to delete (boundary case)', (done) => {
      const mockResult = {
        affectedRows: 0
      };

      mockDb.query.callsArgWith(1, null, mockResult);

      Customer.removeAll((err, data) => {
        expect(err).toBeNull();
        expect(data).toBe(mockResult);
        expect(mockDb.query.calledOnce).toBe(true);
        done();
      });
    });

    it('should handle database error during removeAll', (done) => {
      const mockError = new Error('Database connection failed');
      mockDb.query.callsArgWith(1, mockError, null);

      Customer.removeAll((err, data) => {
        expect(err).toBe(mockError);
        expect(data).toBeNull();
        expect(mockDb.query.calledOnce).toBe(true);
        done();
      });
    });

    it('should handle large deletion (boundary case)', (done) => {
      const mockResult = {
        affectedRows: 10000
      };

      mockDb.query.callsArgWith(1, null, mockResult);

      Customer.removeAll((err, data) => {
        expect(err).toBeNull();
        expect(data).toBe(mockResult);
        expect(data.affectedRows).toBe(10000);
        done();
      });
    });
  });
});
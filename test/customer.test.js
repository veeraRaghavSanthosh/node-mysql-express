const Customer = require("../app/models/customer.model.js");
const customerController = require("../app/controllers/customer.controller.js");
const assert = require('assert');

// Mock response object for testing
const createMockResponse = () => {
  const res = {};
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.send = (data) => {
    res.data = data;
    return res;
  };
  return res;
};

// Test Customer Model
describe('Customer Model', () => {
  
  describe('Constructor', () => {
    it('should throw TypeError when customer data is null', () => {
      assert.throws(() => {
        new Customer(null);
      }, TypeError, 'Customer data must be a valid object');
    });

    it('should throw TypeError when customer data is undefined', () => {
      assert.throws(() => {
        new Customer(undefined);
      }, TypeError, 'Customer data must be a valid object');
    });

    it('should throw TypeError when customer data is not an object', () => {
      assert.throws(() => {
        new Customer("not an object");
      }, TypeError, 'Customer data must be a valid object');
    });

    it('should throw TypeError when email is null', () => {
      assert.throws(() => {
        new Customer({
          email: null,
          name: "Test Name",
          active: true
        });
      }, TypeError, 'Customer email cannot be null or undefined');
    });

    it('should throw TypeError when email is undefined', () => {
      assert.throws(() => {
        new Customer({
          name: "Test Name",
          active: true
        });
      }, TypeError, 'Customer email cannot be null or undefined');
    });

    it('should throw TypeError when name is null', () => {
      assert.throws(() => {
        new Customer({
          email: "test@example.com",
          name: null,
          active: true
        });
      }, TypeError, 'Customer name cannot be null or undefined');
    });

    it('should throw TypeError when name is undefined', () => {
      assert.throws(() => {
        new Customer({
          email: "test@example.com",
          active: true
        });
      }, TypeError, 'Customer name cannot be null or undefined');
    });

    it('should create customer successfully with valid data', () => {
      const customer = new Customer({
        email: "test@example.com",
        name: "Test Name",
        active: true
      });
      
      assert.strictEqual(customer.email, "test@example.com");
      assert.strictEqual(customer.name, "Test Name");
      assert.strictEqual(customer.active, true);
    });

    it('should default active to true when not provided', () => {
      const customer = new Customer({
        email: "test@example.com",
        name: "Test Name"
      });
      
      assert.strictEqual(customer.active, true);
    });

    it('should handle active as false when explicitly set', () => {
      const customer = new Customer({
        email: "test@example.com",
        name: "Test Name",
        active: false
      });
      
      assert.strictEqual(customer.active, false);
    });
  });

  describe('findById', () => {
    it('should handle null customerId', (done) => {
      Customer.findById(null, (err, data) => {
        assert(err);
        assert.strictEqual(err.kind, "invalid_input");
        assert.strictEqual(err.message, "Customer ID cannot be null or undefined");
        assert.strictEqual(data, null);
        done();
      });
    });

    it('should handle undefined customerId', (done) => {
      Customer.findById(undefined, (err, data) => {
        assert(err);
        assert.strictEqual(err.kind, "invalid_input");
        assert.strictEqual(err.message, "Customer ID cannot be null or undefined");
        assert.strictEqual(data, null);
        done();
      });
    });
  });

  describe('updateById', () => {
    it('should handle null id', (done) => {
      const customer = { email: "test@example.com", name: "Test", active: true };
      Customer.updateById(null, customer, (err, data) => {
        assert(err);
        assert.strictEqual(err.kind, "invalid_input");
        assert.strictEqual(err.message, "Customer ID cannot be null or undefined");
        assert.strictEqual(data, null);
        done();
      });
    });

    it('should handle null customer data', (done) => {
      Customer.updateById(1, null, (err, data) => {
        assert(err);
        assert.strictEqual(err.kind, "invalid_input");
        assert.strictEqual(err.message, "Customer data must be a valid object");
        assert.strictEqual(data, null);
        done();
      });
    });
  });

  describe('remove', () => {
    it('should handle null id', (done) => {
      Customer.remove(null, (err, data) => {
        assert(err);
        assert.strictEqual(err.kind, "invalid_input");
        assert.strictEqual(err.message, "Customer ID cannot be null or undefined");
        assert.strictEqual(data, null);
        done();
      });
    });

    it('should handle undefined id', (done) => {
      Customer.remove(undefined, (err, data) => {
        assert(err);
        assert.strictEqual(err.kind, "invalid_input");
        assert.strictEqual(err.message, "Customer ID cannot be null or undefined");
        assert.strictEqual(data, null);
        done();
      });
    });
  });
});

// Test Customer Controller
describe('Customer Controller', () => {
  
  describe('create', () => {
    it('should return 400 when request body is null', () => {
      const req = { body: null };
      const res = createMockResponse();
      
      customerController.create(req, res);
      
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.message, "Content can not be empty!");
    });

    it('should return 400 when email is null', () => {
      const req = { 
        body: { 
          email: null, 
          name: "Test Name", 
          active: true 
        } 
      };
      const res = createMockResponse();
      
      customerController.create(req, res);
      
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.message, "Email is required and cannot be null!");
    });

    it('should return 400 when name is null', () => {
      const req = { 
        body: { 
          email: "test@example.com", 
          name: null, 
          active: true 
        } 
      };
      const res = createMockResponse();
      
      customerController.create(req, res);
      
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.message, "Name is required and cannot be null!");
    });
  });

  describe('findOne', () => {
    it('should return 400 when customerId is null', () => {
      const req = { params: { customerId: null } };
      const res = createMockResponse();
      
      customerController.findOne(req, res);
      
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.message, "Customer ID is required and cannot be null!");
    });
  });

  describe('update', () => {
    it('should return 400 when customerId is null', () => {
      const req = { 
        params: { customerId: null },
        body: { email: "test@example.com", name: "Test", active: true }
      };
      const res = createMockResponse();
      
      customerController.update(req, res);
      
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.message, "Customer ID is required and cannot be null!");
    });

    it('should return 400 when email is null in update', () => {
      const req = { 
        params: { customerId: "1" },
        body: { email: null, name: "Test", active: true }
      };
      const res = createMockResponse();
      
      customerController.update(req, res);
      
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.message, "Email cannot be null or undefined!");
    });

    it('should return 400 when name is null in update', () => {
      const req = { 
        params: { customerId: "1" },
        body: { email: "test@example.com", name: null, active: true }
      };
      const res = createMockResponse();
      
      customerController.update(req, res);
      
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.message, "Name cannot be null or undefined!");
    });
  });

  describe('delete', () => {
    it('should return 400 when customerId is null', () => {
      const req = { params: { customerId: null } };
      const res = createMockResponse();
      
      customerController.delete(req, res);
      
      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.data.message, "Customer ID is required and cannot be null!");
    });
  });
});

console.log('All null input validation tests completed successfully!');
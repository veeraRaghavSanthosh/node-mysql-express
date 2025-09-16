const Customer = require('./app/models/customer.model');
const sql = require('./app/models/db');

// Mock the database connection
jest.mock('./app/models/db');

describe('Customer Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should create a customer instance with all properties', () => {
      const customerData = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const customer = new Customer(customerData);

      expect(customer.email).toBe(customerData.email);
      expect(customer.name).toBe(customerData.name);
      expect(customer.active).toBe(customerData.active);
    });

    it('should handle empty object', () => {
      const customer = new Customer({});

      expect(customer.email).toBeUndefined();
      expect(customer.name).toBeUndefined();
      expect(customer.active).toBeUndefined();
    });
  });

  describe('create', () => {
    it('should create a new customer in database', (done) => {
      const customerData = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const mockResult = {
        insertId: 1,
        affectedRows: 1
      };

      sql.query.mockImplementation((query, params, callback) => {
        expect(query).toContain('INSERT INTO customers');
        expect(params).toEqual([customerData.email, customerData.name, customerData.active]);
        callback(null, mockResult);
      });

      Customer.create(customerData, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual({ id: 1, ...customerData });
        done();
      });
    });

    it('should handle database connection error', (done) => {
      const customerData = {
        email: 'error@example.com',
        name: 'Error User'
      };

      const mockError = new Error('Connection failed');

      sql.query.mockImplementation((query, params, callback) => {
        callback(mockError, null);
      });

      Customer.create(customerData, (err, data) => {
        expect(err).toBe(mockError);
        expect(data).toBeNull();
        done();
      });
    });
  });

  describe('getAll', () => {
    it('should retrieve all customers from database', (done) => {
      const mockCustomers = [
        { id: 1, email: 'user1@example.com', name: 'User 1', active: true },
        { id: 2, email: 'user2@example.com', name: 'User 2', active: false }
      ];

      sql.query.mockImplementation((query, callback) => {
        expect(query).toContain('SELECT * FROM customers');
        callback(null, mockCustomers);
      });

      Customer.getAll((err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual(mockCustomers);
        done();
      });
    });

    it('should handle empty result set', (done) => {
      sql.query.mockImplementation((query, callback) => {
        callback(null, []);
      });

      Customer.getAll((err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual([]);
        done();
      });
    });
  });

  describe('findById', () => {
    it('should find customer by ID', (done) => {
      const customerId = 1;
      const mockCustomer = { id: 1, email: 'user1@example.com', name: 'User 1', active: true };

      sql.query.mockImplementation((query, params, callback) => {
        expect(query).toContain('SELECT * FROM customers WHERE id = ?');
        expect(params).toEqual([customerId]);
        callback(null, [mockCustomer]);
      });

      Customer.findById(customerId, (err, data) => {
        expect(err).toBeNull();
        expect(data).toEqual(mockCustomer);
        done();
      });
    });

    it('should handle customer not found', (done) => {
      const customerId = 999;

      sql.query.mockImplementation((query, params, callback) => {
        callback(null, []);
      });

      Customer.findById(customerId, (err, data) => {
        expect(err).toEqual({ kind: 'not_found' });
        expect(data).toBeNull();
        done();
      });
    });
  });
});
const Customer = require('../app/models/customer.model');

// Mock the database connection
jest.mock('../app/models/db.js');
const sql = require('../app/models/db.js');

describe('Customer Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Customer.create', () => {
    it('should create a customer successfully', () => {
      const mockCustomer = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const mockResult = {
        insertId: 1
      };

      sql.query.mockImplementation((query, data, callback) => {
        callback(null, mockResult);
      });

      const resultCallback = jest.fn();
      Customer.create(mockCustomer, resultCallback);

      expect(sql.query).toHaveBeenCalledWith(
        'INSERT INTO customers SET ?',
        mockCustomer,
        expect.any(Function)
      );
      expect(resultCallback).toHaveBeenCalledWith(null, {
        id: 1,
        ...mockCustomer
      });
    });

    it('should handle database error during creation', () => {
      const mockCustomer = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
      };

      const mockError = new Error('Database connection failed');

      sql.query.mockImplementation((query, data, callback) => {
        callback(mockError, null);
      });

      const resultCallback = jest.fn();
      Customer.create(mockCustomer, resultCallback);

      expect(resultCallback).toHaveBeenCalledWith(mockError, null);
    });
  });

  describe('Customer constructor', () => {
    it('should create a customer instance with correct properties', () => {
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
  });
});
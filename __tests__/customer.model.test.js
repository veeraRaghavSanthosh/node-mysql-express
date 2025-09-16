const Customer = require("../app/models/customer.model");

// Mock the database connection
jest.mock("../app/models/db.js", () => ({
  query: jest.fn()
}));

const mockDb = require("../app/models/db.js");

describe("Customer Model", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Customer constructor", () => {
    it("should create a customer object with correct properties", () => {
      const customerData = {
        email: "test@example.com",
        name: "Test User",
        active: true
      };

      const customer = new Customer(customerData);

      expect(customer.email).toBe(customerData.email);
      expect(customer.name).toBe(customerData.name);
      expect(customer.active).toBe(customerData.active);
    });
  });

  describe("Customer.create", () => {
    it("should create a new customer successfully", (done) => {
      const newCustomer = {
        email: "test@example.com",
        name: "Test User",
        active: true
      };

      const mockResult = { insertId: 1 };
      mockDb.query.mockImplementation((query, data, callback) => {
        callback(null, mockResult);
      });

      Customer.create(newCustomer, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({ id: 1, ...newCustomer });
        expect(mockDb.query).toHaveBeenCalledWith(
          "INSERT INTO customers SET ?",
          newCustomer,
          expect.any(Function)
        );
        done();
      });
    });

    it("should handle database error during creation", (done) => {
      const newCustomer = {
        email: "test@example.com",
        name: "Test User",
        active: true
      };

      const mockError = new Error("Database error");
      mockDb.query.mockImplementation((query, data, callback) => {
        callback(mockError, null);
      });

      Customer.create(newCustomer, (err, result) => {
        expect(err).toBe(mockError);
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe("Customer.findById", () => {
    it("should find a customer by id successfully", (done) => {
      const customerId = 1;
      const mockCustomer = { id: 1, email: "test@example.com", name: "Test User", active: true };

      mockDb.query.mockImplementation((query, callback) => {
        callback(null, [mockCustomer]);
      });

      Customer.findById(customerId, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual(mockCustomer);
        expect(mockDb.query).toHaveBeenCalledWith(
          `SELECT * FROM customers WHERE id = ${customerId}`,
          expect.any(Function)
        );
        done();
      });
    });

    it("should handle customer not found", (done) => {
      const customerId = 999;

      mockDb.query.mockImplementation((query, callback) => {
        callback(null, []); // Empty result
      });

      Customer.findById(customerId, (err, result) => {
        expect(err).toEqual({ kind: "not_found" });
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe("Customer.getAll", () => {
    it("should get all customers successfully", (done) => {
      const mockCustomers = [
        { id: 1, email: "test1@example.com", name: "Test User 1", active: true },
        { id: 2, email: "test2@example.com", name: "Test User 2", active: false }
      ];

      mockDb.query.mockImplementation((query, callback) => {
        callback(null, mockCustomers);
      });

      Customer.getAll((err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual(mockCustomers);
        expect(mockDb.query).toHaveBeenCalledWith(
          "SELECT * FROM customers",
          expect.any(Function)
        );
        done();
      });
    });
  });
});
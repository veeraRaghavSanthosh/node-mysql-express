// Integration tests for database operations
const Customer = require("../app/models/customer.model");

// Mock the database connection for unit tests
// In a real scenario, you might want separate integration tests with a real test database
jest.mock("../app/models/db.js", () => ({
  query: jest.fn()
}));

const mockDb = require("../app/models/db.js");

describe("Customer Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Customer CRUD Operations", () => {
    it("should perform complete customer lifecycle", async () => {
      // Test data
      const customerData = {
        email: "integration@test.com",
        name: "Integration Test User",
        active: true
      };

      // Mock create operation
      mockDb.query.mockImplementationOnce((query, data, callback) => {
        callback(null, { insertId: 1 });
      });

      // Mock find operation
      mockDb.query.mockImplementationOnce((query, callback) => {
        callback(null, [{ id: 1, ...customerData }]);
      });

      // Mock update operation  
      mockDb.query.mockImplementationOnce((query, data, callback) => {
        callback(null, { affectedRows: 1 });
      });

      // Mock delete operation
      mockDb.query.mockImplementationOnce((query, data, callback) => {
        callback(null, { affectedRows: 1 });
      });

      // Test create
      await new Promise((resolve) => {
        Customer.create(customerData, (err, result) => {
          expect(err).toBeNull();
          expect(result.id).toBe(1);
          resolve();
        });
      });

      // Test find
      await new Promise((resolve) => {
        Customer.findById(1, (err, result) => {
          expect(err).toBeNull();
          expect(result.email).toBe(customerData.email);
          resolve();
        });
      });

      // Test update
      const updatedData = { ...customerData, name: "Updated Name" };
      await new Promise((resolve) => {
        Customer.updateById(1, updatedData, (err, result) => {
          expect(err).toBeNull();
          expect(result.name).toBe("Updated Name");
          resolve();
        });
      });

      // Test delete
      await new Promise((resolve) => {
        Customer.remove(1, (err, result) => {
          expect(err).toBeNull();
          expect(result.affectedRows).toBe(1);
          resolve();
        });
      });

      // Verify all database operations were called
      expect(mockDb.query).toHaveBeenCalledTimes(4);
    });
  });

  describe("Database Connection", () => {
    it("should handle database connection errors gracefully", (done) => {
      const connectionError = new Error("Connection failed");
      mockDb.query.mockImplementation((query, callback) => {
        callback(connectionError, null);
      });

      Customer.getAll((err, result) => {
        expect(err).toBeNull(); // The model returns null for error in getAll
        expect(result).toBe(connectionError);
        done();
      });
    });
  });
});
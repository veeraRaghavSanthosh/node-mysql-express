const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");

// Mock the database connection
jest.mock("../app/models/db.js", () => ({
  query: jest.fn()
}));

const Customer = require("../app/models/customer.model.js");

// Create express app for testing
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Setup routes
require("../app/routes/customer.routes.js")(app);

describe("Customer API", () => {
  const mockQuery = require("../app/models/db.js").query;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /customers", () => {
    test("should create a new customer", async () => {
      const mockCustomer = {
        email: "test@example.com",
        name: "Test User",
        active: true
      };

      mockQuery.mockImplementation((query, data, callback) => {
        callback(null, { insertId: 1 });
      });

      const response = await request(app)
        .post("/customers")
        .send(mockCustomer)
        .expect(200);

      expect(response.body).toEqual({
        id: 1,
        ...mockCustomer
      });
    });

    test("should return 400 for empty request body", async () => {
      const response = await request(app)
        .post("/customers")
        .send()
        .expect(400);

      expect(response.body.message).toBe("Content can not be empty!");
    });

    test("should handle database errors", async () => {
      const mockCustomer = {
        email: "test@example.com",
        name: "Test User",
        active: true
      };

      mockQuery.mockImplementation((query, data, callback) => {
        callback(new Error("Database error"), null);
      });

      const response = await request(app)
        .post("/customers")
        .send(mockCustomer)
        .expect(500);

      expect(response.body.message).toBe("Database error");
    });
  });

  describe("GET /customers", () => {
    test("should return all customers", async () => {
      const mockCustomers = [
        { id: 1, email: "test1@example.com", name: "Test User 1", active: true },
        { id: 2, email: "test2@example.com", name: "Test User 2", active: false }
      ];

      mockQuery.mockImplementation((query, callback) => {
        callback(null, mockCustomers);
      });

      const response = await request(app)
        .get("/customers")
        .expect(200);

      expect(response.body).toEqual(mockCustomers);
    });

    test("should handle database errors", async () => {
      mockQuery.mockImplementation((query, callback) => {
        callback(new Error("Database connection failed"), null);
      });

      const response = await request(app)
        .get("/customers")
        .expect(500);

      expect(response.body.message).toBe("Database connection failed");
    });
  });

  describe("GET /customers/:customerId", () => {
    test("should return a specific customer", async () => {
      const mockCustomer = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        active: true
      };

      mockQuery.mockImplementation((query, callback) => {
        callback(null, [mockCustomer]);
      });

      const response = await request(app)
        .get("/customers/1")
        .expect(200);

      expect(response.body).toEqual(mockCustomer);
    });

    test("should return 404 for non-existent customer", async () => {
      mockQuery.mockImplementation((query, callback) => {
        callback(null, []);
      });

      const response = await request(app)
        .get("/customers/999")
        .expect(404);

      expect(response.body.message).toBe("Not found Customer with id 999.");
    });
  });
});

describe("Customer Model", () => {
  const mockQuery = require("../app/models/db.js").query;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Customer.create", () => {
    test("should create a customer successfully", (done) => {
      const customerData = {
        email: "test@example.com",
        name: "Test User",
        active: true
      };

      mockQuery.mockImplementation((query, data, callback) => {
        callback(null, { insertId: 1 });
      });

      Customer.create(customerData, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual({
          id: 1,
          ...customerData
        });
        done();
      });
    });

    test("should handle database errors", (done) => {
      const customerData = {
        email: "test@example.com",
        name: "Test User",
        active: true
      };

      mockQuery.mockImplementation((query, data, callback) => {
        callback(new Error("Database error"), null);
      });

      Customer.create(customerData, (err, result) => {
        expect(err).toEqual(new Error("Database error"));
        expect(result).toBeNull();
        done();
      });
    });
  });

  describe("Customer.findById", () => {
    test("should find a customer by ID", (done) => {
      const mockCustomer = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        active: true
      };

      mockQuery.mockImplementation((query, callback) => {
        callback(null, [mockCustomer]);
      });

      Customer.findById(1, (err, result) => {
        expect(err).toBeNull();
        expect(result).toEqual(mockCustomer);
        done();
      });
    });

    test("should return not found error", (done) => {
      mockQuery.mockImplementation((query, callback) => {
        callback(null, []);
      });

      Customer.findById(999, (err, result) => {
        expect(err).toEqual({ kind: "not_found" });
        expect(result).toBeNull();
        done();
      });
    });
  });
});
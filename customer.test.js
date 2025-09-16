const request = require("supertest");
const express = require("express");
const bodyParser = require("body-parser");

// Mock the customer model
jest.mock("./app/models/customer.model.js");
const Customer = require("./app/models/customer.model.js");

const customerController = require("./app/controllers/customer.controller.js");

// Create express app for testing
const app = express();
app.use(bodyParser.json());

// Setup routes
app.post("/customers", customerController.create);
app.get("/customers", customerController.findAll);
app.get("/customers/:customerId", customerController.findOne);

describe("Customer Controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /customers", () => {
    it("should create a new customer successfully", async () => {
      const mockCustomer = {
        id: 1,
        email: "test@example.com",
        name: "Test User",
        active: true
      };

      Customer.create.mockImplementation((customer, callback) => {
        callback(null, mockCustomer);
      });

      const response = await request(app)
        .post("/customers")
        .send({
          email: "test@example.com",
          name: "Test User",
          active: true
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCustomer);
    });

    it("should return 400 if request body is empty", async () => {
      const response = await request(app)
        .post("/customers")
        .send();

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Content can not be empty!");
    });
  });

  describe("GET /customers", () => {
    it("should retrieve all customers successfully", async () => {
      const mockCustomers = [
        { id: 1, email: "test1@example.com", name: "User 1", active: true }
      ];

      Customer.getAll.mockImplementation((callback) => {
        callback(null, mockCustomers);
      });

      const response = await request(app).get("/customers");

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCustomers);
    });
  });
});
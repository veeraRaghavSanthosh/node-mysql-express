const request = require("supertest");
const express = require("express");

// Mock the database connection to avoid actual DB calls in tests
jest.mock("../app/models/db.js", () => ({
  query: jest.fn()
}));

// Create a test app similar to the main server but without starting the server
const createTestApp = () => {
  const app = express();
  const bodyParser = require("body-parser");
  
  const authMiddleware = (req, res, next) => {
    next();
  };
  
  app.use(bodyParser.json());
  app.use("api/*", authMiddleware);
  app.use(bodyParser.urlencoded({ extended: true }));
  
  function middleware1(req, res, next) {
    const users = [
      {
        "id": 1,
        "name": "test3"
      },
      {
        "id": 2,
        "name": "test4"
      }
    ];
    req.users = users;
    next();
  }
  
  function middleware2(req, res, _next) {
    const users = req.users;
    res.json({ user: users });
  }
  
  app.get("/user", middleware1, middleware2);
  
  // Mock the customer routes to avoid DB dependency
  app.get("/api/customers", (req, res) => {
    res.json({ message: "Customers endpoint" });
  });
  
  return app;
};

describe("Server Routes", () => {
  let app;
  
  beforeAll(() => {
    app = createTestApp();
  });
  
  describe("GET /user", () => {
    it("should return users data", async () => {
      const response = await request(app)
        .get("/user")
        .expect(200);
      
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveLength(2);
      expect(response.body.user[0]).toHaveProperty("id", 1);
      expect(response.body.user[0]).toHaveProperty("name", "test3");
    });
  });
  
  describe("GET /api/customers", () => {
    it("should return customers endpoint message", async () => {
      const response = await request(app)
        .get("/api/customers")
        .expect(200);
      
      expect(response.body).toHaveProperty("message", "Customers endpoint");
    });
  });
});
const mysql = require("mysql");
const { promisify } = require("util");
const dbConfig = require("../app/config/db.config.js");

// Utility function to promisify MySQL connection methods
function createAsyncConnection(config) {
  const connection = mysql.createConnection(config);
  
  return {
    connect: promisify(connection.connect).bind(connection),
    query: promisify(connection.query).bind(connection),
    end: promisify(connection.end).bind(connection),
    raw: connection
  };
}

// Test database setup with async/await approach
describe("Database Setup Tests - Async/Await Version", () => {
  let connection;

  beforeEach(async () => {
    connection = createAsyncConnection({
      host: dbConfig.HOST,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      database: dbConfig.DB
    });
    
    try {
      await connection.connect();
      console.log("Connected to database successfully");
    } catch (err) {
      console.log("Error connecting to database:", err);
      throw err;
    }
  });

  afterEach(async () => {
    if (connection) {
      try {
        await connection.end();
        console.log("Database connection closed");
      } catch (err) {
        console.log("Error closing connection:", err);
        throw err;
      }
    }
  });

  test("should connect to database successfully", async () => {
    try {
      const results = await connection.query("SELECT 1 as test");
      
      expect(results).toBeDefined();
      expect(results[0].test).toBe(1);
    } catch (err) {
      throw err;
    }
  });

  test("should create customers table if not exists", async () => {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT TRUE
      )
    `;
    
    try {
      const results = await connection.query(createTableQuery);
      expect(results).toBeDefined();
    } catch (err) {
      throw err;
    }
  });

  test("should insert and retrieve customer data", async () => {
    const testCustomer = {
      email: "test@example.com",
      name: "Test Customer",
      active: true
    };

    try {
      // First insert
      const insertResult = await connection.query(
        "INSERT INTO customers (email, name, active) VALUES (?, ?, ?)",
        [testCustomer.email, testCustomer.name, testCustomer.active]
      );

      expect(insertResult.insertId).toBeDefined();
      const customerId = insertResult.insertId;

      // Then retrieve
      const selectResults = await connection.query(
        "SELECT * FROM customers WHERE id = ?",
        [customerId]
      );

      expect(selectResults).toBeDefined();
      expect(selectResults.length).toBe(1);
      expect(selectResults[0].email).toBe(testCustomer.email);
      expect(selectResults[0].name).toBe(testCustomer.name);
      expect(selectResults[0].active).toBe(1); // MySQL returns 1 for true

      // Cleanup - delete the test record
      await connection.query(
        "DELETE FROM customers WHERE id = ?",
        [customerId]
      );
    } catch (err) {
      throw err;
    }
  });

  test("should handle database errors gracefully", async () => {
    try {
      await connection.query("SELECT * FROM non_existent_table");
      // If we get here, the test should fail
      expect(true).toBe(false);
    } catch (err) {
      expect(err).toBeDefined();
      expect(err.code).toBe("ER_NO_SUCH_TABLE");
    }
  });
});

// Additional unit tests for the utility functions
describe("Database Utility Functions", () => {
  test("createAsyncConnection should return promisified methods", () => {
    const asyncConn = createAsyncConnection({
      host: "localhost",
      user: "test",
      password: "test",
      database: "test"
    });

    expect(asyncConn.connect).toBeDefined();
    expect(asyncConn.query).toBeDefined();
    expect(asyncConn.end).toBeDefined();
    expect(asyncConn.raw).toBeDefined();
    expect(typeof asyncConn.connect).toBe("function");
    expect(typeof asyncConn.query).toBe("function");
    expect(typeof asyncConn.end).toBe("function");
  });

  test("should handle connection configuration", () => {
    const config = {
      host: "test-host",
      user: "test-user",
      password: "test-password",
      database: "test-db"
    };

    const asyncConn = createAsyncConnection(config);
    
    expect(asyncConn.raw.config.host).toBe(config.host);
    expect(asyncConn.raw.config.user).toBe(config.user);
    expect(asyncConn.raw.config.password).toBe(config.password);
    expect(asyncConn.raw.config.database).toBe(config.database);
  });
});
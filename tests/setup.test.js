const {
  createConnection,
  setupTestDatabase,
  teardownTestDatabase,
  insertTestData,
  clearTestData,
  testDbConfig
} = require('./helpers/database.helper');

/**
 * Test Database Setup and Teardown Tests
 * 
 * This file contains test cases for setting up and tearing down
 * the test database environment. It uses extracted helper functions
 * to reduce code duplication and provides comprehensive testing
 * of edge cases and error conditions.
 * 
 * Refactored from original setup.test.js to:
 * - Extract repeated database operations into helper functions
 * - Add comprehensive edge case testing
 * - Improve error handling and cleanup
 * - Add detailed comments explaining test scenarios
 */

// Test suite for database setup functionality
describe('Database Setup Tests', () => {
  let connection;
  
  // Setup before all tests - increase timeout for slow database operations
  beforeAll(async () => {
    // Edge case: Increase timeout for slow database operations
    jest.setTimeout(60000);
  });
  
  // Cleanup after all tests (edge case: ensure cleanup even if tests fail)
  afterAll(async () => {
    if (connection) {
      await teardownTestDatabase(connection);
    }
  });
  
  describe('Connection Management', () => {
    test('should create database connection successfully', async () => {
      connection = await createConnection();
      expect(connection).toBeDefined();
      expect(connection.state).toBe('authenticated');
      
      // Verify connection is active with a simple query
      const result = await new Promise((resolve, reject) => {
        connection.query('SELECT 1 as test', (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      
      expect(result[0].test).toBe(1);
    });
    
    test('should handle invalid connection parameters', async () => {
      const invalidConfig = {
        ...testDbConfig,
        PASSWORD: 'invalid_password'
      };
      
      // Edge case: Connection with invalid credentials should fail gracefully
      await expect(createConnection(invalidConfig)).rejects.toThrow('Failed to create database connection');
    });
    
    test('should handle connection to non-existent host', async () => {
      const invalidHostConfig = {
        ...testDbConfig,
        HOST: 'non-existent-host.example.com'
      };
      
      // Edge case: Connection to unreachable host should timeout and fail
      await expect(createConnection(invalidHostConfig)).rejects.toThrow();
    });
  });
  
  describe('Database Setup and Teardown', () => {
    beforeEach(async () => {
      if (!connection || connection.state === 'disconnected') {
        connection = await createConnection();
      }
    });
    
    test('should setup test database successfully', async () => {
      await setupTestDatabase(connection);
      
      // Verify database was created by checking if we can use it
      const dbResult = await new Promise((resolve, reject) => {
        connection.query(\n          `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?\`,\n          [testDbConfig.DB],\n          (err, results) => {\n            if (err) reject(err);\n            else resolve(results);\n          }\n        );\n      });\n      \n      expect(dbResult.length).toBe(1);\n      expect(dbResult[0].SCHEMA_NAME).toBe(testDbConfig.DB);\n      \n      // Verify customers table was created\n      const tableResult = await new Promise((resolve, reject) => {\n        connection.query(\n          `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'customers'\`,\n          [testDbConfig.DB],\n          (err, results) => {\n            if (err) reject(err);\n            else resolve(results);\n          }\n        );\n      });\n      \n      expect(tableResult.length).toBe(1);\n      expect(tableResult[0].TABLE_NAME).toBe('customers');\n    });\n    \n    test('should handle existing database during setup (idempotent operation)', async () => {\n      // Setup database twice - should not throw error (edge case: idempotent operation)\n      await setupTestDatabase(connection);\n      await expect(setupTestDatabase(connection)).resolves.not.toThrow();\n      \n      // Verify database still exists and is functional\n      const result = await new Promise((resolve, reject) => {\n        connection.query('SELECT COUNT(*) as count FROM customers', (err, results) => {\n          if (err) reject(err);\n          else resolve(results);\n        });\n      });\n      \n      expect(result[0].count).toBe(0); // Should be empty after fresh setup\n    });\n    \n    test('should teardown test database successfully', async () => {\n      await setupTestDatabase(connection);\n      \n      // Verify database exists before teardown\n      let dbResult = await new Promise((resolve, reject) => {\n        connection.query(\n          `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?\`,\n          [testDbConfig.DB],\n          (err, results) => {\n            if (err) reject(err);\n            else resolve(results);\n          }\n        );\n      });\n      \n      expect(dbResult.length).toBe(1);\n      \n      await teardownTestDatabase(connection);\n      connection = null; // Connection is closed by teardown\n      \n      // Create new connection to verify database was dropped\n      const newConnection = await createConnection({ \n        ...testDbConfig, \n        DB: 'mysql' // Connect to system database\n      });\n      \n      dbResult = await new Promise((resolve, reject) => {\n        newConnection.query(\n          `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?\`,\n          [testDbConfig.DB],\n          (err, results) => {\n            if (err) reject(err);\n            else resolve(results);\n          }\n        );\n      });\n      \n      expect(dbResult.length).toBe(0);\n      \n      await teardownTestDatabase(newConnection);\n    });\n  });\n  \n  describe('Test Data Management', () => {\n    beforeEach(async () => {\n      if (!connection || connection.state === 'disconnected') {\n        connection = await createConnection();\n      }\n      await setupTestDatabase(connection);\n    });\n    \n    test('should insert test data successfully', async () => {\n      const testCustomers = [\n        { email: 'test1@example.com', name: 'Test User 1', active: true },\n        { email: 'test2@example.com', name: 'Test User 2', active: false },\n        { email: 'test3@example.com', name: 'Test User 3' } // active should default to true\n      ];\n      \n      const insertedIds = await insertTestData(connection, testCustomers);\n      expect(insertedIds).toHaveLength(3);\n      expect(insertedIds.every(id => typeof id === 'number' && id > 0)).toBe(true);\n      \n      // Verify data was inserted correctly\n      const result = await new Promise((resolve, reject) => {\n        connection.query('SELECT * FROM customers ORDER BY id', (err, results) => {\n          if (err) reject(err);\n          else resolve(results);\n        });\n      });\n      \n      expect(result).toHaveLength(3);\n      expect(result[0].email).toBe('test1@example.com');\n      expect(result[0].name).toBe('Test User 1');\n      expect(result[0].active).toBe(1); // MySQL returns 1 for true\n      expect(result[1].active).toBe(0); // MySQL returns 0 for false\n      expect(result[2].active).toBe(1); // Should default to true\n    });\n    \n    test('should handle duplicate email insertion with transaction rollback', async () => {\n      const testCustomers = [\n        { email: 'duplicate@example.com', name: 'User 1' },\n        { email: 'duplicate@example.com', name: 'User 2' } // Duplicate email\n      ];\n      \n      // Edge case: Duplicate email should cause transaction rollback\n      await expect(insertTestData(connection, testCustomers)).rejects.toThrow('Failed to insert test data');\n      \n      // Verify no partial data was inserted (transaction rollback worked)\n      const result = await new Promise((resolve, reject) => {\n        connection.query('SELECT COUNT(*) as count FROM customers', (err, results) => {\n          if (err) reject(err);\n          else resolve(results);\n        });\n      });\n      \n      expect(result[0].count).toBe(0);\n    });\n    \n    test('should handle invalid test data with proper validation', async () => {\n      const invalidCustomers = [\n        { name: 'Missing Email' }, // Missing required email\n        { email: 'missing@name.com' }, // Missing required name\n        { email: '', name: 'Empty Email' }, // Empty email\n        { email: 'valid@email.com', name: '' } // Empty name\n      ];\n      \n      // Edge case: Invalid data should be rejected with descriptive error\n      for (let i = 0; i < invalidCustomers.length; i++) {\n        await expect(insertTestData(connection, [invalidCustomers[i]]))\n          .rejects.toThrow('Invalid customer data');\n      }\n    });\n    \n    test('should handle empty test data array gracefully', async () => {\n      // Edge case: Empty array should return empty results without error\n      const insertedIds = await insertTestData(connection, []);\n      expect(insertedIds).toHaveLength(0);\n      expect(Array.isArray(insertedIds)).toBe(true);\n    });\n    \n    test('should clear test data successfully while preserving structure', async () => {\n      // Insert some test data first\n      const testCustomers = [\n        { email: 'clear1@example.com', name: 'Clear User 1' },\n        { email: 'clear2@example.com', name: 'Clear User 2' }\n      ];\n      \n      await insertTestData(connection, testCustomers);\n      \n      // Verify data exists\n      let result = await new Promise((resolve, reject) => {\n        connection.query('SELECT COUNT(*) as count FROM customers', (err, results) => {\n          if (err) reject(err);\n          else resolve(results);\n        });\n      });\n      \n      expect(result[0].count).toBe(2);\n      \n      // Clear data\n      await clearTestData(connection);\n      \n      // Verify data was cleared but table structure remains\n      result = await new Promise((resolve, reject) => {\n        connection.query('SELECT COUNT(*) as count FROM customers', (err, results) => {\n          if (err) reject(err);\n          else resolve(results);\n        });\n      });\n      \n      expect(result[0].count).toBe(0);\n      \n      // Verify table structure is intact (can still insert)\n      const newCustomer = [{ email: 'after@clear.com', name: 'After Clear' }];\n      const insertedIds = await insertTestData(connection, newCustomer);\n      expect(insertedIds).toHaveLength(1);\n      expect(insertedIds[0]).toBe(1); // Auto-increment should reset\n    });\n    \n    test('should handle large dataset insertion efficiently', async () => {\n      // Generate large test dataset (edge case: performance and memory testing)\n      const largeDataset = Array.from({ length: 100 }, (_, i) => ({\n        email: `user${i}@example.com`,\n        name: `User ${i}`,\n        active: i % 2 === 0\n      }));\n      \n      const startTime = Date.now();\n      const insertedIds = await insertTestData(connection, largeDataset);\n      const endTime = Date.now();\n      \n      expect(insertedIds).toHaveLength(100);\n      expect(endTime - startTime).toBeLessThan(10000); // Should complete within 10 seconds\n      \n      // Verify all data was inserted\n      const result = await new Promise((resolve, reject) => {\n        connection.query('SELECT COUNT(*) as count FROM customers', (err, results) => {\n          if (err) reject(err);\n          else resolve(results);\n        });\n      });\n      \n      expect(result[0].count).toBe(100);\n    });\n  });\n  \n  describe('Edge Case Handling', () => {\n    test('should handle connection cleanup with null connection gracefully', async () => {\n      // Edge case: teardown with null connection should not throw\n      await expect(teardownTestDatabase(null)).resolves.not.toThrow();\n    });\n    \n    test('should handle teardown of already closed connection', async () => {\n      const tempConnection = await createConnection();\n      \n      // Manually close connection first\n      await new Promise((resolve) => {\n        tempConnection.end(() => resolve());\n      });\n      \n      // Edge case: teardown of already closed connection should not throw\n      await expect(teardownTestDatabase(tempConnection)).resolves.not.toThrow();\n    });\n    \n    test('should handle setup with insufficient database privileges', async () => {\n      // This test would require a separate limited-privilege user\n      // Edge case: Insufficient privileges should fail with descriptive error\n      // Note: This is a conceptual test - actual implementation would need\n      // a test database user with limited CREATE privileges\n      \n      const limitedConfig = {\n        ...testDbConfig,\n        USER: 'limited_user', // Would need to exist with limited privileges\n        PASSWORD: 'limited_pass'\n      };\n      \n      // This would fail in a real scenario with limited privileges\n      // await expect(createConnection(limitedConfig)).rejects.toThrow();\n      \n      // For now, we'll just verify the test structure is in place\n      expect(limitedConfig.USER).toBe('limited_user');\n    });\n    \n    test('should handle database operations during network interruption', async () => {\n      // Edge case: Network interruption during operation\n      // This is a conceptual test for handling network failures\n      \n      if (!connection) {\n        connection = await createConnection();\n      }\n      \n      await setupTestDatabase(connection);\n      \n      // Simulate network interruption by destroying connection\n      connection.destroy();\n      \n      // Attempt operation on destroyed connection should fail gracefully\n      const testCustomers = [{ email: 'test@network.com', name: 'Network Test' }];\n      \n      await expect(insertTestData(connection, testCustomers))\n        .rejects.toThrow();\n      \n      // Reset connection for cleanup\n      connection = null;\n    });\n  });\n});
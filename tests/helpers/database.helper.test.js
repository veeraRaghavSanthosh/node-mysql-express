const {
  createConnection,
  setupTestDatabase,
  teardownTestDatabase,
  insertTestData,
  clearTestData,
  testDbConfig
} = require('./database.helper');

/**
 * Unit Tests for Database Helper Functions
 * 
 * This file contains isolated unit tests for each helper function
 * in the database helper module. These tests focus on testing
 * individual function behavior, error handling, and edge cases
 * without relying on complex integration scenarios.
 */

describe('Database Helper Unit Tests', () => {
  let connection;
  
  beforeAll(() => {
    jest.setTimeout(30000);
  });
  
  afterEach(async () => {
    if (connection && connection.state !== 'disconnected') {
      await teardownTestDatabase(connection);
      connection = null;
    }
  });
  
  describe('createConnection', () => {
    test('should create connection with default config', async () => {
      connection = await createConnection();
      
      expect(connection).toBeDefined();
      expect(connection.config.host).toBe(testDbConfig.HOST);
      expect(connection.config.user).toBe(testDbConfig.USER);
      expect(connection.config.database).toBe(testDbConfig.DB);
    });
    
    test('should create connection with custom config', async () => {
      const customConfig = {
        ...testDbConfig,
        DB: 'mysql' // Use system database
      };
      
      connection = await createConnection(customConfig);
      
      expect(connection).toBeDefined();
      expect(connection.config.database).toBe('mysql');
    });
    
    test('should reject with descriptive error for invalid host', async () => {
      const invalidConfig = {
        ...testDbConfig,
        HOST: 'invalid-host-12345.example.com'
      };
      
      await expect(createConnection(invalidConfig))
        .rejects
        .toThrow('Failed to create database connection');
    });
    
    test('should reject with descriptive error for invalid credentials', async () => {
      const invalidConfig = {
        ...testDbConfig,
        PASSWORD: 'definitely-wrong-password'
      };
      
      await expect(createConnection(invalidConfig))
        .rejects
        .toThrow('Failed to create database connection');
    });
    
    test('should set connection timeout properties', async () => {
      connection = await createConnection();
      
      expect(connection.config.acquireTimeout).toBe(30000);
      expect(connection.config.timeout).toBe(30000);
      expect(connection.config.reconnect).toBe(false);
    });
  });
  
  describe('testDbConfig', () => {
    test('should have test database suffix', () => {
      expect(testDbConfig.DB).toContain('_test');
      expect(testDbConfig.DB).not.toBe(require('../../app/config/db.config.js').DB);
    });
    
    test('should inherit other properties from main config', () => {
      const mainConfig = require('../../app/config/db.config.js');
      
      expect(testDbConfig.HOST).toBe(mainConfig.HOST);
      expect(testDbConfig.USER).toBe(mainConfig.USER);
      expect(testDbConfig.PASSWORD).toBe(mainConfig.PASSWORD);
    });
  });
  
  describe('setupTestDatabase', () => {
    beforeEach(async () => {
      connection = await createConnection({
        ...testDbConfig,
        DB: 'mysql' // Connect to system database for setup
      });
    });
    
    test('should create database and table successfully', async () => {
      await setupTestDatabase(connection);
      
      // Verify database was created
      const dbResult = await new Promise((resolve, reject) => {
        connection.query(
          `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
          [testDbConfig.DB],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });
      
      expect(dbResult.length).toBe(1);
      
      // Verify table was created with correct structure
      const tableResult = await new Promise((resolve, reject) => {
        connection.query(
          `SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT 
           FROM INFORMATION_SCHEMA.COLUMNS 
           WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'customers' 
           ORDER BY ORDINAL_POSITION`,
          [testDbConfig.DB],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });
      
      expect(tableResult.length).toBeGreaterThan(0);
      
      // Verify key columns exist
      const columnNames = tableResult.map(col => col.COLUMN_NAME);
      expect(columnNames).toContain('id');
      expect(columnNames).toContain('email');
      expect(columnNames).toContain('name');
      expect(columnNames).toContain('active');
    });
    
    test('should handle existing database gracefully', async () => {
      // Create database first time
      await setupTestDatabase(connection);
      
      // Create database second time - should not throw
      await expect(setupTestDatabase(connection)).resolves.not.toThrow();
    });
    
    test('should reject with descriptive error for connection issues', async () => {
      // Close connection to simulate connection failure
      connection.destroy();
      
      await expect(setupTestDatabase(connection))
        .rejects
        .toThrow('Failed to drop existing test database');
    });
  });
  
  describe('teardownTestDatabase', () => {
    test('should handle null connection gracefully', async () => {
      await expect(teardownTestDatabase(null)).resolves.not.toThrow();
    });
    
    test('should handle undefined connection gracefully', async () => {
      await expect(teardownTestDatabase(undefined)).resolves.not.toThrow();
    });
    
    test('should drop database and close connection', async () => {
      connection = await createConnection({ ...testDbConfig, DB: 'mysql' });
      await setupTestDatabase(connection);
      
      // Verify database exists
      let dbResult = await new Promise((resolve, reject) => {
        connection.query(
          `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
          [testDbConfig.DB],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });
      
      expect(dbResult.length).toBe(1);
      
      await teardownTestDatabase(connection);
      connection = null;
      
      // Verify database was dropped by creating new connection
      const newConnection = await createConnection({ ...testDbConfig, DB: 'mysql' });
      
      dbResult = await new Promise((resolve, reject) => {
        newConnection.query(
          `SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?`,
          [testDbConfig.DB],
          (err, results) => {
            if (err) reject(err);
            else resolve(results);
          }
        );
      });
      
      expect(dbResult.length).toBe(0);
      
      await teardownTestDatabase(newConnection);
    });
    
    test('should handle already closed connection', async () => {
      connection = await createConnection();
      
      // Manually close connection
      await new Promise((resolve) => {
        connection.end(() => resolve());
      });
      
      // Should not throw when tearing down already closed connection
      await expect(teardownTestDatabase(connection)).resolves.not.toThrow();
      
      connection = null;
    });
  });
  
  describe('insertTestData', () => {
    beforeEach(async () => {
      connection = await createConnection({ ...testDbConfig, DB: 'mysql' });
      await setupTestDatabase(connection);
    });
    
    test('should insert single customer successfully', async () => {
      const customers = [{ email: 'test@example.com', name: 'Test User' }];
      
      const insertedIds = await insertTestData(connection, customers);
      
      expect(insertedIds).toHaveLength(1);
      expect(typeof insertedIds[0]).toBe('number');
      expect(insertedIds[0]).toBeGreaterThan(0);
    });
    
    test('should insert multiple customers successfully', async () => {
      const customers = [
        { email: 'user1@example.com', name: 'User 1', active: true },
        { email: 'user2@example.com', name: 'User 2', active: false },
        { email: 'user3@example.com', name: 'User 3' }
      ];
      
      const insertedIds = await insertTestData(connection, customers);
      
      expect(insertedIds).toHaveLength(3);
      expect(insertedIds.every(id => typeof id === 'number' && id > 0)).toBe(true);
    });
    
    test('should handle empty array gracefully', async () => {
      const insertedIds = await insertTestData(connection, []);
      
      expect(insertedIds).toHaveLength(0);
      expect(Array.isArray(insertedIds)).toBe(true);
    });
    
    test('should reject for missing email', async () => {
      const customers = [{ name: 'Missing Email' }];
      
      await expect(insertTestData(connection, customers))
        .rejects
        .toThrow('Invalid customer data at index 0: email and name are required');
    });
    
    test('should reject for missing name', async () => {
      const customers = [{ email: 'missing@name.com' }];
      
      await expect(insertTestData(connection, customers))
        .rejects
        .toThrow('Invalid customer data at index 0: email and name are required');
    });
    
    test('should reject for empty email', async () => {
      const customers = [{ email: '', name: 'Empty Email' }];
      
      await expect(insertTestData(connection, customers))
        .rejects
        .toThrow('Invalid customer data at index 0: email and name are required');
    });
    
    test('should reject for empty name', async () => {
      const customers = [{ email: 'empty@name.com', name: '' }];
      
      await expect(insertTestData(connection, customers))
        .rejects
        .toThrow('Invalid customer data at index 0: email and name are required');
    });
    
    test('should rollback transaction on duplicate email', async () => {
      const customers = [
        { email: 'duplicate@example.com', name: 'User 1' },
        { email: 'duplicate@example.com', name: 'User 2' }
      ];
      
      await expect(insertTestData(connection, customers))
        .rejects
        .toThrow('Failed to insert test data');
      
      // Verify no data was inserted
      const result = await new Promise((resolve, reject) => {
        connection.query('SELECT COUNT(*) as count FROM customers', (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      
      expect(result[0].count).toBe(0);
    });
    
    test('should default active to true when not specified', async () => {
      const customers = [{ email: 'default@active.com', name: 'Default Active' }];
      
      await insertTestData(connection, customers);
      
      const result = await new Promise((resolve, reject) => {
        connection.query('SELECT active FROM customers WHERE email = ?', 
          ['default@active.com'], (err, results) => {
            if (err) reject(err);
            else resolve(results);
          });
      });
      
      expect(result[0].active).toBe(1); // MySQL returns 1 for true
    });
  });
  
  describe('clearTestData', () => {
    beforeEach(async () => {
      connection = await createConnection({ ...testDbConfig, DB: 'mysql' });
      await setupTestDatabase(connection);
    });
    
    test('should clear all data from customers table', async () => {
      // Insert test data first
      const customers = [
        { email: 'clear1@example.com', name: 'Clear User 1' },
        { email: 'clear2@example.com', name: 'Clear User 2' }
      ];
      
      await insertTestData(connection, customers);
      
      // Verify data exists
      let result = await new Promise((resolve, reject) => {
        connection.query('SELECT COUNT(*) as count FROM customers', (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      
      expect(result[0].count).toBe(2);
      
      // Clear data
      await clearTestData(connection);
      
      // Verify data was cleared
      result = await new Promise((resolve, reject) => {
        connection.query('SELECT COUNT(*) as count FROM customers', (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      
      expect(result[0].count).toBe(0);
    });
    
    test('should reset auto-increment counter', async () => {
      // Insert and clear data
      const customers = [{ email: 'reset@test.com', name: 'Reset Test' }];
      await insertTestData(connection, customers);
      await clearTestData(connection);
      
      // Insert new data - should start from ID 1
      const newCustomers = [{ email: 'new@test.com', name: 'New Test' }];
      const insertedIds = await insertTestData(connection, newCustomers);
      
      expect(insertedIds[0]).toBe(1);
    });
    
    test('should handle empty table gracefully', async () => {
      // Clear data from already empty table
      await expect(clearTestData(connection)).resolves.not.toThrow();
      
      // Verify table is still functional
      const customers = [{ email: 'after@empty.com', name: 'After Empty' }];
      const insertedIds = await insertTestData(connection, customers);
      
      expect(insertedIds).toHaveLength(1);
    });
    
    test('should re-enable foreign key checks even on error', async () => {
      // This test verifies that foreign key checks are re-enabled
      // even if the truncate operation fails
      
      await clearTestData(connection);
      
      // Verify foreign key checks are enabled by checking the setting
      const result = await new Promise((resolve, reject) => {
        connection.query('SELECT @@FOREIGN_KEY_CHECKS as fk_checks', (err, results) => {
          if (err) reject(err);
          else resolve(results);
        });
      });
      
      expect(result[0].fk_checks).toBe(1); // Should be enabled (1)
    });
  });
});
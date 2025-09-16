const mysql = require('mysql');
const dbConfig = require('../../app/config/db.config.js');
const AddLegacyIdToOrdersMigration = require('../../migrations/001_add_legacy_id_to_orders.js');

describe('AddLegacyIdToOrdersMigration', () => {
  let connection;
  let migration;

  beforeAll(() => {
    // Use a test database configuration
    const testDbConfig = {
      ...dbConfig,
      database: `${dbConfig.DB}_test`
    };
    
    connection = mysql.createConnection({
      host: testDbConfig.HOST,
      user: testDbConfig.USER,
      password: testDbConfig.PASSWORD,
      database: testDbConfig.DB,
      multipleStatements: true
    });

    migration = new AddLegacyIdToOrdersMigration();
  });

  afterAll(() => {
    if (connection) {
      connection.end();
    }
    if (migration) {
      migration.close();
    }
  });

  beforeEach(async () => {
    // Setup test table and data
    await new Promise((resolve, reject) => {
      const setupSQL = `
        DROP TABLE IF EXISTS orders;
        
        CREATE TABLE orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          customer_id INT NOT NULL,
          total_amount DECIMAL(10,2) NOT NULL,
          status VARCHAR(50) DEFAULT 'pending',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
        
        INSERT INTO orders (customer_id, total_amount, status) VALUES
        (1, 99.99, 'completed'),
        (2, 149.50, 'pending'),
        (3, 75.25, 'shipped');
      `;

      connection.query(setupSQL, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  });

  afterEach(async () => {
    // Clean up after each test
    await new Promise((resolve, reject) => {
      connection.query('DROP TABLE IF EXISTS orders', (error) => {
        if (error) reject(error);
        else resolve();
      });
    });
  });

  describe('up() migration', () => {
    test('should add legacy_id column to orders table', async () => {
      await migration.up();

      // Verify column was added
      const columns = await new Promise((resolve, reject) => {
        connection.query('DESCRIBE orders', (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });

      const legacyIdColumn = columns.find(col => col.Field === 'legacy_id');
      expect(legacyIdColumn).toBeDefined();
      expect(legacyIdColumn.Type).toBe('varchar(50)');
      expect(legacyIdColumn.Null).toBe('YES');
    });

    test('should create index on legacy_id column', async () => {
      await migration.up();

      // Verify index was created
      const indexes = await new Promise((resolve, reject) => {
        connection.query('SHOW INDEX FROM orders WHERE Key_name = "idx_orders_legacy_id"', (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });

      expect(indexes.length).toBeGreaterThan(0);
      expect(indexes[0].Column_name).toBe('legacy_id');
    });

    test('should backfill existing rows with legacy_id values', async () => {
      await migration.up();

      // Verify backfill worked
      const orders = await new Promise((resolve, reject) => {
        connection.query('SELECT id, legacy_id FROM orders ORDER BY id', (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });

      expect(orders.length).toBe(3);
      expect(orders[0].legacy_id).toBe('LEGACY_00000001');
      expect(orders[1].legacy_id).toBe('LEGACY_00000002');
      expect(orders[2].legacy_id).toBe('LEGACY_00000003');
    });

    test('should not affect existing data integrity', async () => {
      // Get original data
      const originalOrders = await new Promise((resolve, reject) => {
        connection.query('SELECT id, customer_id, total_amount, status FROM orders ORDER BY id', (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });

      await migration.up();

      // Verify original data is unchanged
      const ordersAfterMigration = await new Promise((resolve, reject) => {
        connection.query('SELECT id, customer_id, total_amount, status FROM orders ORDER BY id', (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });

      expect(ordersAfterMigration).toEqual(originalOrders);
    });
  });

  describe('down() rollback', () => {
    test('should remove legacy_id column and index', async () => {
      // First run the migration
      await migration.up();

      // Verify column exists
      let columns = await new Promise((resolve, reject) => {
        connection.query('DESCRIBE orders', (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });
      expect(columns.find(col => col.Field === 'legacy_id')).toBeDefined();

      // Run rollback
      await migration.down();

      // Verify column is removed
      columns = await new Promise((resolve, reject) => {
        connection.query('DESCRIBE orders', (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });
      expect(columns.find(col => col.Field === 'legacy_id')).toBeUndefined();

      // Verify index is removed
      const indexes = await new Promise((resolve, reject) => {
        connection.query('SHOW INDEX FROM orders WHERE Key_name = "idx_orders_legacy_id"', (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });
      expect(indexes.length).toBe(0);
    });

    test('should not affect other table data during rollback', async () => {
      await migration.up();

      // Get data before rollback
      const ordersBeforeRollback = await new Promise((resolve, reject) => {
        connection.query('SELECT id, customer_id, total_amount, status FROM orders ORDER BY id', (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });

      await migration.down();

      // Verify other data is unchanged
      const ordersAfterRollback = await new Promise((resolve, reject) => {
        connection.query('SELECT id, customer_id, total_amount, status FROM orders ORDER BY id', (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });

      expect(ordersAfterRollback).toEqual(ordersBeforeRollback);
    });
  });

  describe('edge cases', () => {
    test('should handle empty orders table', async () => {
      // Clear the table
      await new Promise((resolve, reject) => {
        connection.query('DELETE FROM orders', (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      // Migration should still work
      await expect(migration.up()).resolves.not.toThrow();

      // Verify column was added
      const columns = await new Promise((resolve, reject) => {
        connection.query('DESCRIBE orders', (error, results) => {
          if (error) reject(error);
          else resolve(results);
        });
      });

      expect(columns.find(col => col.Field === 'legacy_id')).toBeDefined();
    });

    test('should handle large order IDs correctly', async () => {
      // Insert order with large ID
      await new Promise((resolve, reject) => {
        connection.query('INSERT INTO orders (id, customer_id, total_amount) VALUES (999999, 1, 100.00)', (error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      await migration.up();

      // Verify large ID is handled correctly
      const order = await new Promise((resolve, reject) => {
        connection.query('SELECT legacy_id FROM orders WHERE id = 999999', (error, results) => {
          if (error) reject(error);
          else resolve(results[0]);
        });
      });

      expect(order.legacy_id).toBe('LEGACY_00999999');
    });
  });
});
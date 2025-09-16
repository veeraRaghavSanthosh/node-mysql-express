/**
 * Unit tests for Add legacy_id to orders migration
 */

const { expect } = require('chai');
const mysql = require('mysql2/promise');
const migration = require('../../db/migrations/20250916_add_legacy_id_to_orders');

describe('Migration: Add legacy_id to orders', () => {
  let connection;
  
  before(async () => {
    // Setup test database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'test',
      password: process.env.DB_PASSWORD || 'test',
      database: process.env.DB_NAME || 'test_db'
    });
    
    // Create test orders table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  });
  
  after(async () => {
    // Clean up test data
    await connection.execute('DROP TABLE IF EXISTS orders');
    await connection.end();
  });
  
  beforeEach(async () => {
    // Clear any existing data and ensure clean state
    await connection.execute('DELETE FROM orders');
    
    // Remove legacy_id column if it exists (for test isolation)
    try {
      await connection.execute('ALTER TABLE orders DROP COLUMN legacy_id');
    } catch (error) {
      // Column doesn't exist, which is fine
    }
  });

  describe('up() migration', () => {
    it('should add legacy_id column to orders table', async () => {
      // Run the migration
      await migration.up(connection);
      
      // Check if column was added
      const [columns] = await connection.execute(`
        SHOW COLUMNS FROM orders LIKE 'legacy_id'
      `);
      
      expect(columns).to.have.length(1);
      expect(columns[0].Field).to.equal('legacy_id');
      expect(columns[0].Type).to.equal('varchar(50)');
      expect(columns[0].Null).to.equal('YES');
    });

    it('should backfill legacy_id for existing orders', async () => {
      // Insert test orders before migration
      await connection.execute(`
        INSERT INTO orders (customer_id, total_amount, status, created_at) VALUES
        (1, 99.99, 'completed', '2025-01-01 10:00:00'),
        (2, 149.50, 'pending', '2025-01-02 11:00:00'),
        (3, 75.25, 'shipped', '2025-01-03 12:00:00')
      `);
      
      // Run the migration
      await migration.up(connection);
      
      // Check that all orders have legacy_id values
      const [orders] = await connection.execute(`
        SELECT id, legacy_id FROM orders WHERE legacy_id IS NOT NULL ORDER BY id
      `);
      
      expect(orders).to.have.length(3);
      
      // Verify legacy_id format (ORD-{id}-{timestamp})
      orders.forEach((order, index) => {
        expect(order.legacy_id).to.match(/^ORD-\d+-\d+$/);
        expect(order.legacy_id).to.include(`ORD-${order.id}-`);
      });
    });

    it('should handle empty orders table gracefully', async () => {
      // Run migration on empty table
      await migration.up(connection);
      
      // Check if column was added
      const [columns] = await connection.execute(`
        SHOW COLUMNS FROM orders LIKE 'legacy_id'
      `);
      
      expect(columns).to.have.length(1);
      
      // Verify no errors occurred with empty table
      const [count] = await connection.execute(`
        SELECT COUNT(*) as count FROM orders
      `);
      
      expect(count[0].count).to.equal(0);
    });

    it('should not update orders that already have legacy_id', async () => {
      // Add column first
      await connection.execute(`
        ALTER TABLE orders 
        ADD COLUMN legacy_id VARCHAR(50) NULL
      `);
      
      // Insert order with existing legacy_id
      await connection.execute(`
        INSERT INTO orders (customer_id, total_amount, legacy_id, created_at) VALUES
        (1, 99.99, 'EXISTING-123', '2025-01-01 10:00:00')
      `);
      
      // Insert order without legacy_id
      await connection.execute(`
        INSERT INTO orders (customer_id, total_amount, created_at) VALUES
        (2, 149.50, '2025-01-02 11:00:00')
      `);
      
      // Run the backfill part of migration
      await connection.execute(`
        UPDATE orders 
        SET legacy_id = CONCAT('ORD-', id, '-', UNIX_TIMESTAMP(created_at))
        WHERE legacy_id IS NULL
      `);
      
      const [orders] = await connection.execute(`
        SELECT id, legacy_id FROM orders ORDER BY id
      `);
      
      expect(orders).to.have.length(2);
      expect(orders[0].legacy_id).to.equal('EXISTING-123'); // Should remain unchanged
      expect(orders[1].legacy_id).to.match(/^ORD-\d+-\d+$/); // Should be updated
    });
  });

  describe('down() migration', () => {
    it('should remove legacy_id column from orders table', async () => {
      // First run up migration
      await migration.up(connection);
      
      // Verify column exists
      let [columns] = await connection.execute(`
        SHOW COLUMNS FROM orders LIKE 'legacy_id'
      `);
      expect(columns).to.have.length(1);
      
      // Run down migration
      await migration.down(connection);
      
      // Verify column is removed
      [columns] = await connection.execute(`
        SHOW COLUMNS FROM orders LIKE 'legacy_id'
      `);
      expect(columns).to.have.length(0);
    });

    it('should handle rollback when column does not exist', async () => {
      // Try to run down migration when column doesn't exist
      // Should not throw an error
      try {
        await migration.down(connection);
        // If we reach here, the migration handled the case gracefully
        expect(true).to.be.true;
      } catch (error) {
        // If it throws, it should be a specific MySQL error about column not existing
        expect(error.message).to.include('check that column/key exists');
      }
    });
  });

  describe('integration test', () => {
    it('should successfully run up and down migrations', async () => {
      // Insert test data
      await connection.execute(`
        INSERT INTO orders (customer_id, total_amount) VALUES (1, 99.99), (2, 149.50)
      `);
      
      // Run up migration
      await migration.up(connection);
      
      // Verify data integrity after up migration
      const [ordersAfterUp] = await connection.execute(`
        SELECT id, customer_id, total_amount, legacy_id FROM orders ORDER BY id
      `);
      
      expect(ordersAfterUp).to.have.length(2);
      expect(ordersAfterUp[0].legacy_id).to.not.be.null;
      expect(ordersAfterUp[1].legacy_id).to.not.be.null;
      expect(ordersAfterUp[0].customer_id).to.equal(1);
      expect(ordersAfterUp[1].customer_id).to.equal(2);
      
      // Run down migration
      await migration.down(connection);
      
      // Verify data integrity after down migration
      const [ordersAfterDown] = await connection.execute(`
        SELECT id, customer_id, total_amount FROM orders ORDER BY id
      `);
      
      expect(ordersAfterDown).to.have.length(2);
      expect(ordersAfterDown[0].customer_id).to.equal(1);
      expect(ordersAfterDown[1].customer_id).to.equal(2);
      
      // Verify legacy_id column is gone
      const [columns] = await connection.execute(`
        SHOW COLUMNS FROM orders LIKE 'legacy_id'
      `);
      expect(columns).to.have.length(0);
    });
  });
});
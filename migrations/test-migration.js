/**
 * Migration Test Script
 * Tests the legacy_id migration to ensure it works correctly
 */

const mysql = require('mysql2/promise');
const { dbConfig } = require('./db-config');

class MigrationTester {
  constructor() {
    this.connection = null;
  }

  async connect() {
    if (!this.connection) {
      this.connection = await mysql.createConnection(dbConfig);
    }
    return this.connection;
  }

  async disconnect() {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  async setupTestData() {
    const connection = await this.connect();
    
    console.log('Setting up test data...');
    
    // Create orders table if it doesn't exist (for testing)
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id INT NOT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB
    `);
    
    // Insert test orders
    const testOrders = [
      [1, 99.99, 'completed'],
      [2, 149.50, 'pending'],
      [3, 75.25, 'shipped'],
      [1, 200.00, 'completed'],
      [4, 50.00, 'cancelled']
    ];
    
    for (const [customerId, amount, status] of testOrders) {
      await connection.execute(`
        INSERT INTO orders (customer_id, total_amount, status) 
        VALUES (?, ?, ?)
      `, [customerId, amount, status]);
    }
    
    console.log(`Inserted ${testOrders.length} test orders`);
  }

  async testMigrationUp() {
    console.log('\n=== Testing Migration UP ===');
    
    const connection = await this.connect();
    const migration = require('./add_legacy_id_to_orders');
    
    try {
      // Run the migration
      await migration.up(connection);
      
      // Verify the column was added
      const [columns] = await connection.execute(`
        SHOW COLUMNS FROM orders LIKE 'legacy_id'
      `);
      
      if (columns.length === 0) {
        throw new Error('legacy_id column was not created');
      }
      
      console.log('✓ legacy_id column created successfully');
      
      // Verify the index was created
      const [indexes] = await connection.execute(`
        SHOW INDEXES FROM orders WHERE Key_name = 'idx_orders_legacy_id'
      `);
      
      if (indexes.length === 0) {
        throw new Error('Index idx_orders_legacy_id was not created');
      }
      
      console.log('✓ Index idx_orders_legacy_id created successfully');
      
      // Verify unique constraint
      const [constraints] = await connection.execute(`
        SELECT CONSTRAINT_NAME 
        FROM information_schema.TABLE_CONSTRAINTS 
        WHERE TABLE_SCHEMA = DATABASE() 
        AND TABLE_NAME = 'orders' 
        AND CONSTRAINT_NAME = 'uk_orders_legacy_id'
      `);
      
      if (constraints.length === 0) {
        throw new Error('Unique constraint uk_orders_legacy_id was not created');
      }
      
      console.log('✓ Unique constraint uk_orders_legacy_id created successfully');
      
      // Verify backfill worked
      const [orders] = await connection.execute(`
        SELECT id, legacy_id FROM orders WHERE legacy_id IS NOT NULL
      `);
      
      if (orders.length === 0) {
        throw new Error('No orders were backfilled with legacy_id');
      }
      
      console.log(`✓ ${orders.length} orders backfilled with legacy_id`);
      
      // Verify legacy_id format
      for (const order of orders) {
        if (!order.legacy_id.startsWith('LEGACY_')) {
          throw new Error(`Invalid legacy_id format: ${order.legacy_id}`);
        }
      }
      
      console.log('✓ All legacy_id values have correct format');
      
      console.log('✅ Migration UP test passed');
      
    } catch (error) {
      console.error('❌ Migration UP test failed:', error.message);
      throw error;
    }
  }

  async testMigrationDown() {
    console.log('\n=== Testing Migration DOWN ===');
    
    const connection = await this.connect();
    const migration = require('./add_legacy_id_to_orders');
    
    try {
      // Run the rollback
      await migration.down(connection);
      
      // Verify the column was removed
      const [columns] = await connection.execute(`
        SHOW COLUMNS FROM orders LIKE 'legacy_id'
      `);
      
      if (columns.length > 0) {
        throw new Error('legacy_id column was not removed');
      }
      
      console.log('✓ legacy_id column removed successfully');
      
      // Verify the index was removed
      const [indexes] = await connection.execute(`
        SHOW INDEXES FROM orders WHERE Key_name = 'idx_orders_legacy_id'
      `);
      
      if (indexes.length > 0) {
        throw new Error('Index idx_orders_legacy_id was not removed');
      }
      
      console.log('✓ Index idx_orders_legacy_id removed successfully');
      
      console.log('✅ Migration DOWN test passed');
      
    } catch (error) {
      console.error('❌ Migration DOWN test failed:', error.message);
      throw error;
    }
  }

  async testBackwardCompatibility() {
    console.log('\n=== Testing Backward Compatibility ===');
    
    const connection = await this.connect();
    
    try {
      // Test that existing queries still work
      const [orders] = await connection.execute(`
        SELECT id, customer_id, total_amount, status 
        FROM orders 
        WHERE status = 'completed'
      `);
      
      console.log(`✓ Existing queries work: found ${orders.length} completed orders`);
      
      // Test inserting new orders (without legacy_id)
      await connection.execute(`
        INSERT INTO orders (customer_id, total_amount, status) 
        VALUES (?, ?, ?)
      `, [999, 123.45, 'test']);
      
      console.log('✓ New orders can be inserted without legacy_id');
      
      // Clean up test order
      await connection.execute(`
        DELETE FROM orders WHERE customer_id = 999 AND total_amount = 123.45
      `);
      
      console.log('✅ Backward compatibility test passed');
      
    } catch (error) {
      console.error('❌ Backward compatibility test failed:', error.message);
      throw error;
    }
  }

  async cleanup() {
    console.log('\n=== Cleaning up test data ===');
    
    const connection = await this.connect();
    
    try {
      // Remove test orders
      await connection.execute('DELETE FROM orders WHERE customer_id IN (1, 2, 3, 4)');
      console.log('✓ Test orders removed');
      
    } catch (error) {
      console.error('Warning: Cleanup failed:', error.message);
    }
  }
}

// Main test runner
async function runTests() {
  const tester = new MigrationTester();
  
  try {
    await tester.setupTestData();
    await tester.testMigrationUp();
    await tester.testBackwardCompatibility();
    await tester.testMigrationDown();
    
    console.log('\n🎉 All tests passed successfully!');
    
  } catch (error) {
    console.error('\n💥 Tests failed:', error.message);
    process.exit(1);
    
  } finally {
    await tester.cleanup();
    await tester.disconnect();
  }
}

// Run tests if called directly
if (require.main === module) {
  runTests();
}

module.exports = { MigrationTester, runTests };
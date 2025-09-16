/**
 * Migration: Add legacy_id column to orders table
 * Created: 2025-09-16
 * Description: Adds a legacy_id column to the orders table and backfills existing rows
 */

const mysql = require('mysql2/promise');

module.exports = {
  up: async (connection) => {
    console.log('Starting migration: Add legacy_id to orders table');
    
    try {
      // Add the legacy_id column to orders table
      await connection.execute(`
        ALTER TABLE orders 
        ADD COLUMN legacy_id VARCHAR(50) NULL COMMENT 'Legacy system identifier for backward compatibility'
      `);
      
      console.log('✓ Added legacy_id column to orders table');
      
      // Backfill existing orders with generated legacy_id values
      // Using a combination of 'ORD-' prefix + order id + timestamp suffix
      await connection.execute(`
        UPDATE orders 
        SET legacy_id = CONCAT('ORD-', id, '-', UNIX_TIMESTAMP(created_at))
        WHERE legacy_id IS NULL
      `);
      
      console.log('✓ Backfilled legacy_id for existing orders');
      
      // Get count of updated rows for verification
      const [rows] = await connection.execute(`
        SELECT COUNT(*) as count FROM orders WHERE legacy_id IS NOT NULL
      `);
      
      console.log(`✓ Migration completed successfully. Updated ${rows[0].count} orders with legacy_id`);
      
    } catch (error) {
      console.error('Migration failed:', error.message);
      throw error;
    }
  },

  down: async (connection) => {
    console.log('Starting rollback: Remove legacy_id from orders table');
    
    try {
      // Remove the legacy_id column
      await connection.execute(`
        ALTER TABLE orders 
        DROP COLUMN legacy_id
      `);
      
      console.log('✓ Removed legacy_id column from orders table');
      
    } catch (error) {
      console.error('Rollback failed:', error.message);
      throw error;
    }
  }
};
/**
 * Migration: Add legacy_id column to orders table
 * Created: 2025-09-16
 * 
 * This migration:
 * 1. Adds a legacy_id column to the orders table
 * 2. Backfills existing rows with generated legacy IDs
 * 3. Maintains backward compatibility
 */

const mysql = require('mysql2/promise');

module.exports = {
  up: async (connection) => {
    console.log('Starting migration: Add legacy_id to orders table');
    
    try {
      // Step 1: Add the legacy_id column as nullable first to maintain compatibility
      console.log('Adding legacy_id column to orders table...');
      await connection.execute(`
        ALTER TABLE orders 
        ADD COLUMN legacy_id VARCHAR(50) NULL 
        COMMENT 'Legacy identifier for backward compatibility'
      `);
      
      // Step 2: Create an index on legacy_id for better performance
      console.log('Creating index on legacy_id column...');
      await connection.execute(`
        CREATE INDEX idx_orders_legacy_id ON orders (legacy_id)
      `);
      
      // Step 3: Backfill existing rows with legacy IDs
      console.log('Backfilling legacy_id for existing orders...');
      
      // Get all existing orders without legacy_id
      const [existingOrders] = await connection.execute(`
        SELECT id FROM orders WHERE legacy_id IS NULL
      `);
      
      console.log(`Found ${existingOrders.length} orders to backfill`);
      
      // Backfill in batches to avoid memory issues with large datasets
      const batchSize = 1000;
      let processedCount = 0;
      
      for (let i = 0; i < existingOrders.length; i += batchSize) {
        const batch = existingOrders.slice(i, i + batchSize);
        
        // Generate legacy IDs for this batch
        const updatePromises = batch.map(order => {
          // Generate legacy ID based on the original ID with prefix
          const legacyId = `LEGACY_${order.id.toString().padStart(8, '0')}`;
          
          return connection.execute(`
            UPDATE orders 
            SET legacy_id = ? 
            WHERE id = ?
          `, [legacyId, order.id]);
        });
        
        await Promise.all(updatePromises);
        processedCount += batch.length;
        
        console.log(`Processed ${processedCount}/${existingOrders.length} orders`);
      }
      
      // Step 4: Add unique constraint to prevent duplicates (optional)
      console.log('Adding unique constraint to legacy_id...');
      await connection.execute(`
        ALTER TABLE orders 
        ADD CONSTRAINT uk_orders_legacy_id UNIQUE (legacy_id)
      `);
      
      console.log('Migration completed successfully');
      
    } catch (error) {
      console.error('Migration failed:', error.message);
      throw error;
    }
  },

  down: async (connection) => {
    console.log('Rolling back migration: Remove legacy_id from orders table');
    
    try {
      // Remove unique constraint first
      console.log('Removing unique constraint...');
      await connection.execute(`
        ALTER TABLE orders 
        DROP CONSTRAINT uk_orders_legacy_id
      `);
      
      // Remove index
      console.log('Removing index...');
      await connection.execute(`
        DROP INDEX idx_orders_legacy_id ON orders
      `);
      
      // Remove the column
      console.log('Removing legacy_id column...');
      await connection.execute(`
        ALTER TABLE orders 
        DROP COLUMN legacy_id
      `);
      
      console.log('Rollback completed successfully');
      
    } catch (error) {
      console.error('Rollback failed:', error.message);
      throw error;
    }
  }
};
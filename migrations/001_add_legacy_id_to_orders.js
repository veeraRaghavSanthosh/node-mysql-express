/**
 * Migration: Add legacy_id column to orders table
 * Created: 2025-09-16
 * Description: Add legacy_id column for backward compatibility and backfill existing rows
 */

const mysql = require('mysql2/promise');

/**
 * Run the migration
 * @param {mysql.Connection} connection - Database connection
 */
async function up(connection) {
    try {
        console.log('Starting migration: Add legacy_id to orders table...');
        
        // Check if column already exists to prevent duplicate migrations
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'orders' 
            AND COLUMN_NAME = 'legacy_id'
        `);
        
        if (columns.length > 0) {
            console.log('Column legacy_id already exists in orders table. Skipping migration.');
            return;
        }
        
        // Add the legacy_id column as nullable for backward compatibility
        await connection.execute(`
            ALTER TABLE orders 
            ADD COLUMN legacy_id VARCHAR(255) NULL 
            COMMENT 'Legacy identifier for backward compatibility'
        `);
        console.log('✓ Added legacy_id column to orders table');
        
        // Create index on legacy_id for performance
        await connection.execute(`
            CREATE INDEX idx_orders_legacy_id ON orders(legacy_id)
        `);
        console.log('✓ Created index on legacy_id column');
        
        // Backfill existing rows with legacy_id based on their primary key
        const [result] = await connection.execute(`
            UPDATE orders 
            SET legacy_id = CONCAT('LEGACY_', id) 
            WHERE legacy_id IS NULL
        `);
        console.log(`✓ Backfilled ${result.affectedRows} existing orders with legacy_id`);
        
        console.log('Migration completed successfully!');
        
    } catch (error) {
        console.error('Migration failed:', error);
        throw error;
    }
}

/**
 * Rollback the migration
 * @param {mysql.Connection} connection - Database connection
 */
async function down(connection) {
    try {
        console.log('Rolling back migration: Remove legacy_id from orders table...');
        
        // Drop the index first
        await connection.execute(`
            DROP INDEX IF EXISTS idx_orders_legacy_id ON orders
        `);
        console.log('✓ Dropped index idx_orders_legacy_id');
        
        // Remove the column
        await connection.execute(`
            ALTER TABLE orders DROP COLUMN IF EXISTS legacy_id
        `);
        console.log('✓ Removed legacy_id column from orders table');
        
        console.log('Rollback completed successfully!');
        
    } catch (error) {
        console.error('Rollback failed:', error);
        throw error;
    }
}

module.exports = {
    up,
    down
};
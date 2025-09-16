/**
 * Test script to verify the legacy_id migration
 */

const mysql = require('mysql2/promise');

// Database configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'your_database_name',
    port: process.env.DB_PORT || 3306
};

async function testMigration() {
    let connection;
    
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Connected to database');
        
        // Test 1: Check if legacy_id column exists
        console.log('\n--- Test 1: Check column exists ---');
        const [columns] = await connection.execute(`
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_COMMENT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = DATABASE() 
            AND TABLE_NAME = 'orders' 
            AND COLUMN_NAME = 'legacy_id'
        `);
        
        if (columns.length > 0) {
            console.log('✓ legacy_id column exists');
            console.log(`  Type: ${columns[0].DATA_TYPE}`);
            console.log(`  Nullable: ${columns[0].IS_NULLABLE}`);
            console.log(`  Comment: ${columns[0].COLUMN_COMMENT}`);
        } else {
            console.log('❌ legacy_id column not found');
            return;
        }
        
        // Test 2: Check if index exists
        console.log('\n--- Test 2: Check index exists ---');
        const [indexes] = await connection.execute(`
            SHOW INDEX FROM orders WHERE Key_name = 'idx_orders_legacy_id'
        `);
        
        if (indexes.length > 0) {
            console.log('✓ idx_orders_legacy_id index exists');
        } else {
            console.log('❌ idx_orders_legacy_id index not found');
        }
        
        // Test 3: Check backfill data
        console.log('\n--- Test 3: Check backfilled data ---');
        const [orders] = await connection.execute(`
            SELECT COUNT(*) as total_orders,
                   COUNT(legacy_id) as orders_with_legacy_id,
                   COUNT(CASE WHEN legacy_id LIKE 'LEGACY_%' THEN 1 END) as backfilled_orders
            FROM orders
        `);
        
        const stats = orders[0];
        console.log(`✓ Total orders: ${stats.total_orders}`);
        console.log(`✓ Orders with legacy_id: ${stats.orders_with_legacy_id}`);
        console.log(`✓ Backfilled orders: ${stats.backfilled_orders}`);
        
        // Test 4: Sample data
        console.log('\n--- Test 4: Sample data ---');
        const [sampleOrders] = await connection.execute(`
            SELECT id, legacy_id 
            FROM orders 
            ORDER BY id 
            LIMIT 5
        `);
        
        sampleOrders.forEach(order => {
            console.log(`  Order ID: ${order.id}, Legacy ID: ${order.legacy_id}`);
        });
        
        // Test 5: Check migration record
        console.log('\n--- Test 5: Check migration record ---');
        const [migrations] = await connection.execute(`
            SELECT filename, executed_at 
            FROM migrations 
            WHERE filename LIKE '%legacy_id%'
        `);
        
        if (migrations.length > 0) {
            migrations.forEach(migration => {
                console.log(`✓ Migration recorded: ${migration.filename} at ${migration.executed_at}`);
            });
        } else {
            console.log('⚠️  No migration record found (might have been run manually)');
        }
        
        console.log('\n✓ Migration verification completed!');
        
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run the test
testMigration();
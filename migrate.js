/**
 * Migration Runner
 * Usage: node migrate.js [up|down] [migration_file]
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// Database configuration - adjust these settings based on your environment
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'your_database_name',
    port: process.env.DB_PORT || 3306
};

/**
 * Create migrations table if it doesn't exist
 */
async function createMigrationsTable(connection) {
    await connection.execute(`
        CREATE TABLE IF NOT EXISTS migrations (
            id INT AUTO_INCREMENT PRIMARY KEY,
            filename VARCHAR(255) NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_filename (filename)
        )
    `);
}

/**
 * Check if migration has been executed
 */
async function isMigrationExecuted(connection, filename) {
    const [rows] = await connection.execute(
        'SELECT id FROM migrations WHERE filename = ?',
        [filename]
    );
    return rows.length > 0;
}

/**
 * Record migration as executed
 */
async function recordMigration(connection, filename) {
    await connection.execute(
        'INSERT INTO migrations (filename) VALUES (?)',
        [filename]
    );
}

/**
 * Remove migration record
 */
async function removeMigrationRecord(connection, filename) {
    await connection.execute(
        'DELETE FROM migrations WHERE filename = ?',
        [filename]
    );
}

/**
 * Run migrations
 */
async function runMigration(direction = 'up', migrationFile = null) {
    let connection;
    
    try {
        // Create database connection
        connection = await mysql.createConnection(dbConfig);
        console.log('✓ Connected to database');
        
        // Create migrations table
        await createMigrationsTable(connection);
        
        // Get migration files
        const migrationsDir = path.join(__dirname, 'migrations');
        let migrationFiles;
        
        if (migrationFile) {
            migrationFiles = [migrationFile];
        } else {
            migrationFiles = fs.readdirSync(migrationsDir)
                .filter(file => file.endsWith('.js'))
                .sort();
        }
        
        for (const file of migrationFiles) {
            const filePath = path.join(migrationsDir, file);
            const migration = require(filePath);
            
            console.log(`\n--- Processing ${file} ---`);
            
            if (direction === 'up') {
                // Check if already executed
                if (await isMigrationExecuted(connection, file)) {
                    console.log(`Migration ${file} already executed. Skipping.`);
                    continue;
                }
                
                // Run migration
                await migration.up(connection);
                await recordMigration(connection, file);
                console.log(`✓ Migration ${file} executed successfully`);
                
            } else if (direction === 'down') {
                // Check if migration was executed
                if (!(await isMigrationExecuted(connection, file))) {
                    console.log(`Migration ${file} not found in executed migrations. Skipping.`);
                    continue;
                }
                
                // Rollback migration
                await migration.down(connection);
                await removeMigrationRecord(connection, file);
                console.log(`✓ Migration ${file} rolled back successfully`);
            }
        }
        
        console.log('\n✓ All migrations processed successfully!');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        if (connection) {
            await connection.end();
            console.log('✓ Database connection closed');
        }
    }
}

// Parse command line arguments
const args = process.argv.slice(2);
const direction = args[0] || 'up';
const migrationFile = args[1];

if (!['up', 'down'].includes(direction)) {
    console.error('Invalid direction. Use "up" or "down"');
    process.exit(1);
}

// Run the migration
runMigration(direction, migrationFile);
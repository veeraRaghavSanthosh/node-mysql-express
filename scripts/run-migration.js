/**
 * Migration Runner Script
 * Usage: node scripts/run-migration.js [up|down] [migration-name]
 */

const mysql = require('mysql2/promise');
const path = require('path');

async function runMigration() {
  const direction = process.argv[2] || 'up';
  const migrationName = process.argv[3] || '20250916_add_legacy_id_to_orders';
  
  if (!['up', 'down'].includes(direction)) {
    console.error('Direction must be "up" or "down"');
    process.exit(1);
  }

  let connection;
  
  try {
    // Create database connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'myapp'
    });

    console.log('✓ Connected to database');

    // Load and run migration
    const migrationPath = path.join(__dirname, '..', 'db', 'migrations', `${migrationName}.js`);
    const migration = require(migrationPath);

    console.log(`Running migration: ${migrationName} (${direction})`);
    
    if (direction === 'up') {
      await migration.up(connection);
    } else {
      await migration.down(connection);
    }

    console.log(`✓ Migration ${migrationName} completed successfully`);

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('✓ Database connection closed');
    }
  }
}

// Run if called directly
if (require.main === module) {
  runMigration();
}

module.exports = { runMigration };
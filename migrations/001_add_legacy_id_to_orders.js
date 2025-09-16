const mysql = require('mysql');
const dbConfig = require('../app/config/db.config.js');

/**
 * Migration: Add legacy_id column to orders table and backfill existing rows
 * Created: 2025-09-16
 */

class AddLegacyIdToOrdersMigration {
  constructor() {
    this.connection = mysql.createConnection({
      host: dbConfig.HOST,
      user: dbConfig.USER,
      password: dbConfig.PASSWORD,
      database: dbConfig.DB,
      multipleStatements: true
    });
  }

  async up() {
    return new Promise((resolve, reject) => {
      console.log('Starting migration: Add legacy_id column to orders table');
      
      const migrationSQL = `
        -- Add legacy_id column to orders table
        ALTER TABLE orders 
        ADD COLUMN legacy_id VARCHAR(50) NULL 
        COMMENT 'Legacy identifier for backward compatibility';
        
        -- Create index on legacy_id for performance
        CREATE INDEX idx_orders_legacy_id ON orders(legacy_id);
        
        -- Backfill existing rows with legacy_id based on id
        UPDATE orders 
        SET legacy_id = CONCAT('LEGACY_', LPAD(id, 8, '0'))
        WHERE legacy_id IS NULL;
      `;

      this.connection.query(migrationSQL, (error, results) => {
        if (error) {
          console.error('Migration failed:', error);
          reject(error);
        } else {
          console.log('Migration completed successfully');
          console.log('Results:', results);
          resolve(results);
        }
      });
    });
  }

  async down() {
    return new Promise((resolve, reject) => {
      console.log('Rolling back migration: Remove legacy_id column from orders table');
      
      const rollbackSQL = `
        -- Drop index first
        DROP INDEX IF EXISTS idx_orders_legacy_id ON orders;
        
        -- Remove legacy_id column
        ALTER TABLE orders DROP COLUMN legacy_id;
      `;

      this.connection.query(rollbackSQL, (error, results) => {
        if (error) {
          console.error('Rollback failed:', error);
          reject(error);
        } else {
          console.log('Rollback completed successfully');
          resolve(results);
        }
      });
    });
  }

  close() {
    this.connection.end();
  }
}

module.exports = AddLegacyIdToOrdersMigration;

// If run directly, execute the migration
if (require.main === module) {
  const migration = new AddLegacyIdToOrdersMigration();
  
  const action = process.argv[2] || 'up';
  
  if (action === 'up') {
    migration.up()
      .then(() => {
        console.log('Migration executed successfully');
        migration.close();
        process.exit(0);
      })
      .catch((error) => {
        console.error('Migration failed:', error);
        migration.close();
        process.exit(1);
      });
  } else if (action === 'down') {
    migration.down()
      .then(() => {
        console.log('Migration rolled back successfully');
        migration.close();
        process.exit(0);
      })
      .catch((error) => {
        console.error('Rollback failed:', error);
        migration.close();
        process.exit(1);
      });
  } else {
    console.error('Invalid action. Use "up" or "down"');
    migration.close();
    process.exit(1);
  }
}

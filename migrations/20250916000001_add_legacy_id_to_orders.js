/**
 * Migration: Add legacy_id column to orders table and backfill existing rows
 * Created: 2025-09-16
 * 
 * This migration:
 * 1. Adds a legacy_id column to the orders table
 * 2. Backfills existing rows with a computed legacy_id based on the primary key
 * 3. Provides rollback functionality to remove the column
 */

const mysql = require('mysql');

// Database configuration - adjust these values as needed
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'testdb',
  multipleStatements: true
};

/**
 * Execute the migration up (add column and backfill)
 */
async function up() {
  const connection = mysql.createConnection(dbConfig);
  
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to database:', err);
        return reject(err);
      }
      
      console.log('Connected to MySQL database for migration');
      
      // Step 1: Add the legacy_id column to orders table
      const addColumnSQL = `
        ALTER TABLE orders 
        ADD COLUMN legacy_id VARCHAR(50) NULL 
        COMMENT 'Legacy identifier for data migration purposes'
      `;
      
      connection.query(addColumnSQL, (err, result) => {
        if (err) {
          console.error('Error adding legacy_id column:', err);
          connection.end();
          return reject(err);
        }
        
        console.log('Successfully added legacy_id column to orders table');
        
        // Step 2: Backfill existing rows with legacy_id values
        // Using a pattern: 'LEGACY_' + id to create unique legacy identifiers
        const backfillSQL = `
          UPDATE orders 
          SET legacy_id = CONCAT('LEGACY_', LPAD(id, 8, '0'))
          WHERE legacy_id IS NULL
        `;
        
        connection.query(backfillSQL, (err, result) => {
          if (err) {
            console.error('Error backfilling legacy_id values:', err);
            connection.end();
            return reject(err);
          }
          
          console.log(`Successfully backfilled ${result.affectedRows} rows with legacy_id values`);
          
          // Step 3: Add index on legacy_id for better query performance
          const addIndexSQL = `
            CREATE INDEX idx_orders_legacy_id ON orders(legacy_id)
          `;
          
          connection.query(addIndexSQL, (err, result) => {
            if (err) {
              console.error('Error creating index on legacy_id:', err);
              connection.end();
              return reject(err);
            }
            
            console.log('Successfully created index on legacy_id column');
            connection.end();
            resolve(result);
          });
        });
      });
    });
  });
}

/**
 * Execute the migration down (rollback - remove column)
 */
async function down() {
  const connection = mysql.createConnection(dbConfig);
  
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to database for rollback:', err);
        return reject(err);
      }
      
      console.log('Connected to MySQL database for rollback');
      
      // Step 1: Drop the index first
      const dropIndexSQL = `DROP INDEX idx_orders_legacy_id ON orders`;
      
      connection.query(dropIndexSQL, (err, result) => {
        if (err && err.code !== 'ER_CANT_DROP_FIELD_OR_KEY') {
          console.error('Error dropping index:', err);
          connection.end();
          return reject(err);
        }
        
        console.log('Dropped index on legacy_id column (if existed)');
        
        // Step 2: Remove the legacy_id column
        const dropColumnSQL = `ALTER TABLE orders DROP COLUMN legacy_id`;
        
        connection.query(dropColumnSQL, (err, result) => {
          if (err) {
            console.error('Error dropping legacy_id column:', err);
            connection.end();
            return reject(err);
          }
          
          console.log('Successfully removed legacy_id column from orders table');
          connection.end();
          resolve(result);
        });
      });
    });
  });
}

// Export functions for use by migration runner
module.exports = {
  up,
  down
};

// Allow running this migration directly
if (require.main === module) {
  const action = process.argv[2] || 'up';
  
  if (action === 'up') {
    console.log('Running migration: Add legacy_id to orders...');
    up()
      .then(() => {
        console.log('Migration completed successfully!');
        process.exit(0);
      })
      .catch((err) => {
        console.error('Migration failed:', err);
        process.exit(1);
      });
  } else if (action === 'down') {
    console.log('Rolling back migration: Remove legacy_id from orders...');
    down()
      .then(() => {
        console.log('Rollback completed successfully!');
        process.exit(0);
      })
      .catch((err) => {
        console.error('Rollback failed:', err);
        process.exit(1);
      });
  } else {
    console.log('Usage: node 20250916000001_add_legacy_id_to_orders.js [up|down]');
    process.exit(1);
  }
}
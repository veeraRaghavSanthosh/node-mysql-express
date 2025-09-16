const mysql = require("mysql");
const dbConfig = require("./app/config/db.config.js");

// Create connection for migration
const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

/**
 * Migration: Add legacy_id column to orders table
 * This migration adds a legacy_id column and backfills it for existing rows
 */

const runMigration = () => {
  return new Promise((resolve, reject) => {
    console.log("Starting migration: Add legacy_id to orders table");
    
    // Step 1: Add the legacy_id column
    const addColumnSql = `
      ALTER TABLE orders 
      ADD COLUMN legacy_id VARCHAR(50) NULL 
      COMMENT 'Legacy system identifier for backward compatibility'
    `;
    
    connection.query(addColumnSql, (err, result) => {
      if (err) {
        // If column already exists, that's okay
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log("legacy_id column already exists, skipping column creation");
        } else {
          console.error("Error adding legacy_id column:", err);
          return reject(err);
        }
      } else {
        console.log("Successfully added legacy_id column to orders table");
      }
      
      // Step 2: Backfill existing rows with generated legacy_id values
      const backfillSql = `
        UPDATE orders 
        SET legacy_id = CONCAT('LEGACY_', LPAD(id, 8, '0'))
        WHERE legacy_id IS NULL
      `;
      
      connection.query(backfillSql, (err, result) => {
        if (err) {
          console.error("Error backfilling legacy_id values:", err);
          return reject(err);
        }
        
        console.log(`Successfully backfilled ${result.affectedRows} rows with legacy_id values`);
        
        // Step 3: Add index on legacy_id for better performance (if not exists)
        const addIndexSql = `
          ALTER TABLE orders 
          ADD INDEX idx_orders_legacy_id (legacy_id)
        `;
        
        connection.query(addIndexSql, (err, result) => {
          if (err) {
            // If index already exists, that's okay
            if (err.code === 'ER_DUP_KEYNAME') {
              console.log("Index on legacy_id already exists, skipping index creation");
            } else {
              console.error("Error adding index on legacy_id:", err);
              return reject(err);
            }
          } else {
            console.log("Successfully added index on legacy_id column");
          }
          
          resolve(result);
        });
      });
    });
  });
};

const rollbackMigration = () => {
  return new Promise((resolve, reject) => {
    console.log("Rolling back migration: Remove legacy_id from orders table");
    
    // Remove the legacy_id column (this will also remove the index)
    const removeColumnSql = `
      ALTER TABLE orders 
      DROP COLUMN legacy_id
    `;
    
    connection.query(removeColumnSql, (err, result) => {
      if (err) {
        console.error("Error removing legacy_id column:", err);
        return reject(err);
      }
      
      console.log("Successfully removed legacy_id column from orders table");
      resolve(result);
    });
  });
};

// Main execution
const main = async () => {
  try {
    await new Promise((resolve, reject) => {
      connection.connect((err) => {
        if (err) {
          console.error("Error connecting to database:", err);
          reject(err);
        } else {
          console.log("Connected to MySQL database");
          resolve();
        }
      });
    });
    
    const action = process.argv[2] || 'up';
    
    if (action === 'up') {
      await runMigration();
      console.log("Migration completed successfully");
    } else if (action === 'down') {
      await rollbackMigration();
      console.log("Rollback completed successfully");
    } else {
      console.log("Usage: node add_legacy_id_migration.js [up|down]");
      console.log("  up   - Run the migration (default)");
      console.log("  down - Rollback the migration");
    }
    
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    connection.end();
  }
};

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runMigration, rollbackMigration };
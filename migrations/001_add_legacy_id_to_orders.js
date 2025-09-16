const mysql = require("mysql");
const dbConfig = require("../app/config/db.config.js");

// Create connection
const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

/**
 * Migration: Add legacy_id column to orders table and backfill existing rows
 * 
 * This migration:
 * 1. Adds a new 'legacy_id' column to the orders table
 * 2. Backfills existing orders with a legacy_id based on their current id
 * 3. Maintains backward compatibility by making the column nullable initially
 */

const up = async () => {
  return new Promise((resolve, reject) => {
    console.log("Running migration: Add legacy_id to orders table");
    
    // Start transaction for atomic operation
    connection.beginTransaction(async (err) => {
      if (err) {
        console.error("Error starting transaction:", err);
        return reject(err);
      }

      try {
        // Step 1: Check if orders table exists, create if it doesn't
        await executeQuery(`
          CREATE TABLE IF NOT EXISTS orders (
            id INT AUTO_INCREMENT PRIMARY KEY,
            customer_id INT,
            order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            total_amount DECIMAL(10,2),
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
          )
        `);
        console.log("✓ Orders table ensured to exist");

        // Step 2: Check if legacy_id column already exists
        const columnExists = await executeQuery(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'legacy_id'
        `, [dbConfig.DB]);

        if (columnExists.length === 0) {
          // Step 3: Add legacy_id column (nullable for backward compatibility)
          await executeQuery(`
            ALTER TABLE orders 
            ADD COLUMN legacy_id VARCHAR(50) NULL 
            COMMENT 'Legacy identifier for backward compatibility'
          `);
          console.log("✓ Added legacy_id column to orders table");

          // Step 4: Backfill existing orders with legacy_id
          const existingOrders = await executeQuery("SELECT id FROM orders");
          
          if (existingOrders.length > 0) {
            console.log(`Found ${existingOrders.length} existing orders to backfill`);
            
            for (const order of existingOrders) {
              // Generate legacy_id based on current id (prefixed with 'LEGACY_')
              const legacyId = `LEGACY_${order.id.toString().padStart(6, '0')}`;
              
              await executeQuery(
                "UPDATE orders SET legacy_id = ? WHERE id = ?",
                [legacyId, order.id]
              );
            }
            console.log("✓ Backfilled legacy_id for existing orders");
          } else {
            console.log("✓ No existing orders found, skipping backfill");
          }

          // Step 5: Add index for performance (optional but recommended)
          await executeQuery(`
            CREATE INDEX idx_orders_legacy_id ON orders(legacy_id)
          `);
          console.log("✓ Added index on legacy_id column");

        } else {
          console.log("✓ legacy_id column already exists, skipping migration");
        }

        // Commit transaction
        connection.commit((err) => {
          if (err) {
            console.error("Error committing transaction:", err);
            return connection.rollback(() => reject(err));
          }
          console.log("✓ Migration completed successfully");
          resolve();
        });

      } catch (error) {
        console.error("Migration error:", error);
        connection.rollback(() => reject(error));
      }
    });
  });
};

const down = async () => {
  return new Promise((resolve, reject) => {
    console.log("Rolling back migration: Remove legacy_id from orders table");
    
    connection.beginTransaction(async (err) => {
      if (err) {
        console.error("Error starting rollback transaction:", err);
        return reject(err);
      }

      try {
        // Check if legacy_id column exists before trying to drop it
        const columnExists = await executeQuery(`
          SELECT COLUMN_NAME 
          FROM INFORMATION_SCHEMA.COLUMNS 
          WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'legacy_id'
        `, [dbConfig.DB]);

        if (columnExists.length > 0) {
          // Drop index first
          await executeQuery(`DROP INDEX IF EXISTS idx_orders_legacy_id ON orders`);
          console.log("✓ Dropped index on legacy_id column");

          // Drop the legacy_id column
          await executeQuery(`ALTER TABLE orders DROP COLUMN legacy_id`);
          console.log("✓ Removed legacy_id column from orders table");
        } else {
          console.log("✓ legacy_id column doesn't exist, nothing to rollback");
        }

        // Commit rollback transaction
        connection.commit((err) => {
          if (err) {
            console.error("Error committing rollback transaction:", err);
            return connection.rollback(() => reject(err));
          }
          console.log("✓ Migration rollback completed successfully");
          resolve();
        });

      } catch (error) {
        console.error("Rollback error:", error);
        connection.rollback(() => reject(error));
      }
    });
  });
};

// Helper function to promisify database queries
const executeQuery = (query, params = []) => {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

// Export migration functions
module.exports = {
  up,
  down,
  description: "Add legacy_id column to orders table with backfill for existing rows"
};

// Allow running migration directly
if (require.main === module) {
  const action = process.argv[2] || 'up';
  
  if (action === 'up') {
    up()
      .then(() => {
        console.log("Migration completed successfully");
        process.exit(0);
      })
      .catch((error) => {
        console.error("Migration failed:", error);
        process.exit(1);
      })
      .finally(() => {
        connection.end();
      });
  } else if (action === 'down') {
    down()
      .then(() => {
        console.log("Migration rollback completed successfully");
        process.exit(0);
      })
      .catch((error) => {
        console.error("Migration rollback failed:", error);
        process.exit(1);
      })
      .finally(() => {
        connection.end();
      });
  } else {
    console.error("Usage: node 001_add_legacy_id_to_orders.js [up|down]");
    process.exit(1);
  }
}
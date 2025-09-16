// Migration: Add legacy_id column to orders table with backfill
// This migration adds the legacy_id column and backfills existing rows
// while maintaining backward compatibility

module.exports = {
  up: (connection, callback) => {
    console.log('Starting migration: Add legacy_id column to orders table');
    
    // Step 1: Add the legacy_id column (nullable initially for backward compatibility)
    const addColumnQuery = `
      ALTER TABLE orders 
      ADD COLUMN legacy_id VARCHAR(100) NULL 
      COMMENT 'Legacy system identifier for backward compatibility'
    `;

    connection.query(addColumnQuery, (err, results) => {
      if (err) {
        console.error('Error adding legacy_id column:', err);
        callback(err);
        return;
      }
      
      console.log('legacy_id column added successfully');
      
      // Step 2: Create index on legacy_id for performance
      const createIndexQuery = `
        CREATE INDEX idx_orders_legacy_id ON orders (legacy_id)
      `;
      
      connection.query(createIndexQuery, (err, results) => {
        if (err) {
          console.error('Error creating index on legacy_id:', err);
          callback(err);
          return;
        }
        
        console.log('Index on legacy_id created successfully');
        
        // Step 3: Backfill existing rows with legacy_id
        // Generate legacy_id based on existing data pattern: LEGACY_<order_number>_<id>
        const backfillQuery = `
          UPDATE orders 
          SET legacy_id = CONCAT('LEGACY_', order_number, '_', id)
          WHERE legacy_id IS NULL
        `;
        
        connection.query(backfillQuery, (err, results) => {
          if (err) {
            console.error('Error backfilling legacy_id:', err);
            callback(err);
            return;
          }
          
          console.log(`Backfilled legacy_id for ${results.affectedRows} existing orders`);
          
          // Step 4: Add unique constraint on legacy_id (after backfill to avoid conflicts)
          const addUniqueConstraintQuery = `
            ALTER TABLE orders 
            ADD CONSTRAINT uk_orders_legacy_id UNIQUE (legacy_id)
          `;
          
          connection.query(addUniqueConstraintQuery, (err, results) => {
            if (err) {
              console.error('Error adding unique constraint on legacy_id:', err);
              callback(err);
              return;
            }
            
            console.log('Unique constraint on legacy_id added successfully');
            console.log('Migration completed: legacy_id column added with backfill');
            callback(null, results);
          });
        });
      });
    });
  },

  down: (connection, callback) => {
    console.log('Rolling back migration: Remove legacy_id column from orders table');
    
    // Step 1: Drop unique constraint
    const dropConstraintQuery = `
      ALTER TABLE orders 
      DROP CONSTRAINT IF EXISTS uk_orders_legacy_id
    `;
    
    connection.query(dropConstraintQuery, (err, results) => {
      if (err) {
        console.error('Error dropping unique constraint:', err);
        // Continue with rollback even if constraint doesn't exist
      } else {
        console.log('Unique constraint on legacy_id dropped');
      }
      
      // Step 2: Drop index
      const dropIndexQuery = `
        DROP INDEX IF EXISTS idx_orders_legacy_id ON orders
      `;
      
      connection.query(dropIndexQuery, (err, results) => {
        if (err) {
          console.error('Error dropping index:', err);
          // Continue with rollback even if index doesn't exist
        } else {
          console.log('Index on legacy_id dropped');
        }
        
        // Step 3: Drop the column
        const dropColumnQuery = `
          ALTER TABLE orders 
          DROP COLUMN IF EXISTS legacy_id
        `;
        
        connection.query(dropColumnQuery, (err, results) => {
          if (err) {
            console.error('Error dropping legacy_id column:', err);
            callback(err);
          } else {
            console.log('legacy_id column dropped successfully');
            console.log('Migration rollback completed');
            callback(null, results);
          }
        });
      });
    });
  }
};
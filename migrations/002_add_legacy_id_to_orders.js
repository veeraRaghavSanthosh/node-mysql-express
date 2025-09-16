const mysql = require("mysql");
const dbConfig = require("../app/config/db.config.js");

const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

const up = () => {
  return new Promise((resolve, reject) => {
    // Step 1: Add the legacy_id column
    const addLegacyIdColumn = `
      ALTER TABLE orders 
      ADD COLUMN legacy_id VARCHAR(100) UNIQUE NULL 
      AFTER id
    `;

    connection.query(addLegacyIdColumn, (err, result) => {
      if (err) {
        console.error('Error adding legacy_id column:', err);
        reject(err);
        return;
      }
      
      console.log('legacy_id column added successfully');
      
      // Step 2: Backfill existing rows with legacy_id
      const backfillLegacyId = `
        UPDATE orders 
        SET legacy_id = CONCAT('ORDER_', LPAD(id, 8, '0')) 
        WHERE legacy_id IS NULL
      `;

      connection.query(backfillLegacyId, (err, backfillResult) => {
        if (err) {
          console.error('Error backfilling legacy_id:', err);
          reject(err);
        } else {
          console.log(`Backfilled legacy_id for ${backfillResult.affectedRows} existing orders`);
          
          // Step 3: Add index on legacy_id for better performance
          const addLegacyIdIndex = `
            ALTER TABLE orders 
            ADD INDEX idx_legacy_id (legacy_id)
          `;
          
          connection.query(addLegacyIdIndex, (err, indexResult) => {
            if (err) {
              console.error('Error adding legacy_id index:', err);
              reject(err);
            } else {
              console.log('Index on legacy_id added successfully');
              resolve({
                columnAdded: result,
                backfilled: backfillResult,
                indexAdded: indexResult
              });
            }
          });
        }
      });
    });
  });
};

const down = () => {
  return new Promise((resolve, reject) => {
    // Remove the legacy_id column (this will also remove the index)
    const removeLegacyIdColumn = `
      ALTER TABLE orders 
      DROP COLUMN legacy_id
    `;

    connection.query(removeLegacyIdColumn, (err, result) => {
      if (err) {
        console.error('Error removing legacy_id column:', err);
        reject(err);
      } else {
        console.log('legacy_id column removed successfully');
        resolve(result);
      }
    });
  });
};

module.exports = { up, down };
/**
 * Test script for the legacy_id migration
 * This script helps verify that the migration works correctly
 */

const mysql = require('mysql');

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'testdb'
};

async function testMigration() {
  const connection = mysql.createConnection(dbConfig);
  
  return new Promise((resolve, reject) => {
    connection.connect((err) => {
      if (err) {
        console.error('Error connecting to database:', err);
        return reject(err);
      }
      
      console.log('Connected to MySQL database for testing');
      
      // Check if legacy_id column exists
      connection.query('DESCRIBE orders', (err, results) => {
        if (err) {
          console.error('Error describing orders table:', err);
          connection.end();
          return reject(err);
        }
        
        const legacyIdColumn = results.find(col => col.Field === 'legacy_id');
        
        if (legacyIdColumn) {
          console.log('✓ legacy_id column exists');
          console.log('  Type:', legacyIdColumn.Type);
          console.log('  Null:', legacyIdColumn.Null);
          console.log('  Key:', legacyIdColumn.Key);
          
          // Check if data is backfilled
          connection.query('SELECT COUNT(*) as total, COUNT(legacy_id) as with_legacy FROM orders', (err, results) => {
            if (err) {
              console.error('Error checking backfill:', err);
              connection.end();
              return reject(err);
            }
            
            const { total, with_legacy } = results[0];
            console.log(`✓ Backfill status: ${with_legacy}/${total} rows have legacy_id`);
            
            if (total > 0 && with_legacy === total) {
              console.log('✓ All existing rows have been backfilled');
            }
            
            // Show some sample data
            connection.query('SELECT id, legacy_id FROM orders LIMIT 5', (err, results) => {
              if (err) {
                console.error('Error fetching sample data:', err);
                connection.end();
                return reject(err);
              }
              
              if (results.length > 0) {
                console.log('\nSample data:');
                results.forEach(row => {
                  console.log(`  ID: ${row.id} -> Legacy ID: ${row.legacy_id}`);
                });
              }
              
              connection.end();
              resolve();
            });
          });
        } else {
          console.log('✗ legacy_id column does not exist');
          connection.end();
          resolve();
        }
      });
    });
  });
}

// Run the test
console.log('Testing legacy_id migration...');
testMigration()
  .then(() => {
    console.log('\nTest completed successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  });
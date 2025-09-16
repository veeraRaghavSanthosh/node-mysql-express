const mysql = require("mysql");
const dbConfig = require("./app/config/db.config.js");

const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

const testMigration = async () => {
  try {
    console.log('Connecting to database...');
    connection.connect();

    // First, let's check if orders table exists and has data
    const checkTable = () => {
      return new Promise((resolve, reject) => {
        connection.query('SHOW TABLES LIKE "orders"', (err, result) => {
          if (err) reject(err);
          else resolve(result.length > 0);
        });
      });
    };

    const tableExists = await checkTable();
    console.log('Orders table exists:', tableExists);

    if (tableExists) {
      // Check current structure
      const describeTable = () => {
        return new Promise((resolve, reject) => {
          connection.query('DESCRIBE orders', (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      };

      const structure = await describeTable();
      console.log('Current orders table structure:');
      console.table(structure);

      // Check if we have any data
      const countRows = () => {
        return new Promise((resolve, reject) => {
          connection.query('SELECT COUNT(*) as count FROM orders', (err, result) => {
            if (err) reject(err);
            else resolve(result[0].count);
          });
        });
      };

      const rowCount = await countRows();
      console.log(`Orders table has ${rowCount} rows`);

      if (rowCount > 0) {
        // Show sample data
        const getSampleData = () => {
          return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM orders LIMIT 5', (err, result) => {
              if (err) reject(err);
              else resolve(result);
            });
          });
        };

        const sampleData = await getSampleData();
        console.log('Sample orders data:');
        console.table(sampleData);
      }
    } else {
      console.log('Orders table does not exist. Please run migrations first.');
    }

  } catch (error) {
    console.error('Error testing migration:', error);
  } finally {
    connection.end();
  }
};

// Add some sample data to test backfill functionality
const addSampleData = async () => {
  try {
    console.log('Adding sample data for testing...');
    connection.connect();

    const insertSampleData = () => {
      return new Promise((resolve, reject) => {
        const sampleOrders = [
          [1, '2023-01-15', 150.50, 'completed'],
          [2, '2023-02-20', 275.25, 'pending'],
          [3, '2023-03-10', 89.99, 'shipped'],
          [1, '2023-04-05', 320.00, 'completed'],
          [3, '2023-05-12', 45.75, 'cancelled']
        ];

        const insertQuery = `
          INSERT INTO orders (customer_id, order_date, total_amount, status) 
          VALUES ?
        `;

        connection.query(insertQuery, [sampleOrders], (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    };

    const result = await insertSampleData();
    console.log(`Inserted ${result.affectedRows} sample orders`);

  } catch (error) {
    console.error('Error adding sample data:', error);
  } finally {
    connection.end();
  }
};

// Parse command line arguments
const args = process.argv.slice(2);
const action = args[0] || 'test';

if (action === 'add-sample-data') {
  addSampleData();
} else {
  testMigration();
}
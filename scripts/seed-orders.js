// Sample data seeder for orders table
// This script creates sample orders to demonstrate the migration functionality

const mysql = require("mysql");
const dbConfig = require("../app/config/db.config.js");

const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

const sampleOrders = [
  {
    customer_id: 1,
    order_number: 'ORD-2024-001',
    total_amount: 299.99,
    status: 'pending'
  },
  {
    customer_id: 2,
    order_number: 'ORD-2024-002',
    total_amount: 149.50,
    status: 'processing'
  },
  {
    customer_id: 1,
    order_number: 'ORD-2024-003',
    total_amount: 89.99,
    status: 'shipped'
  },
  {
    customer_id: 3,
    order_number: 'ORD-2024-004',
    total_amount: 450.00,
    status: 'delivered'
  },
  {
    customer_id: 2,
    order_number: 'ORD-2024-005',
    total_amount: 75.25,
    status: 'cancelled'
  }
];

async function seedOrders() {
  return new Promise((resolve, reject) => {
    console.log('Starting to seed orders...');
    
    // First check if orders table exists
    connection.query('SHOW TABLES LIKE "orders"', (err, results) => {
      if (err) {
        console.error('Error checking for orders table:', err);
        reject(err);
        return;
      }
      
      if (results.length === 0) {
        console.log('Orders table does not exist. Please run migrations first.');
        console.log('Run: npm run migrate');
        resolve();
        return;
      }
      
      // Clear existing data (optional)
      connection.query('DELETE FROM orders', (err, results) => {
        if (err) {
          console.error('Error clearing orders table:', err);
          // Continue anyway - table might not exist yet
        } else {
          console.log('Cleared existing orders');
        }
        
        // Insert sample orders
        let completed = 0;
        const total = sampleOrders.length;
        
        if (total === 0) {
          console.log('No orders to seed');
          resolve();
          return;
        }
        
        sampleOrders.forEach((order, index) => {
          connection.query('INSERT INTO orders SET ?', order, (err, results) => {
            if (err) {
              console.error(`Error inserting order ${index + 1}:`, err);
              reject(err);
              return;
            }
            
            console.log(`Inserted order: ${order.order_number} (ID: ${results.insertId})`);
            completed++;
            
            if (completed === total) {
              console.log(`Successfully seeded ${total} orders`);
              resolve();
            }
          });
        });
      });
    });
  });
}

// Run seeder if called directly
if (require.main === module) {
  seedOrders()
    .then(() => {
      console.log('Seeding completed successfully');
      connection.end();
    })
    .catch((error) => {
      console.error('Seeding failed:', error);
      connection.end();
      process.exit(1);
    });
}

module.exports = { seedOrders };
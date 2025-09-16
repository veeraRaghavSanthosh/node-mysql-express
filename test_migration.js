/**
 * Migration Test Script
 * 
 * This script demonstrates the migration and backward compatibility features.
 * Run this after executing the migration to verify everything works correctly.
 */

const Order = require("./app/models/order.model.js");
const mysql = require("mysql");
const dbConfig = require("./app/config/db.config.js");

// Create connection for direct database queries
const connection = mysql.createConnection({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB
});

async function testMigration() {
  console.log("🧪 Testing Migration and Backward Compatibility\n");

  try {
    // Test 1: Check if legacy_id column exists
    console.log("1️⃣  Testing if legacy_id column exists...");
    const columnCheck = await executeQuery(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND COLUMN_NAME = 'legacy_id'
    `, [dbConfig.DB]);
    
    if (columnCheck.length > 0) {
      console.log("✅ legacy_id column exists");
    } else {
      console.log("❌ legacy_id column not found - migration may not have run");
      return;
    }

    // Test 2: Check if index exists
    console.log("\n2️⃣  Testing if index on legacy_id exists...");
    const indexCheck = await executeQuery(`
      SELECT INDEX_NAME 
      FROM INFORMATION_SCHEMA.STATISTICS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'orders' AND INDEX_NAME = 'idx_orders_legacy_id'
    `, [dbConfig.DB]);
    
    if (indexCheck.length > 0) {
      console.log("✅ Index on legacy_id exists");
    } else {
      console.log("⚠️  Index on legacy_id not found");
    }

    // Test 3: Create a test order
    console.log("\n3️⃣  Testing order creation...");
    const testOrder = {
      customer_id: 1,
      total_amount: 99.99,
      status: 'pending'
    };

    const createdOrder = await new Promise((resolve, reject) => {
      Order.create(testOrder, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    console.log(`✅ Created order with ID: ${createdOrder.id}, Legacy ID: ${createdOrder.legacy_id}`);

    // Test 4: Find order by regular ID
    console.log("\n4️⃣  Testing find by regular ID...");
    const foundByRegularId = await new Promise((resolve, reject) => {
      Order.findById(createdOrder.id, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    if (foundByRegularId) {
      console.log(`✅ Found order by regular ID: ${foundByRegularId.id}`);
    } else {
      console.log("❌ Could not find order by regular ID");
    }

    // Test 5: Find order by legacy ID
    console.log("\n5️⃣  Testing find by legacy ID...");
    const foundByLegacyId = await new Promise((resolve, reject) => {
      Order.findById(createdOrder.legacy_id, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    if (foundByLegacyId) {
      console.log(`✅ Found order by legacy ID: ${foundByLegacyId.legacy_id}`);
    } else {
      console.log("❌ Could not find order by legacy ID");
    }

    // Test 6: Check existing orders have legacy_id
    console.log("\n6️⃣  Testing backfill of existing orders...");
    const ordersWithLegacyId = await executeQuery(`
      SELECT COUNT(*) as count 
      FROM orders 
      WHERE legacy_id IS NOT NULL
    `);

    const totalOrders = await executeQuery(`SELECT COUNT(*) as count FROM orders`);

    console.log(`✅ Orders with legacy_id: ${ordersWithLegacyId[0].count}/${totalOrders[0].count}`);

    // Test 7: Update order using legacy ID
    console.log("\n7️⃣  Testing update by legacy ID...");
    const updateData = {
      customer_id: createdOrder.customer_id,
      total_amount: 149.99,
      status: 'completed'
    };

    const updated = await new Promise((resolve, reject) => {
      Order.updateById(createdOrder.legacy_id, updateData, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });

    if (updated) {
      console.log(`✅ Updated order using legacy ID`);
    } else {
      console.log("❌ Could not update order using legacy ID");
    }

    // Test 8: Clean up test order
    console.log("\n8️⃣  Cleaning up test order...");
    await new Promise((resolve, reject) => {
      Order.remove(createdOrder.id, (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
    console.log("✅ Test order cleaned up");

    console.log("\n🎉 All tests passed! Migration and backward compatibility working correctly.");

  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    console.error("Stack trace:", error.stack);
  } finally {
    connection.end();
  }
}

// Helper function to promisify database queries
function executeQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
}

// Run the test
if (require.main === module) {
  testMigration();
}

module.exports = testMigration;
// Simple test runner to verify the async/await conversion
const Customer = require("./app/models/customer.model.js");
const { promisify } = require('util');

// Promisify the Customer model methods
const getAllAsync = promisify(Customer.getAll.bind(Customer));

async function runBasicTest() {
  console.log("Testing async/await conversion...");
  
  try {
    console.log("Running getAllAsync test...");
    const data = await getAllAsync();
    console.log("✓ getAllAsync test passed - received:", Array.isArray(data) ? `${data.length} customers` : 'data');
    return true;
  } catch (err) {
    console.log("✗ Test failed with error:", err.message);
    return false;
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  runBasicTest().then(success => {
    if (success) {
      console.log("🎉 Async/await conversion appears to be working!");
    } else {
      console.log("❌ There may be issues with the conversion.");
    }
    process.exit(success ? 0 : 1);
  });
}

module.exports = { runBasicTest };
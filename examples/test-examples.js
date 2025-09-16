/**
 * Simple test script to verify the examples work
 * This assumes the main server is running on localhost:3000
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000';

async function testConnection() {
  try {
    console.log('Testing connection to API server...');
    
    // Test if server is running by trying to get all customers
    const response = await axios.get(`${API_BASE_URL}/customers`);
    console.log('✅ API server is running and accessible');
    console.log(`📊 Current customers in database: ${response.data.length}`);
    return true;
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ API server is not running');
      console.log('Please start the server with: npm start (from the root directory)');
    } else {
      console.log('❌ Error connecting to API:', error.message);
    }
    return false;
  }
}

async function testBasicOperations() {
  try {
    console.log('\nTesting basic CRUD operations...');

    // Create a test customer
    const testCustomer = {
      name: "Test User",
      email: "test@example.com",
      active: true
    };

    console.log('Creating test customer...');
    const createResponse = await axios.post(`${API_BASE_URL}/customers`, testCustomer);
    const customerId = createResponse.data.id;
    console.log(`✅ Customer created with ID: ${customerId}`);

    // Get the customer
    console.log('Fetching created customer...');
    const getResponse = await axios.get(`${API_BASE_URL}/customers/${customerId}`);
    console.log(`✅ Customer fetched: ${getResponse.data.name}`);

    // Update the customer
    console.log('Updating customer...');
    const updateData = { name: "Updated Test User", active: false };
    const updateResponse = await axios.put(`${API_BASE_URL}/customers/${customerId}`, updateData);
    console.log(`✅ Customer updated: ${updateResponse.data.name}`);

    // Delete the customer
    console.log('Deleting test customer...');
    await axios.delete(`${API_BASE_URL}/customers/${customerId}`);
    console.log('✅ Customer deleted successfully');

    // Verify deletion
    try {
      await axios.get(`${API_BASE_URL}/customers/${customerId}`);
      console.log('❌ Customer should have been deleted');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Confirmed customer was deleted');
      }
    }

    console.log('\n🎉 All basic operations working correctly!');
    return true;

  } catch (error) {
    console.log('❌ Error during testing:', error.response?.data || error.message);
    return false;
  }
}

async function runTests() {
  console.log('=== Testing Node.js Express MySQL API Examples ===\n');

  const connectionOk = await testConnection();
  if (!connectionOk) {
    process.exit(1);
  }

  const operationsOk = await testBasicOperations();
  if (!operationsOk) {
    process.exit(1);
  }

  console.log('\n✅ All tests passed! The examples should work correctly.');
  console.log('\nYou can now run:');
  console.log('- npm run demo:js (for JavaScript demo)');
  console.log('- npm run demo:ts (for TypeScript demo)');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test failed:', error.message);
    process.exit(1);
  });
}

module.exports = { testConnection, testBasicOperations, runTests };
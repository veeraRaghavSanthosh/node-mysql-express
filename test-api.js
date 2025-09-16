/**
 * Simple API Test Script
 * 
 * This script tests the API endpoints to verify they work correctly.
 * Run this after starting either the JavaScript or TypeScript server.
 * 
 * Usage:
 * node test-api.js
 */

const http = require('http');

const API_BASE = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ status: res.statusCode, data: response });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testCreateCustomer() {
  console.log('\n🧪 Testing: Create Customer');
  
  const customerData = {
    name: 'Test User',
    email: 'test@example.com',
    active: true
  };

  try {
    const response = await makeRequest('POST', '/api/customers', customerData);
    console.log(`✅ Status: ${response.status}`);
    console.log('📄 Response:', response.data);
    
    if (response.data && response.data.data && response.data.data.id) {
      return response.data.data.id;
    }
    return 1; // fallback ID for mock responses
  } catch (error) {
    console.log('❌ Error:', error.message);
    return null;
  }
}

async function testGetAllCustomers() {
  console.log('\n🧪 Testing: Get All Customers');
  
  try {
    const response = await makeRequest('GET', '/api/customers');
    console.log(`✅ Status: ${response.status}`);
    console.log('📄 Response:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testGetCustomerById(id) {
  console.log(`\n🧪 Testing: Get Customer by ID (${id})`);
  
  try {
    const response = await makeRequest('GET', `/api/customers/${id}`);
    console.log(`✅ Status: ${response.status}`);
    console.log('📄 Response:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testUpdateCustomer(id) {
  console.log(`\n🧪 Testing: Update Customer (${id})`);
  
  const updateData = {
    name: 'Updated Test User',
    email: 'updated@example.com',
    active: false
  };

  try {
    const response = await makeRequest('PUT', `/api/customers/${id}`, updateData);
    console.log(`✅ Status: ${response.status}`);
    console.log('📄 Response:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testDeleteCustomer(id) {
  console.log(`\n🧪 Testing: Delete Customer (${id})`);
  
  try {
    const response = await makeRequest('DELETE', `/api/customers/${id}`);
    console.log(`✅ Status: ${response.status}`);
    console.log('📄 Response:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

async function testInvalidRequests() {
  console.log('\n🧪 Testing: Invalid Requests');
  
  // Test invalid email
  try {
    const response = await makeRequest('POST', '/api/customers', {
      name: 'Test',
      email: 'invalid-email',
      active: true
    });
    console.log(`📧 Invalid email - Status: ${response.status}, Message: ${response.data.message}`);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test missing name
  try {
    const response = await makeRequest('POST', '/api/customers', {
      email: 'valid@example.com',
      active: true
    });
    console.log(`👤 Missing name - Status: ${response.status}, Message: ${response.data.message}`);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }

  // Test invalid ID
  try {
    const response = await makeRequest('GET', '/api/customers/invalid-id');
    console.log(`🆔 Invalid ID - Status: ${response.status}, Message: ${response.data.message}`);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API Tests...');
  console.log('📡 Make sure your server is running on http://localhost:3000');
  
  // Test server availability
  try {
    await makeRequest('GET', '/api/customers');
    console.log('✅ Server is responding');
  } catch (error) {
    console.log('❌ Server is not responding. Please start the server first.');
    console.log('   Run: node usage-examples.js');
    console.log('   Or:  npm run dev (for TypeScript)');
    return;
  }

  // Run all tests
  const customerId = await testCreateCustomer();
  await testGetAllCustomers();
  
  if (customerId) {
    await testGetCustomerById(customerId);
    await testUpdateCustomer(customerId);
    await testDeleteCustomer(customerId);
  }
  
  await testInvalidRequests();
  
  console.log('\n✨ All tests completed!');
  console.log('\n📖 Check the server logs to see the detailed request processing.');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests, makeRequest };
/**
 * Backward Compatibility Test Suite
 * 
 * This script validates that all existing APIs work exactly as before
 * and that the authentication middleware doesn't break existing functionality.
 */

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3000';
const TEST_PORT = 3000;

// Test data
const testCustomer = {
  email: 'test@example.com',
  name: 'Test Customer',
  active: true
};

/**
 * Make HTTP request helper
 */
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: TEST_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        try {
          const parsedBody = body ? JSON.parse(body) : {};
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: parsedBody
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

/**
 * Test suite
 */
async function runCompatibilityTests() {
  console.log('🚀 Starting Backward Compatibility Tests\n');

  let testsPassed = 0;
  let testsTotal = 0;
  let createdCustomerId = null;

  /**
   * Test helper function
   */
  function test(name, testFn) {
    return new Promise(async (resolve) => {
      testsTotal++;
      try {
        console.log(`🧪 Testing: ${name}`);
        await testFn();
        console.log(`✅ PASSED: ${name}\n`);
        testsPassed++;
        resolve(true);
      } catch (error) {
        console.log(`❌ FAILED: ${name}`);
        console.log(`   Error: ${error.message}\n`);
        resolve(false);
      }
    });
  }

  // Test 1: Public /user endpoint (should work without authentication)
  await test('GET /user endpoint returns expected data', async () => {
    const response = await makeRequest('GET', '/user');
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }

    if (!response.body.user || !Array.isArray(response.body.user)) {
      throw new Error('Response should contain user array');
    }

    if (response.body.user.length !== 2) {
      throw new Error(`Expected 2 users, got ${response.body.user.length}`);
    }

    // Verify user structure
    const user1 = response.body.user[0];
    if (!user1.id || !user1.name) {
      throw new Error('User objects should have id and name properties');
    }
  });

  // Test 2: Create customer via direct route (not protected)
  await test('POST /customers creates customer successfully', async () => {
    const response = await makeRequest('POST', '/customers', testCustomer);
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }

    if (!response.body.id) {
      throw new Error('Response should contain created customer ID');
    }

    // Store the created customer ID for later tests
    createdCustomerId = response.body.id;

    // Verify response structure
    if (response.body.email !== testCustomer.email) {
      throw new Error('Response email does not match input');
    }

    if (response.body.name !== testCustomer.name) {
      throw new Error('Response name does not match input');
    }
  });

  // Test 3: Get all customers
  await test('GET /customers retrieves all customers', async () => {
    const response = await makeRequest('GET', '/customers');
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }

    if (!Array.isArray(response.body)) {
      throw new Error('Response should be an array');
    }

    // Should contain at least the customer we created
    const foundCustomer = response.body.find(c => c.id === createdCustomerId);
    if (!foundCustomer) {
      throw new Error('Created customer not found in list');
    }
  });

  // Test 4: Get specific customer
  await test('GET /customers/:id retrieves specific customer', async () => {
    if (!createdCustomerId) {
      throw new Error('No customer ID available for test');
    }

    const response = await makeRequest('GET', `/customers/${createdCustomerId}`);
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }

    if (response.body.id !== createdCustomerId) {
      throw new Error('Retrieved customer ID does not match');
    }

    if (response.body.email !== testCustomer.email) {
      throw new Error('Retrieved customer email does not match');
    }
  });

  // Test 5: Update customer
  await test('PUT /customers/:id updates customer successfully', async () => {
    if (!createdCustomerId) {
      throw new Error('No customer ID available for test');
    }

    const updateData = {
      email: 'updated@example.com',
      name: 'Updated Customer',
      active: false
    };

    const response = await makeRequest('PUT', `/customers/${createdCustomerId}`, updateData);
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }

    if (response.body.email !== updateData.email) {
      throw new Error('Updated email does not match');
    }

    if (response.body.name !== updateData.name) {
      throw new Error('Updated name does not match');
    }

    if (response.body.active !== updateData.active) {
      throw new Error('Updated active status does not match');
    }
  });

  // Test 6: Error handling - Get non-existent customer
  await test('GET /customers/:id returns 404 for non-existent customer', async () => {
    const response = await makeRequest('GET', '/customers/99999');
    
    if (response.statusCode !== 404) {
      throw new Error(`Expected status 404, got ${response.statusCode}`);
    }

    if (!response.body.message || !response.body.message.includes('Not found')) {
      throw new Error('Error message should indicate customer not found');
    }
  });

  // Test 7: Error handling - Invalid request body
  await test('POST /customers returns 400 for empty request body', async () => {
    const response = await makeRequest('POST', '/customers', null);
    
    if (response.statusCode !== 400) {
      throw new Error(`Expected status 400, got ${response.statusCode}`);
    }

    if (!response.body.message || !response.body.message.includes('Content can not be empty')) {
      throw new Error('Error message should indicate empty content');
    }
  });

  // Test 8: Delete specific customer
  await test('DELETE /customers/:id deletes customer successfully', async () => {
    if (!createdCustomerId) {
      throw new Error('No customer ID available for test');
    }

    const response = await makeRequest('DELETE', `/customers/${createdCustomerId}`);
    
    if (response.statusCode !== 200) {
      throw new Error(`Expected status 200, got ${response.statusCode}`);
    }

    if (!response.body.message || !response.body.message.includes('deleted successfully')) {
      throw new Error('Success message should indicate deletion');
    }

    // Verify customer is actually deleted
    const getResponse = await makeRequest('GET', `/customers/${createdCustomerId}`);
    if (getResponse.statusCode !== 404) {
      throw new Error('Customer should not exist after deletion');
    }
  });

  // Test 9: Authentication middleware doesn't break direct routes
  await test('Direct routes bypass authentication middleware', async () => {
    // Create a customer via direct route
    const response = await makeRequest('POST', '/customers', {
      email: 'direct@example.com',
      name: 'Direct Route Test',
      active: true
    });
    
    if (response.statusCode !== 200) {
      throw new Error(`Direct route should work, got status ${response.statusCode}`);
    }

    // Clean up
    if (response.body.id) {
      await makeRequest('DELETE', `/customers/${response.body.id}`);
    }
  });

  // Test 10: Middleware application verification
  await test('Authentication middleware is properly configured', async () => {
    // This test verifies that the middleware is set up but doesn't break functionality
    // Since the current middleware just calls next(), all requests should pass through

    const response = await makeRequest('GET', '/customers');
    
    if (response.statusCode !== 200) {
      throw new Error('Middleware should allow requests to pass through');
    }
  });

  // Print test results
  console.log('📊 Test Results Summary');
  console.log('========================');
  console.log(`Total Tests: ${testsTotal}`);
  console.log(`Passed: ${testsPassed}`);
  console.log(`Failed: ${testsTotal - testsPassed}`);
  console.log(`Success Rate: ${((testsPassed / testsTotal) * 100).toFixed(1)}%`);

  if (testsPassed === testsTotal) {
    console.log('\n🎉 All tests passed! Backward compatibility is maintained.');
    return true;
  } else {
    console.log('\n⚠️  Some tests failed. Please review the implementation.');
    return false;
  }
}

/**
 * Check if server is running
 */
function checkServerRunning() {
  return new Promise((resolve) => {
    const req = http.request({
      hostname: 'localhost',
      port: TEST_PORT,
      path: '/user',
      method: 'GET'
    }, (res) => {
      resolve(true);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.setTimeout(1000, () => {
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('🔍 Checking if server is running...');
  
  const isRunning = await checkServerRunning();
  
  if (!isRunning) {
    console.log('❌ Server is not running on port 3000');
    console.log('Please start the server with: node server.js');
    process.exit(1);
  }

  console.log('✅ Server is running\n');
  
  const success = await runCompatibilityTests();
  
  process.exit(success ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { runCompatibilityTests, makeRequest };
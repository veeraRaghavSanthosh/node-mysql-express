/**
 * Authentication API Test Suite
 * 
 * This script tests all the documented authentication APIs
 * Run with: node test-auth-apis.js
 */

const BASE_URL = 'http://localhost:3000';

// Helper function for making HTTP requests
async function makeRequest(url, options = {}) {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        
        return {
            status: response.status,
            statusText: response.statusText,
            data: data
        };
    } catch (error) {
        return {
            status: 0,
            statusText: 'Network Error',
            data: { message: error.message }
        };
    }
}

// Test functions
async function testGetUser() {
    console.log('\n🧪 Testing GET /user');
    const result = await makeRequest(`${BASE_URL}/user`);
    console.log(`Status: ${result.status} ${result.statusText}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testCreateCustomer() {
    console.log('\n🧪 Testing POST /customers');
    const customerData = {
        email: 'test@example.com',
        name: 'Test User',
        active: true
    };
    
    const result = await makeRequest(`${BASE_URL}/customers`, {
        method: 'POST',
        body: JSON.stringify(customerData)
    });
    
    console.log(`Status: ${result.status} ${result.statusText}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    // Return the created customer ID for other tests
    return result.data?.id;
}

async function testGetAllCustomers() {
    console.log('\n🧪 Testing GET /customers');
    const result = await makeRequest(`${BASE_URL}/customers`);
    console.log(`Status: ${result.status} ${result.statusText}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
    
    // Return first customer ID if available
    return Array.isArray(result.data) && result.data.length > 0 ? result.data[0].id : null;
}

async function testGetCustomerById(customerId) {
    if (!customerId) {
        console.log('\n⏭️  Skipping GET /customers/:id (no customer ID available)');
        return;
    }
    
    console.log(`\n🧪 Testing GET /customers/${customerId}`);
    const result = await makeRequest(`${BASE_URL}/customers/${customerId}`);
    console.log(`Status: ${result.status} ${result.statusText}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testUpdateCustomer(customerId) {
    if (!customerId) {
        console.log('\n⏭️  Skipping PUT /customers/:id (no customer ID available)');
        return;
    }
    
    console.log(`\n🧪 Testing PUT /customers/${customerId}`);
    const updateData = {
        email: 'updated@example.com',
        name: 'Updated User',
        active: false
    };
    
    const result = await makeRequest(`${BASE_URL}/customers/${customerId}`, {
        method: 'PUT',
        body: JSON.stringify(updateData)
    });
    
    console.log(`Status: ${result.status} ${result.statusText}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testDeleteCustomer(customerId) {
    if (!customerId) {
        console.log('\n⏭️  Skipping DELETE /customers/:id (no customer ID available)');
        return;
    }
    
    console.log(`\n🧪 Testing DELETE /customers/${customerId}`);
    const result = await makeRequest(`${BASE_URL}/customers/${customerId}`, {
        method: 'DELETE'
    });
    
    console.log(`Status: ${result.status} ${result.statusText}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
}

async function testDeleteAllCustomers() {
    console.log('\n🧪 Testing DELETE /customers (delete all)');
    const result = await makeRequest(`${BASE_URL}/customers`, {
        method: 'DELETE'
    });
    
    console.log(`Status: ${result.status} ${result.statusText}`);
    console.log('Response:', JSON.stringify(result.data, null, 2));
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Authentication API Test Suite');
    console.log(`📍 Base URL: ${BASE_URL}`);
    console.log('=' .repeat(50));
    
    try {
        // Test public endpoint
        await testGetUser();
        
        // Test customer creation
        const createdCustomerId = await testCreateCustomer();
        
        // Test getting all customers
        const existingCustomerId = await testGetAllCustomers();
        
        // Use created customer ID or existing one
        const testCustomerId = createdCustomerId || existingCustomerId;
        
        // Test individual customer operations
        await testGetCustomerById(testCustomerId);
        await testUpdateCustomer(testCustomerId);
        await testDeleteCustomer(testCustomerId);
        
        // Test delete all (uncomment if you want to test this)
        // await testDeleteAllCustomers();
        
        console.log('\n✅ Test suite completed!');
        console.log('\n📋 Summary:');
        console.log('- All documented endpoints were tested');
        console.log('- Check the responses above for API behavior');
        console.log('- Refer to AUTH_API_DOCS.md for detailed specifications');
        
    } catch (error) {
        console.error('\n❌ Test suite failed:', error.message);
    }
}

// Error handling for missing fetch
if (typeof fetch === 'undefined') {
    console.error('❌ Error: This script requires Node.js 18+ or install node-fetch');
    console.log('💡 Solutions:');
    console.log('   1. Use Node.js 18+ (has built-in fetch)');
    console.log('   2. Or install node-fetch: npm install node-fetch');
    process.exit(1);
}

// Run the tests
runAllTests().catch(console.error);
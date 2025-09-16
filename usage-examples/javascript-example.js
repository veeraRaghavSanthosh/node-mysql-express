/**
 * Node.js Express MySQL REST API - JavaScript Usage Example
 * 
 * This example demonstrates how to interact with the customer REST API
 * using native Node.js HTTP client and popular HTTP libraries like axios.
 */

const http = require('http');
const https = require('https');

// Configuration
const API_BASE_URL = 'http://localhost:3000';

// Example customer data
const sampleCustomer = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  active: true
};

/**
 * Helper function to make HTTP requests using native Node.js http module
 */
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = {
            statusCode: res.statusCode,
            headers: res.headers,
            data: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Example functions demonstrating API usage
 */

// 1. Create a new customer
async function createCustomer(customerData) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/customers',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await makeRequest(options, customerData);
    console.log('Customer created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error);
    throw error;
  }
}

// 2. Get all customers
async function getAllCustomers() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/customers',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await makeRequest(options);
    console.log('All customers:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error);
    throw error;
  }
}

// 3. Get a customer by ID
async function getCustomerById(customerId) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/customers/${customerId}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await makeRequest(options);
    console.log(`Customer ${customerId}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error fetching customer ${customerId}:`, error);
    throw error;
  }
}

// 4. Update a customer
async function updateCustomer(customerId, updateData) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/customers/${customerId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await makeRequest(options, updateData);
    console.log(`Customer ${customerId} updated:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error updating customer ${customerId}:`, error);
    throw error;
  }
}

// 5. Delete a customer
async function deleteCustomer(customerId) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/customers/${customerId}`,
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await makeRequest(options);
    console.log(`Customer ${customerId} deleted:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error deleting customer ${customerId}:`, error);
    throw error;
  }
}

// 6. Delete all customers
async function deleteAllCustomers() {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/customers',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await makeRequest(options);
    console.log('All customers deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting all customers:', error);
    throw error;
  }
}

/**
 * Example usage with axios (popular HTTP client)
 * First install: npm install axios
 */
async function exampleWithAxios() {
  try {
    const axios = require('axios');
    const baseURL = 'http://localhost:3000';
    
    // Create axios instance
    const api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Create customer
    const newCustomer = await api.post('/customers', sampleCustomer);
    console.log('Created customer (axios):', newCustomer.data);
    
    // Get all customers
    const allCustomers = await api.get('/customers');
    console.log('All customers (axios):', allCustomers.data);
    
    // Get specific customer
    const customerId = newCustomer.data.id;
    const customer = await api.get(`/customers/${customerId}`);
    console.log('Specific customer (axios):', customer.data);
    
    // Update customer
    const updatedCustomer = await api.put(`/customers/${customerId}`, {
      ...sampleCustomer,
      name: 'Jane Doe Updated'
    });
    console.log('Updated customer (axios):', updatedCustomer.data);
    
    // Delete customer
    const deleteResult = await api.delete(`/customers/${customerId}`);
    console.log('Delete result (axios):', deleteResult.data);
    
  } catch (error) {
    console.error('Axios example error:', error.response?.data || error.message);
  }
}

/**
 * Complete example workflow
 */
async function runExample() {
  try {
    console.log('=== Node.js Express MySQL API Example ===\n');
    
    // 1. Create a new customer
    console.log('1. Creating a new customer...');
    const newCustomer = await createCustomer(sampleCustomer);
    const customerId = newCustomer.id;
    
    // 2. Get all customers
    console.log('\n2. Fetching all customers...');
    await getAllCustomers();
    
    // 3. Get the specific customer
    console.log('\n3. Fetching specific customer...');
    await getCustomerById(customerId);
    
    // 4. Update the customer
    console.log('\n4. Updating customer...');
    const updatedData = {
      ...sampleCustomer,
      name: 'John Doe Updated',
      email: 'john.updated@example.com'
    };
    await updateCustomer(customerId, updatedData);
    
    // 5. Get the updated customer
    console.log('\n5. Fetching updated customer...');
    await getCustomerById(customerId);
    
    // 6. Delete the customer
    console.log('\n6. Deleting customer...');
    await deleteCustomer(customerId);
    
    console.log('\n=== Example completed successfully! ===');
    
  } catch (error) {
    console.error('Example failed:', error);
  }
}

// Export functions for use in other modules
module.exports = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  deleteAllCustomers,
  runExample,
  exampleWithAxios
};

// Run example if this file is executed directly
if (require.main === module) {
  runExample();
}
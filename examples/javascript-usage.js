/**
 * Node.js Express MySQL API - JavaScript Usage Examples
 * 
 * This example demonstrates how to interact with the Customer API
 * using standard HTTP requests with fetch or axios.
 */

const axios = require('axios');

// Base URL for the API (adjust according to your server configuration)
const API_BASE_URL = 'http://localhost:3000';

/**
 * Example Customer object structure
 */
const sampleCustomer = {
  name: "John Doe",
  email: "john.doe@example.com",
  active: true
};

/**
 * Create a new customer
 */
async function createCustomer(customerData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/customers`, customerData);
    console.log('Customer created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating customer:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get all customers
 */
async function getAllCustomers() {
  try {
    const response = await axios.get(`${API_BASE_URL}/customers`);
    console.log('All customers:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching customers:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Get a specific customer by ID
 */
async function getCustomerById(customerId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/customers/${customerId}`);
    console.log('Customer found:', response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`Customer with ID ${customerId} not found`);
    } else {
      console.error('Error fetching customer:', error.response?.data || error.message);
    }
    throw error;
  }
}

/**
 * Update a customer
 */
async function updateCustomer(customerId, updatedData) {
  try {
    const response = await axios.put(`${API_BASE_URL}/customers/${customerId}`, updatedData);
    console.log('Customer updated:', response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`Customer with ID ${customerId} not found`);
    } else {
      console.error('Error updating customer:', error.response?.data || error.message);
    }
    throw error;
  }
}

/**
 * Delete a customer
 */
async function deleteCustomer(customerId) {
  try {
    const response = await axios.delete(`${API_BASE_URL}/customers/${customerId}`);
    console.log('Customer deleted:', response.data);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      console.log(`Customer with ID ${customerId} not found`);
    } else {
      console.error('Error deleting customer:', error.response?.data || error.message);
    }
    throw error;
  }
}

/**
 * Delete all customers
 */
async function deleteAllCustomers() {
  try {
    const response = await axios.delete(`${API_BASE_URL}/customers`);
    console.log('All customers deleted:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting all customers:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Example usage demonstrating complete CRUD operations
 */
async function demonstrateUsage() {
  try {
    console.log('=== Node.js Express MySQL API Demo ===\n');

    // 1. Create a new customer
    console.log('1. Creating a new customer...');
    const newCustomer = await createCustomer(sampleCustomer);
    const customerId = newCustomer.id;
    console.log('');

    // 2. Get all customers
    console.log('2. Fetching all customers...');
    await getAllCustomers();
    console.log('');

    // 3. Get specific customer
    console.log('3. Fetching customer by ID...');
    await getCustomerById(customerId);
    console.log('');

    // 4. Update customer
    console.log('4. Updating customer...');
    const updatedData = {
      name: "John Smith",
      email: "john.smith@example.com",
      active: false
    };
    await updateCustomer(customerId, updatedData);
    console.log('');

    // 5. Verify update
    console.log('5. Verifying update...');
    await getCustomerById(customerId);
    console.log('');

    // 6. Delete specific customer
    console.log('6. Deleting customer...');
    await deleteCustomer(customerId);
    console.log('');

    // 7. Try to get deleted customer (should return 404)
    console.log('7. Trying to fetch deleted customer...');
    try {
      await getCustomerById(customerId);
    } catch (error) {
      console.log('Expected: Customer not found after deletion\n');
    }

    console.log('=== Demo completed successfully ===');

  } catch (error) {
    console.error('Demo failed:', error.message);
  }
}

// Alternative usage with native fetch (Node.js 18+)
async function fetchExample() {
  try {
    // Create customer using fetch
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: "Jane Doe",
        email: "jane.doe@example.com",
        active: true
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const customer = await response.json();
    console.log('Customer created with fetch:', customer);
    
  } catch (error) {
    console.error('Fetch error:', error.message);
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
  demonstrateUsage,
  fetchExample
};

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateUsage();
}
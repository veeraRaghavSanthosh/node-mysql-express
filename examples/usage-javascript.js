/**
 * Node.js Express MySQL REST API - JavaScript Usage Example
 * 
 * This example demonstrates how to use the Customer REST API
 * with basic HTTP requests using the built-in fetch API or axios.
 */

const axios = require('axios'); // npm install axios

// Base URL for the API
const API_BASE_URL = 'http://localhost:3000';

// Customer API client
class CustomerAPIClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Create a new customer
  async createCustomer(customerData) {
    try {
      const response = await axios.post(`${this.baseUrl}/customers`, customerData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  // Get all customers
  async getAllCustomers() {
    try {
      const response = await axios.get(`${this.baseUrl}/customers`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get customers: ${error.message}`);
    }
  }

  // Get a single customer by ID
  async getCustomerById(customerId) {
    try {
      const response = await axios.get(`${this.baseUrl}/customers/${customerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get customer: ${error.message}`);
    }
  }

  // Update a customer
  async updateCustomer(customerId, customerData) {
    try {
      const response = await axios.put(`${this.baseUrl}/customers/${customerId}`, customerData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  }

  // Delete a customer
  async deleteCustomer(customerId) {
    try {
      const response = await axios.delete(`${this.baseUrl}/customers/${customerId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }

  // Delete all customers
  async deleteAllCustomers() {
    try {
      const response = await axios.delete(`${this.baseUrl}/customers`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete all customers: ${error.message}`);
    }
  }
}

// Usage examples
async function demonstrateAPI() {
  const client = new CustomerAPIClient();

  try {
    console.log('=== Customer API Demo ===\n');

    // 1. Create a new customer
    console.log('1. Creating a new customer...');
    const newCustomer = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      active: true
    };
    const createdCustomer = await client.createCustomer(newCustomer);
    console.log('Created customer:', createdCustomer);
    const customerId = createdCustomer.id;

    // 2. Get all customers
    console.log('\n2. Getting all customers...');
    const allCustomers = await client.getAllCustomers();
    console.log('All customers:', allCustomers);

    // 3. Get specific customer
    console.log('\n3. Getting customer by ID...');
    const customer = await client.getCustomerById(customerId);
    console.log('Customer:', customer);

    // 4. Update customer
    console.log('\n4. Updating customer...');
    const updatedData = {
      name: 'John Smith',
      email: 'john.smith@example.com',
      active: false
    };
    const updatedCustomer = await client.updateCustomer(customerId, updatedData);
    console.log('Updated customer:', updatedCustomer);

    // 5. Delete customer
    console.log('\n5. Deleting customer...');
    const deleteResult = await client.deleteCustomer(customerId);
    console.log('Delete result:', deleteResult);

    console.log('\n=== Demo completed successfully! ===');

  } catch (error) {
    console.error('Error during API demo:', error.message);
  }
}

// Alternative usage with native fetch API (no external dependencies)
class CustomerAPIClientFetch {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async makeRequest(url, options = {}) {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async createCustomer(customerData) {
    return this.makeRequest(`${this.baseUrl}/customers`, {
      method: 'POST',
      body: JSON.stringify(customerData)
    });
  }

  async getAllCustomers() {
    return this.makeRequest(`${this.baseUrl}/customers`);
  }

  async getCustomerById(customerId) {
    return this.makeRequest(`${this.baseUrl}/customers/${customerId}`);
  }

  async updateCustomer(customerId, customerData) {
    return this.makeRequest(`${this.baseUrl}/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(customerData)
    });
  }

  async deleteCustomer(customerId) {
    return this.makeRequest(`${this.baseUrl}/customers/${customerId}`, {
      method: 'DELETE'
    });
  }

  async deleteAllCustomers() {
    return this.makeRequest(`${this.baseUrl}/customers`, {
      method: 'DELETE'
    });
  }
}

// Export for use in other modules
module.exports = {
  CustomerAPIClient,
  CustomerAPIClientFetch
};

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateAPI();
}
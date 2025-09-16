/**
 * JavaScript Usage Example for Node.js Express MySQL REST API
 * 
 * This example demonstrates how to use the Customer API endpoints
 * with proper error handling and async/await patterns.
 */

const axios = require('axios');

class CustomerAPIClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  /**
   * Create a new customer
   */
  async createCustomer(customer) {
    try {
      const response = await axios.post(`${this.baseURL}/customers`, customer);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get all customers
   */
  async getAllCustomers() {
    try {
      const response = await axios.get(`${this.baseURL}/customers`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch customers: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get a customer by ID
   */
  async getCustomerById(customerId) {
    try {
      const response = await axios.get(`${this.baseURL}/customers/${customerId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }
      throw new Error(`Failed to fetch customer: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Update a customer by ID
   */
  async updateCustomer(customerId, customer) {
    try {
      const response = await axios.put(`${this.baseURL}/customers/${customerId}`, customer);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }
      throw new Error(`Failed to update customer: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Delete a customer by ID
   */
  async deleteCustomer(customerId) {
    try {
      const response = await axios.delete(`${this.baseURL}/customers/${customerId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }
      throw new Error(`Failed to delete customer: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Delete all customers
   */
  async deleteAllCustomers() {
    try {
      const response = await axios.delete(`${this.baseURL}/customers`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete all customers: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Usage example
async function main() {
  const apiClient = new CustomerAPIClient('http://localhost:3000');

  try {
    // Create a new customer
    const newCustomer = {
      email: 'jane.doe@example.com',
      name: 'Jane Doe',
      active: true
    };

    console.log('Creating customer...');
    const createdCustomer = await apiClient.createCustomer(newCustomer);
    console.log('Created customer:', createdCustomer);

    // Get all customers
    console.log('\nFetching all customers...');
    const allCustomers = await apiClient.getAllCustomers();
    console.log('All customers:', allCustomers);

    // Get customer by ID
    console.log(`\nFetching customer with ID ${createdCustomer.id}...`);
    const customer = await apiClient.getCustomerById(createdCustomer.id);
    console.log('Customer details:', customer);

    // Update customer
    console.log(`\nUpdating customer with ID ${createdCustomer.id}...`);
    const updatedCustomerData = {
      email: 'jane.updated@example.com',
      name: 'Jane Updated',
      active: false
    };
    const updatedCustomer = await apiClient.updateCustomer(createdCustomer.id, updatedCustomerData);
    console.log('Updated customer:', updatedCustomer);

    // Delete customer
    console.log(`\nDeleting customer with ID ${createdCustomer.id}...`);
    const deleteResult = await apiClient.deleteCustomer(createdCustomer.id);
    console.log('Delete result:', deleteResult);

  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Advanced usage with utility functions
class CustomerService {
  constructor(apiClient) {
    this.apiClient = apiClient;
  }

  /**
   * Bulk create customers with validation
   */
  async bulkCreateCustomers(customers) {
    const results = [];
    
    for (const customer of customers) {
      // Validate email format
      if (!this.isValidEmail(customer.email)) {
        throw new Error(`Invalid email format: ${customer.email}`);
      }

      try {
        const created = await this.apiClient.createCustomer(customer);
        results.push(created);
        console.log(`Created customer: ${customer.name}`);
      } catch (error) {
        console.error(`Failed to create customer ${customer.name}:`, error.message);
        throw error;
      }
    }

    return results;
  }

  /**
   * Get active customers only
   */
  async getActiveCustomers() {
    const allCustomers = await this.apiClient.getAllCustomers();
    return allCustomers.filter(customer => customer.active);
  }

  /**
   * Validate email format
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export for use in other modules
module.exports = {
  CustomerAPIClient,
  CustomerService
};

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
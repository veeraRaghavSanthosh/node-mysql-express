const axios = require('axios');

/**
 * Customer API Client for Node.js Express MySQL REST API
 */
class CustomerApiClient {
  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Create a new customer
   * @param {Object} customer - Customer data
   * @param {string} customer.name - Customer name
   * @param {string} customer.email - Customer email
   * @param {boolean} customer.active - Customer active status
   * @returns {Promise<Object>} Created customer with ID
   */
  async createCustomer(customer) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/customers`,
        customer,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  /**
   * Get all customers
   * @returns {Promise<Array>} Array of customers
   */
  async getAllCustomers() {
    try {
      const response = await axios.get(`${this.baseUrl}/customers`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch customers: ${error.message}`);
    }
  }

  /**
   * Get a single customer by ID
   * @param {number} id - Customer ID
   * @returns {Promise<Object>} Customer data
   */
  async getCustomerById(id) {
    try {
      const response = await axios.get(`${this.baseUrl}/customers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch customer with ID ${id}: ${error.message}`);
    }
  }

  /**
   * Update a customer
   * @param {number} id - Customer ID
   * @param {Object} customer - Updated customer data
   * @returns {Promise<Object>} Updated customer data
   */
  async updateCustomer(id, customer) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/customers/${id}`,
        customer,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update customer with ID ${id}: ${error.message}`);
    }
  }

  /**
   * Delete a customer
   * @param {number} id - Customer ID
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteCustomer(id) {
    try {
      const response = await axios.delete(`${this.baseUrl}/customers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete customer with ID ${id}: ${error.message}`);
    }
  }

  /**
   * Delete all customers
   * @returns {Promise<Object>} Deletion confirmation
   */
  async deleteAllCustomers() {
    try {
      const response = await axios.delete(`${this.baseUrl}/customers`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete all customers: ${error.message}`);
    }
  }
}

// Usage Example
async function main() {
  const apiClient = new CustomerApiClient('http://localhost:3000');

  try {
    // Create a new customer
    console.log('Creating a new customer...');
    const newCustomer = await apiClient.createCustomer({
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      active: true,
    });
    console.log('Created customer:', newCustomer);

    // Get all customers
    console.log('\nFetching all customers...');
    const customers = await apiClient.getAllCustomers();
    console.log('All customers:', customers);

    // Get customer by ID
    if (newCustomer.id) {
      console.log(`\nFetching customer with ID ${newCustomer.id}...`);
      const customer = await apiClient.getCustomerById(newCustomer.id);
      console.log('Customer:', customer);

      // Update customer
      console.log(`\nUpdating customer with ID ${newCustomer.id}...`);
      const updatedCustomer = await apiClient.updateCustomer(newCustomer.id, {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        active: false,
      });
      console.log('Updated customer:', updatedCustomer);

      // Delete customer
      console.log(`\nDeleting customer with ID ${newCustomer.id}...`);
      const deleteResult = await apiClient.deleteCustomer(newCustomer.id);
      console.log('Delete result:', deleteResult);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { CustomerApiClient };
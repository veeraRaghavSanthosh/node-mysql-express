const axios = require('axios');

class CustomerAPI {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  // Create a new customer
  async createCustomer(customer) {
    try {
      const response = await axios.post(`${this.baseURL}/customers`, customer);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Get all customers
  async getAllCustomers() {
    try {
      const response = await axios.get(`${this.baseURL}/customers`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Get a specific customer by ID
  async getCustomerById(customerId) {
    try {
      const response = await axios.get(`${this.baseURL}/customers/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  // Update a customer
  async updateCustomer(customerId, customer) {
    try {
      const response = await axios.put(`${this.baseURL}/customers/${customerId}`, customer);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Delete a customer
  async deleteCustomer(customerId) {
    try {
      const response = await axios.delete(`${this.baseURL}/customers/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Delete all customers
  async deleteAllCustomers() {
    try {
      const response = await axios.delete(`${this.baseURL}/customers`);
      return response.data;
    } catch (error) {
      console.error('Error deleting all customers:', error);
      throw error;
    }
  }
}

// Usage example
async function example() {
  const api = new CustomerAPI();

  try {
    // Create a new customer
    const newCustomer = await api.createCustomer({
      email: 'jane.doe@example.com',
      name: 'Jane Doe',
      active: true
    });
    console.log('Created customer:', newCustomer);

    // Get all customers
    const customers = await api.getAllCustomers();
    console.log('All customers:', customers);

    // Get a specific customer
    const customer = await api.getCustomerById(newCustomer.id);
    console.log('Retrieved customer:', customer);

    // Update the customer
    const updatedCustomer = await api.updateCustomer(newCustomer.id, {
      email: 'jane.updated@example.com',
      name: 'Jane Updated',
      active: false
    });
    console.log('Updated customer:', updatedCustomer);

    // Delete the customer
    const deleteResult = await api.deleteCustomer(newCustomer.id);
    console.log('Delete result:', deleteResult);
  } catch (error) {
    console.error('API operation failed:', error);
  }
}

// Run the example
example();
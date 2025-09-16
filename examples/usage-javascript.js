/**
 * JavaScript Usage Example for Node.js Express MySQL CRUD API
 * 
 * This example demonstrates how to use the customer management API
 * with various HTTP operations (GET, POST, PUT, DELETE)
 */

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // For making HTTP requests to test the API

// Import the customer routes and models
const Customer = require('../app/models/customer.model');

// Example 1: Basic server setup
function createServer() {
  const app = express();
  
  // Middleware setup
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  
  // Custom authentication middleware
  const authMiddleware = (req, res, next) => {
    // Add your authentication logic here
    console.log('Authentication middleware executed');
    next();
  };
  
  app.use('/api/*', authMiddleware);
  
  // Load customer routes
  require('../app/routes/customer.routes')(app);
  
  return app;
}

// Example 2: Using the Customer model directly
function directModelUsage() {
  // Create a new customer
  const newCustomer = {
    email: 'john.doe@example.com',
    name: 'John Doe',
    active: true
  };
  
  // Create customer
  Customer.create(newCustomer, (err, data) => {
    if (err) {
      console.error('Error creating customer:', err);
      return;
    }
    console.log('Customer created:', data);
    
    // Find the created customer
    Customer.findById(data.id, (err, customer) => {
      if (err) {
        console.error('Error finding customer:', err);
        return;
      }
      console.log('Found customer:', customer);
    });
  });
  
  // Get all customers
  Customer.getAll((err, customers) => {
    if (err) {
      console.error('Error getting customers:', err);
      return;
    }
    console.log('All customers:', customers);
  });
  
  // Update customer
  const updateData = {
    email: 'john.updated@example.com',
    name: 'John Updated',
    active: false
  };
  
  Customer.updateById(1, updateData, (err, data) => {
    if (err) {
      console.error('Error updating customer:', err);
      return;
    }
    console.log('Customer updated:', data);
  });
  
  // Delete customer
  Customer.remove(1, (err, data) => {
    if (err) {
      console.error('Error deleting customer:', err);
      return;
    }
    console.log('Customer deleted successfully');
  });
}

// Example 3: API client usage with axios
class CustomerAPIClient {
  constructor(baseURL = 'http://localhost:3000') {
    this.baseURL = baseURL;
    this.axios = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  async createCustomer(customerData) {
    try {
      const response = await this.axios.post('/customers', customerData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to create customer: ${error.response?.data?.message || error.message}`);
    }
  }
  
  async getAllCustomers() {
    try {
      const response = await this.axios.get('/customers');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get customers: ${error.response?.data?.message || error.message}`);
    }
  }
  
  async getCustomerById(id) {
    try {
      const response = await this.axios.get(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get customer: ${error.response?.data?.message || error.message}`);
    }
  }
  
  async updateCustomer(id, customerData) {
    try {
      const response = await this.axios.put(`/customers/${id}`, customerData);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update customer: ${error.response?.data?.message || error.message}`);
    }
  }
  
  async deleteCustomer(id) {
    try {
      const response = await this.axios.delete(`/customers/${id}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete customer: ${error.response?.data?.message || error.message}`);
    }
  }
  
  async deleteAllCustomers() {
    try {
      const response = await this.axios.delete('/customers');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete all customers: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Example 4: Complete usage demonstration
async function demonstrateAPIUsage() {
  const client = new CustomerAPIClient();
  
  try {
    // Create a new customer
    const newCustomer = await client.createCustomer({
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      active: true
    });
    console.log('Created customer:', newCustomer);
    
    // Get all customers
    const customers = await client.getAllCustomers();
    console.log('All customers:', customers);
    
    // Get specific customer
    const customer = await client.getCustomerById(newCustomer.id);
    console.log('Retrieved customer:', customer);
    
    // Update customer
    const updatedCustomer = await client.updateCustomer(newCustomer.id, {
      email: 'jane.updated@example.com',
      name: 'Jane Updated Smith',
      active: false
    });
    console.log('Updated customer:', updatedCustomer);
    
    // Delete customer
    const deleteResult = await client.deleteCustomer(newCustomer.id);
    console.log('Delete result:', deleteResult);
    
  } catch (error) {
    console.error('API Error:', error.message);
  }
}

// Example 5: Server startup with error handling
function startServer(port = 3000) {
  const app = createServer();
  
  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Server error:', err.stack);
    res.status(500).json({
      message: 'Something went wrong!',
      error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
  });
  
  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      message: 'Route not found'
    });
  });
  
  const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
      console.log('Process terminated');
    });
  });
  
  return server;
}

// Export for testing and reuse
module.exports = {
  createServer,
  directModelUsage,
  CustomerAPIClient,
  demonstrateAPIUsage,
  startServer
};

// Run examples if this file is executed directly
if (require.main === module) {
  console.log('=== Node.js Express MySQL API Usage Examples ===\n');
  
  console.log('1. Starting server...');
  const server = startServer(3000);
  
  // Wait a moment for server to start, then run API demo
  setTimeout(async () => {
    console.log('\n2. Demonstrating API usage...');
    await demonstrateAPIUsage();
    
    console.log('\n3. Demonstrating direct model usage...');
    directModelUsage();
    
    // Close server after demo
    setTimeout(() => {
      server.close();
      console.log('\nDemo completed!');
    }, 2000);
  }, 1000);
}
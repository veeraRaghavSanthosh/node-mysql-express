/**
 * Node.js Express MySQL REST API - TypeScript Usage Example
 * 
 * This example demonstrates how to interact with the customer REST API
 * using TypeScript with proper type definitions and modern async/await syntax.
 * 
 * Prerequisites:
 * npm install --save-dev typescript @types/node
 * npm install axios  // for HTTP client example (optional)
 */

const http = require('http');
// Uncomment the line below if you have axios installed
// const axios = require('axios');

// Type definitions for the API
interface Customer {
  id?: number;
  name: string;
  email: string;
  active: boolean;
}

interface CustomerResponse extends Customer {
  id: number;
}

interface ApiResponse<T> {
  statusCode: number;
  headers: any;
  data: T;
}

interface ApiError {
  message: string;
  status?: number;
}

// Configuration
const API_BASE_URL = 'http://localhost:3000';
const API_CONFIG = {
  hostname: 'localhost',
  port: 3000,
  headers: {
    'Content-Type': 'application/json'
  }
};

// Example customer data
const sampleCustomer: Customer = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  active: true
};

/**
 * HTTP Client class for making requests
 */
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generic HTTP request method using native Node.js http module
   */
  private async makeRequest<T>(
    path: string,
    method: string = 'GET',
    data?: any
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const options: any = {
        ...API_CONFIG,
        path,
        method
      };

      const req = http.request(options, (res: any) => {
        let body = '';

        res.on('data', (chunk: any) => {
          body += chunk.toString();
        });

        res.on('end', () => {
          try {
            const response: ApiResponse<T> = {
              statusCode: res.statusCode || 0,
              headers: res.headers,
              data: body ? JSON.parse(body) : null
            };
            
            if (res.statusCode && res.statusCode >= 400) {
              reject(new Error(`HTTP ${res.statusCode}: ${body}`));
            } else {
              resolve(response);
            }
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
   * Create a new customer
   */
  async createCustomer(customerData: Customer): Promise<CustomerResponse> {
    try {
      const response = await this.makeRequest<CustomerResponse>(
        '/customers',
        'POST',
        customerData
      );
      console.log('Customer created:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  /**
   * Get all customers
   */
  async getAllCustomers(): Promise<CustomerResponse[]> {
    try {
      const response = await this.makeRequest<CustomerResponse[]>('/customers');
      console.log('All customers:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  /**
   * Get a customer by ID
   */
  async getCustomerById(customerId: number): Promise<CustomerResponse> {
    try {
      const response = await this.makeRequest<CustomerResponse>(
        `/customers/${customerId}`
      );
      console.log(`Customer ${customerId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error fetching customer ${customerId}:`, error);
      throw error;
    }
  }

  /**
   * Update a customer
   */
  async updateCustomer(
    customerId: number,
    updateData: Customer
  ): Promise<CustomerResponse> {
    try {
      const response = await this.makeRequest<CustomerResponse>(
        `/customers/${customerId}`,
        'PUT',
        updateData
      );
      console.log(`Customer ${customerId} updated:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error updating customer ${customerId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a customer
   */
  async deleteCustomer(customerId: number): Promise<{ message: string }> {
    try {
      const response = await this.makeRequest<{ message: string }>(
        `/customers/${customerId}`,
        'DELETE'
      );
      console.log(`Customer ${customerId} deleted:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Error deleting customer ${customerId}:`, error);
      throw error;
    }
  }

  /**
   * Delete all customers
   */
  async deleteAllCustomers(): Promise<{ message: string }> {
    try {
      const response = await this.makeRequest<{ message: string }>(
        '/customers',
        'DELETE'
      );
      console.log('All customers deleted:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting all customers:', error);
      throw error;
    }
  }
}

/**
 * Axios-based API client with better error handling and interceptors
 * Note: Requires 'npm install axios' to use this class
 */
class AxiosApiClient {
  private api: any;

  constructor(baseUrl: string = API_BASE_URL) {
    // Uncomment the lines below if you have axios installed
    /*
    const axios = require('axios');
    this.api = axios.create({
      baseURL: baseUrl,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000 // 10 second timeout
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config: any) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error: any) => Promise.reject(error)
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: any) => response,
      (error: any) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
    */
    throw new Error('AxiosApiClient requires axios to be installed. Run: npm install axios');
  }

  async createCustomer(customerData: Customer): Promise<CustomerResponse> {
    const response = await this.api.post('/customers', customerData);
    return response.data;
  }

  async getAllCustomers(): Promise<CustomerResponse[]> {
    const response = await this.api.get('/customers');
    return response.data;
  }

  async getCustomerById(customerId: number): Promise<CustomerResponse> {
    const response = await this.api.get(`/customers/${customerId}`);
    return response.data;
  }

  async updateCustomer(customerId: number, updateData: Customer): Promise<CustomerResponse> {
    const response = await this.api.put(`/customers/${customerId}`, updateData);
    return response.data;
  }

  async deleteCustomer(customerId: number): Promise<{ message: string }> {
    const response = await this.api.delete(`/customers/${customerId}`);
    return response.data;
  }

  async deleteAllCustomers(): Promise<{ message: string }> {
    const response = await this.api.delete('/customers');
    return response.data;
  }
}

/**
 * Service class with business logic
 */
class CustomerService {
  private client: ApiClient | AxiosApiClient;

  constructor(useAxios: boolean = false) {
    if (useAxios) {
      console.log('Note: AxiosApiClient requires axios to be installed');
    }
    this.client = useAxios ? new AxiosApiClient() : new ApiClient();
  }

  /**
   * Create a customer with validation
   */
  async createCustomer(customerData: Customer): Promise<CustomerResponse> {
    // Validate input
    if (!customerData.name || !customerData.email) {
      throw new Error('Name and email are required');
    }

    if (!this.isValidEmail(customerData.email)) {
      throw new Error('Invalid email format');
    }

    return await this.client.createCustomer(customerData);
  }

  /**
   * Get customers with optional filtering
   */
  async getCustomers(activeOnly?: boolean): Promise<CustomerResponse[]> {
    const customers = await this.client.getAllCustomers();
    
    if (activeOnly !== undefined) {
      return customers.filter(customer => customer.active === activeOnly);
    }
    
    return customers;
  }

  /**
   * Update customer with partial data
   */
  async updateCustomer(
    customerId: number,
    updateData: Partial<Customer>
  ): Promise<CustomerResponse> {
    // Get existing customer first
    const existingCustomer = await this.client.getCustomerById(customerId);
    
    // Merge with update data
    const mergedData: Customer = {
      ...existingCustomer,
      ...updateData
    };

    return await this.client.updateCustomer(customerId, mergedData);
  }

  /**
   * Batch operations
   */
  async createMultipleCustomers(customers: Customer[]): Promise<CustomerResponse[]> {
    const results: CustomerResponse[] = [];
    
    for (const customer of customers) {
      try {
        const result = await this.createCustomer(customer);
        results.push(result);
      } catch (error) {
        console.error(`Failed to create customer ${customer.email}:`, error);
      }
    }
    
    return results;
  }

  /**
   * Email validation helper
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

/**
 * Example usage functions
 */

/**
 * Basic API usage example
 */
async function basicExample(): Promise<void> {
  console.log('=== Basic TypeScript API Example ===\n');
  
  const client = new ApiClient();
  
  try {
    // Create customer
    const newCustomer = await client.createCustomer(sampleCustomer);
    const customerId = newCustomer.id;
    
    // Get all customers
    await client.getAllCustomers();
    
    // Update customer
    const updatedData: Customer = {
      ...sampleCustomer,
      name: 'John Doe Updated'
    };
    await client.updateCustomer(customerId, updatedData);
    
    // Delete customer
    await client.deleteCustomer(customerId);
    
    console.log('\n=== Basic example completed! ===');
  } catch (error) {
    console.error('Basic example failed:', error);
  }
}

/**
 * Advanced service example with business logic
 */
async function advancedExample(): Promise<void> {
  console.log('\n=== Advanced TypeScript Service Example ===\n');
  
  const service = new CustomerService(false); // Use native HTTP client
  
  try {
    // Create multiple customers
    const customersToCreate: Customer[] = [
      { name: 'Alice Smith', email: 'alice@example.com', active: true },
      { name: 'Bob Johnson', email: 'bob@example.com', active: false },
      { name: 'Charlie Brown', email: 'charlie@example.com', active: true }
    ];
    
    console.log('Creating multiple customers...');
    const createdCustomers = await service.createMultipleCustomers(customersToCreate);
    
    // Get only active customers
    console.log('\nFetching active customers...');
    const activeCustomers = await service.getCustomers(true);
    console.log('Active customers:', activeCustomers);
    
    // Partial update
    if (createdCustomers.length > 0) {
      console.log('\nPerforming partial update...');
      const customerId = createdCustomers[0].id;
      await service.updateCustomer(customerId, { active: false });
    }
    
    console.log('\n=== Advanced example completed! ===');
  } catch (error) {
    console.error('Advanced example failed:', error);
  }
}

/**
 * Error handling example
 */
async function errorHandlingExample(): Promise<void> {
  console.log('\n=== Error Handling Example ===\n');
  
  const client = new ApiClient();
  
  try {
    // Try to get non-existent customer
    await client.getCustomerById(99999);
  } catch (error: any) {
    console.log('Expected error for non-existent customer:', error.message);
  }
  
  try {
    // Try to create customer with invalid data
    const invalidCustomer: Customer = {
      name: '',
      email: 'invalid-email',
      active: true
    };
    await client.createCustomer(invalidCustomer);
  } catch (error: any) {
    console.log('Expected error for invalid customer:', error.message);
  }
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    await basicExample();
    await advancedExample();
    await errorHandlingExample();
  } catch (error) {
    console.error('Main execution failed:', error);
  }
}

// Export classes and functions
export {
  Customer,
  CustomerResponse,
  ApiClient,
  AxiosApiClient,
  CustomerService,
  basicExample,
  advancedExample,
  errorHandlingExample,
  main
};

// Run main function if this file is executed directly
if (typeof require !== 'undefined' && require.main === module) {
  main();
}
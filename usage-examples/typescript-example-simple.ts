/**
 * Node.js Express MySQL REST API - Simple TypeScript Usage Example
 * 
 * This example demonstrates how to interact with the customer REST API
 * using TypeScript with proper type definitions.
 * 
 * To run: npx tsc typescript-example-simple.ts && node typescript-example-simple.js
 */

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

// Configuration
const API_BASE_URL = 'http://localhost:3000';

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
  private http: any;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Use dynamic require to avoid TypeScript compilation issues
    this.http = (globalThis as any).require ? (globalThis as any).require('http') : null;
    if (!this.http) {
      throw new Error('HTTP module not available');
    }
  }

  /**
   * Generic HTTP request method
   */
  private async makeRequest<T>(
    path: string,
    method: string = 'GET',
    data?: any
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve, reject) => {
      const options: any = {
        hostname: 'localhost',
        port: 3000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      const req = this.http.request(options, (res: any) => {
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
}

/**
 * Service class with business logic and validation
 */
class CustomerService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient();
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
  
  const service = new CustomerService();
  
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
 * Type demonstration
 */
function typeExample(): void {
  console.log('\n=== TypeScript Type Safety Example ===\n');
  
  // Valid customer object
  const validCustomer: Customer = {
    name: 'Test User',
    email: 'test@example.com',
    active: true
  };
  
  console.log('Valid customer:', validCustomer);
  
  // TypeScript will catch these errors at compile time:
  
  // Error: missing required properties
  // const invalidCustomer1: Customer = { name: 'Test' };
  
  // Error: wrong type for active property
  // const invalidCustomer2: Customer = { 
  //   name: 'Test', 
  //   email: 'test@example.com', 
  //   active: 'yes' 
  // };
  
  // Error: extra property not in interface
  // const invalidCustomer3: Customer = { 
  //   name: 'Test', 
  //   email: 'test@example.com', 
  //   active: true,
  //   age: 25
  // };
  
  console.log('TypeScript provides compile-time type checking!');
}

/**
 * Main execution function
 */
async function main(): Promise<void> {
  try {
    typeExample();
    
    // Note: The following examples require the API server to be running
    console.log('\nNote: Make sure the API server is running on localhost:3000');
    console.log('To run the API examples, uncomment the lines below:\n');
    
    // await basicExample();
    // await advancedExample();
    
  } catch (error) {
    console.error('Main execution failed:', error);
  }
}

// Export for use as module
export {
  Customer,
  CustomerResponse,
  ApiClient,
  CustomerService,
  basicExample,
  advancedExample,
  main
};

// Run main function if this file is executed directly
declare const globalThis: any;
declare const require: any;
declare const module: any;

if (typeof require !== 'undefined' && require.main === module) {
  main();
}
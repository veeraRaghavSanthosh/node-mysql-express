/**
 * Node.js Express MySQL API - TypeScript Usage Examples
 * 
 * This example demonstrates how to interact with the Customer API
 * using TypeScript with proper type definitions and interfaces.
 */

import axios, { AxiosResponse } from 'axios';

// Base URL for the API (adjust according to your server configuration)
const API_BASE_URL: string = 'http://localhost:3000';

/**
 * Customer interface defining the structure of a customer object
 */
interface Customer {
  id?: number;
  name: string;
  email: string;
  active: boolean;
}

/**
 * API Response types
 */
interface ApiResponse<T> {
  data: T;
  status: number;
}

interface ErrorResponse {
  message: string;
}

/**
 * Customer service class with typed methods
 */
class CustomerService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Create a new customer
   */
  async createCustomer(customerData: Omit<Customer, 'id'>): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await axios.post(
        `${this.baseUrl}/customers`,
        customerData
      );
      console.log('Customer created:', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error('Error creating customer:', errorMessage);
      throw new Error(`Failed to create customer: ${errorMessage}`);
    }
  }

  /**
   * Get all customers
   */
  async getAllCustomers(): Promise<Customer[]> {
    try {
      const response: AxiosResponse<Customer[]> = await axios.get(
        `${this.baseUrl}/customers`
      );
      console.log('All customers:', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error('Error fetching customers:', errorMessage);
      throw new Error(`Failed to fetch customers: ${errorMessage}`);
    }
  }

  /**
   * Get a specific customer by ID
   */
  async getCustomerById(customerId: number): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await axios.get(
        `${this.baseUrl}/customers/${customerId}`
      );
      console.log('Customer found:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }
      const errorMessage = error.response?.data?.message || error.message;
      console.error('Error fetching customer:', errorMessage);
      throw new Error(`Failed to fetch customer: ${errorMessage}`);
    }
  }

  /**
   * Update a customer
   */
  async updateCustomer(
    customerId: number,
    updatedData: Partial<Omit<Customer, 'id'>>
  ): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await axios.put(
        `${this.baseUrl}/customers/${customerId}`,
        updatedData
      );
      console.log('Customer updated:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }
      const errorMessage = error.response?.data?.message || error.message;
      console.error('Error updating customer:', errorMessage);
      throw new Error(`Failed to update customer: ${errorMessage}`);
    }
  }

  /**
   * Delete a customer
   */
  async deleteCustomer(customerId: number): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.delete(
        `${this.baseUrl}/customers/${customerId}`
      );
      console.log('Customer deleted:', response.data);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }
      const errorMessage = error.response?.data?.message || error.message;
      console.error('Error deleting customer:', errorMessage);
      throw new Error(`Failed to delete customer: ${errorMessage}`);
    }
  }

  /**
   * Delete all customers
   */
  async deleteAllCustomers(): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.delete(
        `${this.baseUrl}/customers`
      );
      console.log('All customers deleted:', response.data);
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message;
      console.error('Error deleting all customers:', errorMessage);
      throw new Error(`Failed to delete all customers: ${errorMessage}`);
    }
  }
}

/**
 * Example usage demonstrating complete CRUD operations with TypeScript
 */
async function demonstrateTypedUsage(): Promise<void> {
  const customerService = new CustomerService();
  
  try {
    console.log('=== TypeScript Node.js Express MySQL API Demo ===\n');

    // Sample customer data with proper typing
    const sampleCustomer: Omit<Customer, 'id'> = {
      name: "Alice Johnson",
      email: "alice.johnson@example.com",
      active: true
    };

    // 1. Create a new customer
    console.log('1. Creating a new customer...');
    const newCustomer: Customer = await customerService.createCustomer(sampleCustomer);
    const customerId: number = newCustomer.id!;
    console.log('');

    // 2. Get all customers
    console.log('2. Fetching all customers...');
    const allCustomers: Customer[] = await customerService.getAllCustomers();
    console.log(`Found ${allCustomers.length} customers`);
    console.log('');

    // 3. Get specific customer
    console.log('3. Fetching customer by ID...');
    const foundCustomer: Customer = await customerService.getCustomerById(customerId);
    console.log('');

    // 4. Update customer with partial data
    console.log('4. Updating customer...');
    const updateData: Partial<Omit<Customer, 'id'>> = {
      name: "Alice Smith",
      active: false
    };
    const updatedCustomer: Customer = await customerService.updateCustomer(customerId, updateData);
    console.log('');

    // 5. Verify update
    console.log('5. Verifying update...');
    await customerService.getCustomerById(customerId);
    console.log('');

    // 6. Delete specific customer
    console.log('6. Deleting customer...');
    const deleteResult = await customerService.deleteCustomer(customerId);
    console.log('');

    // 7. Try to get deleted customer (should throw error)
    console.log('7. Trying to fetch deleted customer...');
    try {
      await customerService.getCustomerById(customerId);
    } catch (error) {
      console.log('Expected error:', (error as Error).message);
      console.log('');
    }

    console.log('=== TypeScript Demo completed successfully ===');

  } catch (error) {
    console.error('Demo failed:', (error as Error).message);
  }
}

/**
 * Alternative implementation using native fetch with TypeScript
 */
class FetchCustomerService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(`HTTP ${response.status}: ${errorData.message}`);
    }
    return response.json();
  }

  async createCustomer(customerData: Omit<Customer, 'id'>): Promise<Customer> {
    const response = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });

    return this.handleResponse<Customer>(response);
  }

  async getAllCustomers(): Promise<Customer[]> {
    const response = await fetch(`${this.baseUrl}/customers`);
    return this.handleResponse<Customer[]>(response);
  }

  async getCustomerById(customerId: number): Promise<Customer> {
    const response = await fetch(`${this.baseUrl}/customers/${customerId}`);
    return this.handleResponse<Customer>(response);
  }

  async updateCustomer(
    customerId: number,
    updatedData: Partial<Omit<Customer, 'id'>>
  ): Promise<Customer> {
    const response = await fetch(`${this.baseUrl}/customers/${customerId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedData),
    });

    return this.handleResponse<Customer>(response);
  }

  async deleteCustomer(customerId: number): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/customers/${customerId}`, {
      method: 'DELETE',
    });

    return this.handleResponse<{ message: string }>(response);
  }
}

/**
 * Generic API client with proper error handling
 */
class ApiClient<T> {
  constructor(private baseUrl: string, private endpoint: string) {}

  async create(data: Omit<T, 'id'>): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${this.endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create: ${response.statusText}`);
    }

    return response.json();
  }

  async getAll(): Promise<T[]> {
    const response = await fetch(`${this.baseUrl}/${this.endpoint}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    return response.json();
  }

  async getById(id: number): Promise<T> {
    const response = await fetch(`${this.baseUrl}/${this.endpoint}/${id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch by ID: ${response.statusText}`);
    }

    return response.json();
  }
}

// Usage example with generic client
const customerApi = new ApiClient<Customer>(API_BASE_URL, 'customers');

// Export classes and functions
export {
  Customer,
  CustomerService,
  FetchCustomerService,
  ApiClient,
  demonstrateTypedUsage,
  customerApi
};

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateTypedUsage();
}
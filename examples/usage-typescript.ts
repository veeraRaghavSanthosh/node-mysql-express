/**
 * Node.js Express MySQL REST API - TypeScript Usage Example
 * 
 * This example demonstrates how to use the Customer REST API
 * with proper TypeScript types and interfaces.
 */

import axios, { AxiosResponse } from 'axios'; // npm install axios

// Type definitions
interface Customer {
  id?: number;
  name: string;
  email: string;
  active: boolean;
}

interface CreateCustomerRequest {
  name: string;
  email: string;
  active: boolean;
}

interface UpdateCustomerRequest {
  name?: string;
  email?: string;
  active?: boolean;
}

interface DeleteResponse {
  message: string;
}

interface APIError {
  message: string;
}

// Customer API client with TypeScript types
class CustomerAPIClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  // Create a new customer
  async createCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await axios.post(
        `${this.baseUrl}/customers`,
        customerData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to create customer: ${error.message}`);
    }
  }

  // Get all customers
  async getAllCustomers(): Promise<Customer[]> {
    try {
      const response: AxiosResponse<Customer[]> = await axios.get(
        `${this.baseUrl}/customers`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get customers: ${error.message}`);
    }
  }

  // Get a single customer by ID
  async getCustomerById(customerId: number): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await axios.get(
        `${this.baseUrl}/customers/${customerId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to get customer: ${error.message}`);
    }
  }

  // Update a customer
  async updateCustomer(
    customerId: number,
    customerData: UpdateCustomerRequest
  ): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await axios.put(
        `${this.baseUrl}/customers/${customerId}`,
        customerData
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to update customer: ${error.message}`);
    }
  }

  // Delete a customer
  async deleteCustomer(customerId: number): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await axios.delete(
        `${this.baseUrl}/customers/${customerId}`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to delete customer: ${error.message}`);
    }
  }

  // Delete all customers
  async deleteAllCustomers(): Promise<DeleteResponse> {
    try {
      const response: AxiosResponse<DeleteResponse> = await axios.delete(
        `${this.baseUrl}/customers`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to delete all customers: ${error.message}`);
    }
  }
}

// Alternative implementation using native fetch with TypeScript
class CustomerAPIClientFetch {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  private async makeRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json() as Promise<T>;
  }

  async createCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
    return this.makeRequest<Customer>(`${this.baseUrl}/customers`, {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  async getAllCustomers(): Promise<Customer[]> {
    return this.makeRequest<Customer[]>(`${this.baseUrl}/customers`);
  }

  async getCustomerById(customerId: number): Promise<Customer> {
    return this.makeRequest<Customer>(`${this.baseUrl}/customers/${customerId}`);
  }

  async updateCustomer(
    customerId: number,
    customerData: UpdateCustomerRequest
  ): Promise<Customer> {
    return this.makeRequest<Customer>(`${this.baseUrl}/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify(customerData),
    });
  }

  async deleteCustomer(customerId: number): Promise<DeleteResponse> {
    return this.makeRequest<DeleteResponse>(`${this.baseUrl}/customers/${customerId}`, {
      method: 'DELETE',
    });
  }

  async deleteAllCustomers(): Promise<DeleteResponse> {
    return this.makeRequest<DeleteResponse>(`${this.baseUrl}/customers`, {
      method: 'DELETE',
    });
  }
}

// Usage examples with proper TypeScript typing
async function demonstrateAPI(): Promise<void> {
  const client = new CustomerAPIClient();

  try {
    console.log('=== Customer API TypeScript Demo ===\n');

    // 1. Create a new customer with type safety
    console.log('1. Creating a new customer...');
    const newCustomer: CreateCustomerRequest = {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      active: true,
    };
    
    const createdCustomer: Customer = await client.createCustomer(newCustomer);
    console.log('Created customer:', createdCustomer);
    
    if (!createdCustomer.id) {
      throw new Error('Customer ID is required for further operations');
    }
    
    const customerId: number = createdCustomer.id;

    // 2. Get all customers
    console.log('\n2. Getting all customers...');
    const allCustomers: Customer[] = await client.getAllCustomers();
    console.log('All customers:', allCustomers);

    // 3. Get specific customer
    console.log('\n3. Getting customer by ID...');
    const customer: Customer = await client.getCustomerById(customerId);
    console.log('Customer:', customer);

    // 4. Update customer with partial data
    console.log('\n4. Updating customer...');
    const updatedData: UpdateCustomerRequest = {
      name: 'Jane Smith',
      email: 'jane.smith@example.com',
      active: false,
    };
    
    const updatedCustomer: Customer = await client.updateCustomer(
      customerId,
      updatedData
    );
    console.log('Updated customer:', updatedCustomer);

    // 5. Delete customer
    console.log('\n5. Deleting customer...');
    const deleteResult: DeleteResponse = await client.deleteCustomer(customerId);
    console.log('Delete result:', deleteResult);

    console.log('\n=== TypeScript Demo completed successfully! ===');

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Error during API demo:', error.message);
    } else {
      console.error('Unknown error during API demo:', error);
    }
  }
}

// Advanced usage with error handling and validation
class AdvancedCustomerService {
  private client: CustomerAPIClient;

  constructor(baseUrl?: string) {
    this.client = new CustomerAPIClient(baseUrl);
  }

  // Validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Create customer with validation
  async createCustomerSafe(customerData: CreateCustomerRequest): Promise<Customer> {
    if (!customerData.name || customerData.name.trim().length === 0) {
      throw new Error('Customer name is required');
    }

    if (!this.isValidEmail(customerData.email)) {
      throw new Error('Invalid email format');
    }

    return this.client.createCustomer(customerData);
  }

  // Get customer with existence check
  async getCustomerSafe(customerId: number): Promise<Customer | null> {
    try {
      return await this.client.getCustomerById(customerId);
    } catch (error) {
      if (error instanceof Error && error.message.includes('not found')) {
        return null;
      }
      throw error;
    }
  }

  // Update customer with validation
  async updateCustomerSafe(
    customerId: number,
    updates: UpdateCustomerRequest
  ): Promise<Customer> {
    if (updates.email && !this.isValidEmail(updates.email)) {
      throw new Error('Invalid email format');
    }

    if (updates.name !== undefined && updates.name.trim().length === 0) {
      throw new Error('Customer name cannot be empty');
    }

    return this.client.updateCustomer(customerId, updates);
  }
}

// Export types and classes
export {
  Customer,
  CreateCustomerRequest,
  UpdateCustomerRequest,
  DeleteResponse,
  CustomerAPIClient,
  CustomerAPIClientFetch,
  AdvancedCustomerService,
};

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateAPI();
}
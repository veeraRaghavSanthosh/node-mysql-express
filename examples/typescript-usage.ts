/**
 * TypeScript Usage Example for Node.js Express MySQL REST API
 * 
 * This example demonstrates how to use the Customer API endpoints
 * with proper TypeScript types and error handling.
 */

import axios, { AxiosResponse } from 'axios';

// Type definitions for the Customer model
interface Customer {
  id?: number;
  email: string;
  name: string;
  active: boolean;
}

interface CustomerResponse {
  id: number;
  email: string;
  name: string;
  active: boolean;
}

interface ErrorResponse {
  message: string;
}

class CustomerAPIClient {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  /**
   * Create a new customer
   */
  async createCustomer(customer: Customer): Promise<CustomerResponse> {
    try {
      const response: AxiosResponse<CustomerResponse> = await axios.post(
        `${this.baseURL}/customers`,
        customer
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to create customer: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get all customers
   */
  async getAllCustomers(): Promise<CustomerResponse[]> {
    try {
      const response: AxiosResponse<CustomerResponse[]> = await axios.get(
        `${this.baseURL}/customers`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to fetch customers: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Get a customer by ID
   */
  async getCustomerById(customerId: number): Promise<CustomerResponse> {
    try {
      const response: AxiosResponse<CustomerResponse> = await axios.get(
        `${this.baseURL}/customers/${customerId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }
      throw new Error(`Failed to fetch customer: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Update a customer by ID
   */
  async updateCustomer(customerId: number, customer: Customer): Promise<CustomerResponse> {
    try {
      const response: AxiosResponse<CustomerResponse> = await axios.put(
        `${this.baseURL}/customers/${customerId}`,
        customer
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }
      throw new Error(`Failed to update customer: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Delete a customer by ID
   */
  async deleteCustomer(customerId: number): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.delete(
        `${this.baseURL}/customers/${customerId}`
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error(`Customer with ID ${customerId} not found`);
      }
      throw new Error(`Failed to delete customer: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Delete all customers
   */
  async deleteAllCustomers(): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.delete(
        `${this.baseURL}/customers`
      );
      return response.data;
    } catch (error: any) {
      throw new Error(`Failed to delete all customers: ${error.response?.data?.message || error.message}`);
    }
  }
}

// Usage example
async function main(): Promise<void> {
  const apiClient = new CustomerAPIClient('http://localhost:3000');

  try {
    // Create a new customer
    const newCustomer: Customer = {
      email: 'john.doe@example.com',
      name: 'John Doe',
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
    const updatedCustomerData: Customer = {
      email: 'john.updated@example.com',
      name: 'John Updated',
      active: false
    };
    const updatedCustomer = await apiClient.updateCustomer(createdCustomer.id, updatedCustomerData);
    console.log('Updated customer:', updatedCustomer);

    // Delete customer
    console.log(`\nDeleting customer with ID ${createdCustomer.id}...`);
    const deleteResult = await apiClient.deleteCustomer(createdCustomer.id);
    console.log('Delete result:', deleteResult);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : error);
  }
}

// Advanced usage with middleware simulation
class CustomerService {
  private apiClient: CustomerAPIClient;

  constructor(apiClient: CustomerAPIClient) {
    this.apiClient = apiClient;
  }

  /**
   * Bulk create customers with validation
   */
  async bulkCreateCustomers(customers: Customer[]): Promise<CustomerResponse[]> {
    const results: CustomerResponse[] = [];
    
    for (const customer of customers) {
      // Validate email format
      if (!this.isValidEmail(customer.email)) {
        throw new Error(`Invalid email format: ${customer.email}`);
      }

      try {
        const created = await this.apiClient.createCustomer(customer);
        results.push(created);
      } catch (error) {
        console.error(`Failed to create customer ${customer.name}:`, error);
        throw error;
      }
    }

    return results;
  }

  /**
   * Get active customers only
   */
  async getActiveCustomers(): Promise<CustomerResponse[]> {
    const allCustomers = await this.apiClient.getAllCustomers();
    return allCustomers.filter(customer => customer.active);
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Export for use in other modules
export {
  Customer,
  CustomerResponse,
  CustomerAPIClient,
  CustomerService
};

// Run the example if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}
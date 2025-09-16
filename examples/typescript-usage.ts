import axios, { AxiosResponse } from 'axios';

// Types for the Customer API
interface Customer {
  id?: number;
  name: string;
  email: string;
  active: boolean;
}

interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
}

class CustomerApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Create a new customer
   * @param customer - Customer data without ID
   * @returns Promise with created customer data
   */
  async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await axios.post(
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
      throw new Error(`Failed to create customer: ${error}`);
    }
  }

  /**
   * Get all customers
   * @returns Promise with array of customers
   */
  async getAllCustomers(): Promise<Customer[]> {
    try {
      const response: AxiosResponse<Customer[]> = await axios.get(
        `${this.baseUrl}/customers`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch customers: ${error}`);
    }
  }

  /**
   * Get a single customer by ID
   * @param id - Customer ID
   * @returns Promise with customer data
   */
  async getCustomerById(id: number): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await axios.get(
        `${this.baseUrl}/customers/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch customer with ID ${id}: ${error}`);
    }
  }

  /**
   * Update a customer
   * @param id - Customer ID
   * @param customer - Updated customer data
   * @returns Promise with updated customer data
   */
  async updateCustomer(id: number, customer: Partial<Customer>): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await axios.put(
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
      throw new Error(`Failed to update customer with ID ${id}: ${error}`);
    }
  }

  /**
   * Delete a customer
   * @param id - Customer ID
   * @returns Promise with deletion confirmation
   */
  async deleteCustomer(id: number): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.delete(
        `${this.baseUrl}/customers/${id}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete customer with ID ${id}: ${error}`);
    }
  }

  /**
   * Delete all customers
   * @returns Promise with deletion confirmation
   */
  async deleteAllCustomers(): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.delete(
        `${this.baseUrl}/customers`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to delete all customers: ${error}`);
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
      name: 'John Doe',
      email: 'john.doe@example.com',
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
        name: 'John Smith',
        email: 'john.smith@example.com',
      });
      console.log('Updated customer:', updatedCustomer);

      // Delete customer
      console.log(`\nDeleting customer with ID ${newCustomer.id}...`);
      const deleteResult = await apiClient.deleteCustomer(newCustomer.id);
      console.log('Delete result:', deleteResult);
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example
if (require.main === module) {
  main();
}

export { CustomerApiClient, Customer };
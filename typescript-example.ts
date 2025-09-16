import axios, { AxiosResponse } from 'axios';

// Define the Customer interface
interface Customer {
  id?: number;
  email: string;
  name: string;
  active: boolean;
}

// API response interface
interface ApiResponse<T> {
  data: T;
  status: number;
}

class CustomerAPI {
  private baseURL: string;

  constructor(baseURL: string = 'http://localhost:3000') {
    this.baseURL = baseURL;
  }

  // Create a new customer
  async createCustomer(customer: Omit<Customer, 'id'>): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await axios.post(
        `${this.baseURL}/customers`,
        customer
      );
      return response.data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  }

  // Get all customers
  async getAllCustomers(): Promise<Customer[]> {
    try {
      const response: AxiosResponse<Customer[]> = await axios.get(
        `${this.baseURL}/customers`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching customers:', error);
      throw error;
    }
  }

  // Get a specific customer by ID
  async getCustomerById(customerId: number): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await axios.get(
        `${this.baseURL}/customers/${customerId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  // Update a customer
  async updateCustomer(customerId: number, customer: Omit<Customer, 'id'>): Promise<Customer> {
    try {
      const response: AxiosResponse<Customer> = await axios.put(
        `${this.baseURL}/customers/${customerId}`,
        customer
      );
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Delete a customer
  async deleteCustomer(customerId: number): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.delete(
        `${this.baseURL}/customers/${customerId}`
      );
      return response.data;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  }

  // Delete all customers
  async deleteAllCustomers(): Promise<{ message: string }> {
    try {
      const response: AxiosResponse<{ message: string }> = await axios.delete(
        `${this.baseURL}/customers`
      );
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
      email: 'john.doe@example.com',
      name: 'John Doe',
      active: true
    });
    console.log('Created customer:', newCustomer);

    // Get all customers
    const customers = await api.getAllCustomers();
    console.log('All customers:', customers);

    // Get a specific customer
    const customer = await api.getCustomerById(newCustomer.id!);
    console.log('Retrieved customer:', customer);

    // Update the customer
    const updatedCustomer = await api.updateCustomer(newCustomer.id!, {
      email: 'john.updated@example.com',
      name: 'John Updated',
      active: false
    });
    console.log('Updated customer:', updatedCustomer);

    // Delete the customer
    const deleteResult = await api.deleteCustomer(newCustomer.id!);
    console.log('Delete result:', deleteResult);
  } catch (error) {
    console.error('API operation failed:', error);
  }
}

// Run the example
example();
const Customer = require("../app/models/customer.model.js");
const { promisify } = require('util');

// Promisify the Customer model methods
const createCustomerAsync = promisify(Customer.create.bind(Customer));
const findByIdAsync = promisify(Customer.findById.bind(Customer));
const getAllAsync = promisify(Customer.getAll.bind(Customer));
const updateByIdAsync = promisify(Customer.updateById.bind(Customer));
const removeAsync = promisify(Customer.remove.bind(Customer));
const removeAllAsync = promisify(Customer.removeAll.bind(Customer));

// Test suite for Customer model using async/await pattern
describe("Customer Model Tests", () => {
  
  // Test customer creation with async/await
  test("should create a new customer using async/await", async () => {
    const newCustomer = {
      email: "test@example.com",
      name: "Test User",
      active: true
    };

    try {
      const data = await createCustomerAsync(newCustomer);
      
      expect(data).toBeDefined();
      expect(data.email).toBe(newCustomer.email);
      expect(data.name).toBe(newCustomer.name);
      expect(data.active).toBe(newCustomer.active);
      expect(data.id).toBeDefined();
    } catch (err) {
      throw err;
    }
  });

  // Test finding customer by ID with async/await
  test("should find customer by ID using async/await", async () => {
    const testCustomerId = 1;
    
    try {
      const data = await findByIdAsync(testCustomerId);
      
      expect(data).toBeDefined();
      expect(data.id).toBe(testCustomerId);
    } catch (err) {
      if (err.kind === "not_found") {
        // This is acceptable if no customer exists
        return;
      }
      throw err;
    }
  });

  // Test getting all customers with async/await
  test("should get all customers using async/await", async () => {
    try {
      const data = await getAllAsync();
      
      expect(Array.isArray(data)).toBe(true);
    } catch (err) {
      throw err;
    }
  });

  // Test updating customer with async/await
  test("should update customer using async/await", async () => {
    const customerId = 1;
    const updatedCustomer = {
      email: "updated@example.com",
      name: "Updated User",
      active: false
    };

    try {
      const data = await updateByIdAsync(customerId, updatedCustomer);
      
      expect(data).toBeDefined();
      expect(data.email).toBe(updatedCustomer.email);
      expect(data.name).toBe(updatedCustomer.name);
      expect(data.active).toBe(updatedCustomer.active);
    } catch (err) {
      if (err.kind === "not_found") {
        // This is acceptable if no customer exists
        return;
      }
      throw err;
    }
  });

  // Test deleting customer with async/await
  test("should delete customer using async/await", async () => {
    const customerId = 1;
    
    try {
      const data = await removeAsync(customerId);
      
      expect(data).toBeDefined();
      expect(data.message).toContain("deleted");
    } catch (err) {
      if (err.kind === "not_found") {
        // This is acceptable if no customer exists
        return;
      }
      throw err;
    }
  });

  // Test deleting all customers with async/await
  test("should delete all customers using async/await", async () => {
    try {
      const data = await removeAllAsync();
      
      expect(data).toBeDefined();
      expect(data.message).toContain("deleted");
    } catch (err) {
      throw err;
    }
  });

});
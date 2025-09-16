const OrderProcessor = require('../app/models/orderProcessor');
const mysql = require('mysql');

// Mock the database connection
jest.mock('../app/models/db.js', () => ({
  query: jest.fn()
}));

const mockDb = require('../app/models/db.js');

describe('OrderProcessor', () => {
  let processor;
  
  beforeEach(() => {
    processor = new OrderProcessor();
    jest.clearAllMocks();
  });

  // This is the flaky test
  describe('orderProcessor_should_handle_zero_items', () => {
    it('should handle zero items correctly', async () => {
      // This test is flaky due to several issues:
      // 1. Race conditions with database queries
      // 2. Non-deterministic timing with setTimeout
      // 3. Date.now() generating different IDs
      // 4. Async operations without proper synchronization
      
      const orderData = {
        customerId: 123,
        items: []
      };

      // Mock database to return 0 existing orders (new customer)
      mockDb.query.mockImplementation((query, params, callback) => {
        // Simulate database delay - this can cause race conditions
        setTimeout(() => {
          callback(null, [{ count: 0 }]);
        }, Math.random() * 50); // Random delay makes test flaky
      });

      // Execute the test multiple times to show flakiness
      const results = [];
      for (let i = 0; i < 3; i++) {
        const result = await processor.processOrder(orderData);
        results.push(result);
      }

      // These assertions often fail due to timing issues
      expect(results[0].status).toBe('welcome');
      expect(results[0].id).toBeDefined();
      expect(results[0].customerId).toBe(123);
      expect(results[0].items).toEqual([]);
      
      // This assertion is flaky because Date.now() creates different IDs
      expect(results[0].id).toBe(results[1].id); // This will fail!
      
      // This assertion is flaky due to race conditions
      expect(results.length).toBe(3);
    });

    it('should reject empty orders for existing customers', async () => {
      const orderData = {
        customerId: 456,
        items: []
      };

      // Mock database to return existing orders
      mockDb.query.mockImplementation((query, params, callback) => {
        // Another source of flakiness - inconsistent mock behavior
        const existingOrderCount = Math.random() > 0.5 ? 1 : 0; // Random behavior!
        setTimeout(() => {
          callback(null, [{ count: existingOrderCount }]);
        }, Math.random() * 30);
      });

      const result = await processor.processOrder(orderData);
      
      // This assertion is flaky because mock returns random values
      expect(result.status).toBe('rejected'); // Sometimes passes, sometimes fails
      expect(result.reason).toBe('Empty order not allowed for existing customer');
    });
  });

  describe('processOrder with items', () => {
    it('should process orders with items', async () => {
      const orderData = {
        customerId: 789,
        items: [
          { id: 1, name: 'Item 1', price: 10, quantity: 2 },
          { id: 2, name: 'Item 2', price: 5, quantity: 1 }
        ]
      };

      const result = await processor.processOrder(orderData);
      
      expect(result.status).toBe('processed');
      expect(result.total).toBe(25);
      expect(result.items).toEqual(orderData.items);
    });
  });
});
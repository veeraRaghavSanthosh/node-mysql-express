/**
 * Test Suite for OrderProcessor
 * 
 * This test suite specifically addresses the flaky test issue:
 * `orderProcessor_should_handle_zero_items`
 * 
 * Key improvements for deterministic behavior:
 * 1. Fixed timestamps to eliminate time-based flakiness
 * 2. Proper test isolation with beforeEach/afterEach
 * 3. Deterministic processing IDs
 * 4. Controlled date mocking
 * 5. Deep equality comparisons
 */

const OrderProcessor = require('../app/services/orderProcessor');

describe('OrderProcessor', () => {
  let orderProcessor;

  beforeEach(() => {
    // Create a fresh instance for each test to ensure complete isolation
    orderProcessor = new OrderProcessor();
  });

  afterEach(() => {
    // Clean up after each test to prevent state pollution
    if (orderProcessor && orderProcessor.clearHistory) {
      orderProcessor.clearHistory();
    }
    
    // Restore any mocked functions (Jest handles this automatically in most cases)
    jest.restoreAllMocks();
  });

  // ============================================================================
  // MAIN FLAKY TEST FIX: orderProcessor_should_handle_zero_items
  // ============================================================================
  describe('orderProcessor_should_handle_zero_items', () => {
    
    it('should handle zero items deterministically with fixed timestamp', async () => {
      // DETERMINISM FIX #1: Use fixed timestamp for predictable results
      const fixedTimestamp = '2023-01-01T00:00:00.000Z';
      const options = { 
        timestamp: fixedTimestamp,
        processingId: 1 // Fixed processing ID for determinism
      };

      // Test with empty array
      const result = await orderProcessor.processOrder([], options);

      // Comprehensive assertions for deterministic behavior
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.itemCount).toBe(0);
      expect(result.processedItems).toEqual([]);
      expect(result.totalAmount).toBe(0);
      expect(result.message).toBe('No items to process');
      expect(result.processedAt).toBe(fixedTimestamp);
      expect(result.processingId).toBe(1);

      // Verify the result is added to processing history
      const history = orderProcessor.getProcessingHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(result);
    });

    it('should handle zero items with mocked Date for system timestamp', async () => {
      // DETERMINISM FIX #2: Mock Date constructor for predictable system timestamps
      const mockTimestamp = '2023-01-01T00:00:00.000Z';
      const originalDate = global.Date;
      
      // Create a simple mock that returns our fixed timestamp
      global.Date = class extends originalDate {
        constructor(...args) {
          if (args.length === 0) {
            super('2023-01-01T00:00:00.000Z');
          } else {
            super(...args);
          }
        }
        
        toISOString() {
          return mockTimestamp;
        }
        
        static now() {
          return new originalDate('2023-01-01T00:00:00.000Z').getTime();
        }
      };

      try {
        const options = { processingId: 2 }; // Fixed processing ID
        const result = await orderProcessor.processOrder([], options);

        expect(result.success).toBe(true);
        expect(result.itemCount).toBe(0);
        expect(result.processedItems).toEqual([]);
        expect(result.totalAmount).toBe(0);
        expect(result.message).toBe('No items to process');
        expect(result.processedAt).toBe('2023-01-01T00:00:00.000Z');
        expect(result.processingId).toBe(2);
      } finally {
        // DETERMINISM FIX #3: Always restore original Date to prevent test pollution
        global.Date = originalDate;
      }
    });

    it('should handle multiple zero item calls consistently', async () => {
      // DETERMINISM FIX #4: Test multiple calls with same parameters produce identical results
      const fixedTimestamp = '2023-01-01T00:00:00.000Z';
      const options1 = { timestamp: fixedTimestamp, processingId: 10 };
      const options2 = { timestamp: fixedTimestamp, processingId: 11 };
      const options3 = { timestamp: fixedTimestamp, processingId: 12 };

      // Process multiple empty orders
      const result1 = await orderProcessor.processOrder([], options1);
      const result2 = await orderProcessor.processOrder([], options2);
      const result3 = await orderProcessor.processOrder([], options3);

      // All results should have same structure (except processingId)
      expect(result1.success).toBe(result2.success);
      expect(result1.itemCount).toBe(result2.itemCount);
      expect(result1.totalAmount).toBe(result2.totalAmount);
      expect(result1.processedAt).toBe(result2.processedAt);
      expect(result1.message).toBe(result2.message);
      
      // Processing IDs should be different but deterministic
      expect(result1.processingId).toBe(10);
      expect(result2.processingId).toBe(11);
      expect(result3.processingId).toBe(12);

      // History should contain all three results
      const history = orderProcessor.getProcessingHistory();
      expect(history).toHaveLength(3);
      
      history.forEach((result, index) => {
        expect(result.success).toBe(true);
        expect(result.itemCount).toBe(0);
        expect(result.totalAmount).toBe(0);
        expect(result.processedAt).toBe(fixedTimestamp);
        expect(result.processingId).toBe(10 + index);
      });
    });

    it('should handle zero items with auto-incrementing processing IDs deterministically', async () => {
      // DETERMINISM FIX #5: Test auto-incrementing behavior is predictable
      const fixedTimestamp = '2023-01-01T00:00:00.000Z';
      const options = { timestamp: fixedTimestamp };

      // Process without explicit processingId - should auto-increment
      const result1 = await orderProcessor.processOrder([], options);
      const result2 = await orderProcessor.processOrder([], options);
      const result3 = await orderProcessor.processOrder([], options);

      // Processing IDs should increment predictably
      expect(result1.processingId).toBe(1);
      expect(result2.processingId).toBe(2);
      expect(result3.processingId).toBe(3);
      
      // All other fields should be identical
      ['success', 'itemCount', 'totalAmount', 'processedAt', 'message'].forEach(field => {
        expect(result1[field]).toBe(result2[field]);
        expect(result2[field]).toBe(result3[field]);
      });
    });

    it('should produce identical results when called with same parameters', async () => {
      // DETERMINISM FIX #6: Ensure pure function behavior
      const fixedTimestamp = '2023-01-01T00:00:00.000Z';
      const options = { timestamp: fixedTimestamp, processingId: 100 };

      const result1 = await orderProcessor.processOrder([], options);
      
      // Clear history and create new processor to test true determinism
      orderProcessor.clearHistory();
      const newProcessor = new OrderProcessor();
      const result2 = await newProcessor.processOrder([], options);

      // Results should be identical (except they're in different processors)
      expect(result1).toEqual(result2);
    });
  });

  // ============================================================================
  // SUPPORTING TESTS FOR COMPREHENSIVE COVERAGE
  // ============================================================================
  
  describe('processOrder with items', () => {
    it('should process items correctly with deterministic behavior', async () => {
      const fixedTimestamp = '2023-01-01T00:00:00.000Z';
      const options = { timestamp: fixedTimestamp, processingId: 50 };

      const items = [
        { id: 1, name: 'Item 1', price: 10.00, quantity: 2 },
        { id: 2, name: 'Item 2', price: 5.50, quantity: 1 }
      ];

      const result = await orderProcessor.processOrder(items, options);

      expect(result.success).toBe(true);
      expect(result.itemCount).toBe(2);
      expect(result.processedItems).toHaveLength(2);
      expect(result.totalAmount).toBe(25.50); // (10.00 * 2) + (5.50 * 1)
      expect(result.processedAt).toBe(fixedTimestamp);
      expect(result.processingId).toBe(50);

      // Verify processed items have correct structure
      result.processedItems.forEach((item, index) => {
        expect(item.processedAt).toBe(fixedTimestamp);
        expect(item.index).toBe(index);
        expect(item.processingId).toBe(50);
      });
    });

    it('should handle invalid input gracefully', async () => {
      await expect(orderProcessor.processOrder('not an array'))
        .rejects.toThrow('Items must be an array');
    });

    it('should handle items with invalid data', async () => {
      const invalidItems = [
        { name: 'Item 1', price: 10.00, quantity: 2 } // missing id
      ];

      await expect(orderProcessor.processOrder(invalidItems))
        .rejects.toThrow('Invalid items: Item at index 0 missing id');
    });
  });

  describe('validateItems', () => {
    it('should validate items correctly', () => {
      const validItems = [
        { id: 1, name: 'Item 1', price: 10.00, quantity: 2 },
        { id: 2, name: 'Item 2', price: '5.50', quantity: '1' } // string numbers OK
      ];

      const result = orderProcessor.validateItems(validItems);
      expect(result.valid).toBe(true);
    });

    it('should reject items missing required fields', () => {
      const invalidItems = [
        { name: 'Item 1', price: 10.00, quantity: 2 } // missing id
      ];

      const result = orderProcessor.validateItems(invalidItems);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('missing id');
    });

    it('should reject items with invalid price', () => {
      const invalidItems = [
        { id: 1, name: 'Item 1', price: 'invalid', quantity: 2 }
      ];

      const result = orderProcessor.validateItems(invalidItems);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('invalid price');
    });

    it('should reject items with invalid quantity', () => {
      const invalidItems = [
        { id: 1, name: 'Item 1', price: 10.00, quantity: 'invalid' }
      ];

      const result = orderProcessor.validateItems(invalidItems);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('invalid quantity');
    });

    it('should reject non-array input', () => {
      const result = orderProcessor.validateItems('not an array');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Items must be an array');
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total correctly with deterministic rounding', () => {
      const items = [
        { price: 10.00, quantity: 2 },
        { price: 5.50, quantity: 1 },
        { price: '3.25', quantity: '3' } // string numbers should work
      ];

      const total = orderProcessor.calculateTotal(items);
      expect(total).toBe(35.25); // (10*2) + (5.50*1) + (3.25*3)
    });

    it('should handle items with missing price/quantity deterministically', () => {
      const items = [
        { price: 10.00 }, // missing quantity, should default to 1
        { quantity: 2 }, // missing price, should default to 0
        {} // missing both, should be 0
      ];

      const total = orderProcessor.calculateTotal(items);
      expect(total).toBe(10.00); // (10*1) + (0*2) + (0*1)
    });

    it('should handle floating point precision issues', () => {
      const items = [
        { price: 0.1, quantity: 3 },
        { price: 0.2, quantity: 1 }
      ];

      const total = orderProcessor.calculateTotal(items);
      expect(total).toBe(0.5); // Should be exactly 0.5, not 0.49999999999999994
    });
  });

  describe('processing history', () => {
    it('should maintain processing history deterministically', async () => {
      const fixedTimestamp = '2023-01-01T00:00:00.000Z';
      const options1 = { timestamp: fixedTimestamp, processingId: 1 };
      const options2 = { timestamp: fixedTimestamp, processingId: 2 };

      await orderProcessor.processOrder([], options1);
      await orderProcessor.processOrder([{ id: 1, price: 10, quantity: 1 }], options2);

      const history = orderProcessor.getProcessingHistory();
      expect(history).toHaveLength(2);
      expect(history[0].itemCount).toBe(0);
      expect(history[0].processingId).toBe(1);
      expect(history[1].itemCount).toBe(1);
      expect(history[1].processingId).toBe(2);
    });

    it('should clear history correctly and reset counters', async () => {
      await orderProcessor.processOrder([]);
      expect(orderProcessor.getProcessingHistory()).toHaveLength(1);

      orderProcessor.clearHistory();
      expect(orderProcessor.getProcessingHistory()).toHaveLength(0);
      
      // Processing ID should reset
      const result = await orderProcessor.processOrder([]);
      expect(result.processingId).toBe(1); // Should start from 1 again
    });

    it('should return copies of history to prevent mutation', () => {
      const history1 = orderProcessor.getProcessingHistory();
      const history2 = orderProcessor.getProcessingHistory();
      
      // Should be different objects
      expect(history1).not.toBe(history2);
      expect(history1).toEqual(history2);
    });
  });

  describe('batch processing', () => {
    it('should process batches deterministically', async () => {
      const fixedTimestamp = '2023-01-01T00:00:00.000Z';
      const options = { 
        timestamp: fixedTimestamp,
        startProcessingId: 100
      };

      const batch = [
        [], // zero items
        [{ id: 1, price: 10, quantity: 1 }], // one item
        [] // zero items again
      ];

      const results = await orderProcessor.processBatch(batch, options);
      
      expect(results).toHaveLength(3);
      expect(results[0].itemCount).toBe(0);
      expect(results[0].processingId).toBe(100);
      expect(results[1].itemCount).toBe(1);
      expect(results[1].processingId).toBe(101);
      expect(results[2].itemCount).toBe(0);
      expect(results[2].processingId).toBe(102);
    });
  });

  describe('statistics', () => {
    it('should calculate statistics correctly', async () => {
      const fixedTimestamp = '2023-01-01T00:00:00.000Z';
      
      // Process some orders
      await orderProcessor.processOrder([], { timestamp: fixedTimestamp });
      await orderProcessor.processOrder([{ id: 1, price: 10, quantity: 2 }], { timestamp: fixedTimestamp });
      await orderProcessor.processOrder([], { timestamp: fixedTimestamp });

      const stats = orderProcessor.getStatistics();
      
      expect(stats.totalOrders).toBe(3);
      expect(stats.successfulOrders).toBe(3);
      expect(stats.failedOrders).toBe(0);
      expect(stats.totalItemsProcessed).toBe(1);
      expect(stats.totalAmountProcessed).toBe(20);
      expect(stats.zeroItemOrders).toBe(2);
    });
  });
});
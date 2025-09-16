const OrderProcessor = require('../app/services/orderProcessor');

describe('OrderProcessor', () => {
  let orderProcessor;

  beforeEach(() => {
    // Create a fresh instance for each test to ensure isolation
    orderProcessor = new OrderProcessor();
  });

  afterEach(() => {
    // Clean up after each test
    orderProcessor.clearHistory();
  });

  describe('orderProcessor_should_handle_zero_items', () => {
    it('should handle zero items deterministically', async () => {
      // Use fixed timestamp for deterministic behavior
      const fixedTimestamp = '2023-01-01T00:00:00.000Z';
      const options = { timestamp: fixedTimestamp };

      // Test with empty array
      const result = await orderProcessor.processOrder([], options);

      // Assertions for deterministic behavior
      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.itemCount).toBe(0);
      expect(result.processedItems).toEqual([]);
      expect(result.totalAmount).toBe(0);
      expect(result.message).toBe('No items to process');
      expect(result.processedAt).toBe(fixedTimestamp);

      // Verify the result is added to processing history
      const history = orderProcessor.getProcessingHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toEqual(result);
    });

    it('should handle zero items with default timestamp', async () => {
      // Mock Date.now() for deterministic behavior
      const mockDate = new Date('2023-01-01T00:00:00.000Z');
      const originalDate = global.Date;
      global.Date = jest.fn(() => mockDate);
      global.Date.now = jest.fn(() => mockDate.getTime());
      global.Date.prototype.toISOString = jest.fn(() => mockDate.toISOString());

      try {
        const result = await orderProcessor.processOrder([]);

        expect(result.success).toBe(true);
        expect(result.itemCount).toBe(0);
        expect(result.processedItems).toEqual([]);
        expect(result.totalAmount).toBe(0);
        expect(result.message).toBe('No items to process');
        expect(result.processedAt).toBe('2023-01-01T00:00:00.000Z');
      } finally {
        // Restore original Date
        global.Date = originalDate;
      }
    });

    it('should handle multiple zero item calls consistently', async () => {
      const fixedTimestamp = '2023-01-01T00:00:00.000Z';
      const options = { timestamp: fixedTimestamp };

      // Process multiple empty orders
      const result1 = await orderProcessor.processOrder([], options);
      const result2 = await orderProcessor.processOrder([], options);
      const result3 = await orderProcessor.processOrder([], options);

      // All results should be identical (deterministic)
      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);

      // History should contain all three results
      const history = orderProcessor.getProcessingHistory();
      expect(history).toHaveLength(3);
      history.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.itemCount).toBe(0);
        expect(result.totalAmount).toBe(0);
        expect(result.processedAt).toBe(fixedTimestamp);
      });
    });
  });

  describe('processOrder with items', () => {
    it('should process items correctly', async () => {
      const fixedTimestamp = '2023-01-01T00:00:00.000Z';
      const options = { timestamp: fixedTimestamp };

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

      // Verify processed items have correct structure
      result.processedItems.forEach((item, index) => {
        expect(item.processedAt).toBe(fixedTimestamp);
        expect(item.index).toBe(index);
      });
    });

    it('should handle invalid input gracefully', async () => {
      await expect(orderProcessor.processOrder('not an array')).rejects.toThrow('Items must be an array');
    });
  });

  describe('validateItems', () => {
    it('should validate items correctly', () => {
      const validItems = [
        { id: 1, name: 'Item 1', price: 10.00, quantity: 2 },
        { id: 2, name: 'Item 2', price: '5.50', quantity: '1' }
      ];

      const result = orderProcessor.validateItems(validItems);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid items', () => {
      const invalidItems = [
        { name: 'Item 1', price: 10.00, quantity: 2 } // missing id
      ];

      const result = orderProcessor.validateItems(invalidItems);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('missing id');
    });

    it('should reject non-array input', () => {
      const result = orderProcessor.validateItems('not an array');
      expect(result.valid).toBe(false);
      expect(result.error).toBe('Items must be an array');
    });
  });

  describe('calculateTotal', () => {
    it('should calculate total correctly', () => {
      const items = [
        { price: 10.00, quantity: 2 },
        { price: 5.50, quantity: 1 },
        { price: '3.25', quantity: '3' } // string numbers should work
      ];

      const total = orderProcessor.calculateTotal(items);
      expect(total).toBe(35.25); // (10*2) + (5.50*1) + (3.25*3)
    });

    it('should handle items with missing price/quantity', () => {
      const items = [
        { price: 10.00 }, // missing quantity, should default to 1
        { quantity: 2 }, // missing price, should default to 0
        {} // missing both, should be 0
      ];

      const total = orderProcessor.calculateTotal(items);
      expect(total).toBe(10.00); // (10*1) + (0*2) + (0*1)
    });
  });

  describe('processing history', () => {
    it('should maintain processing history', async () => {
      const fixedTimestamp = '2023-01-01T00:00:00.000Z';
      const options = { timestamp: fixedTimestamp };

      await orderProcessor.processOrder([], options);
      await orderProcessor.processOrder([{ id: 1, price: 10, quantity: 1 }], options);

      const history = orderProcessor.getProcessingHistory();
      expect(history).toHaveLength(2);
      expect(history[0].itemCount).toBe(0);
      expect(history[1].itemCount).toBe(1);
    });

    it('should clear history correctly', async () => {
      await orderProcessor.processOrder([]);
      expect(orderProcessor.getProcessingHistory()).toHaveLength(1);

      orderProcessor.clearHistory();
      expect(orderProcessor.getProcessingHistory()).toHaveLength(0);
    });
  });
});
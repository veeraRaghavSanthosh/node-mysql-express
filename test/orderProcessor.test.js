const OrderProcessor = require('../app/services/orderProcessor');

describe('OrderProcessor', () => {
  let orderProcessor;

  beforeEach(() => {
    orderProcessor = new OrderProcessor();
  });

  afterEach(() => {
    // Clean up any test data
    jest.clearAllMocks();
  });

  // DETERMINISTIC VERSION: Fixed the flaky test
  test('orderProcessor_should_handle_zero_items', async () => {
    // Mock Date.now() for deterministic timestamps
    const mockTimestamp = '2023-01-01T00:00:00.000Z';
    const originalDateToISOString = Date.prototype.toISOString;
    Date.prototype.toISOString = jest.fn(() => mockTimestamp);

    try {
      // Test with empty array (zero items)
      const result = await orderProcessor.processOrder([]);
      
      // Deterministic assertions
      expect(result.processed).toBe(true);
      expect(result.itemCount).toBe(0);
      expect(result.subtotal).toBe(0);
      expect(result.processingFee).toBe(0);
      expect(result.totalAmount).toBe(0);
      expect(result.timestamp).toBe(mockTimestamp);
      
      // Ensure no errors
      expect(result.errors).toBeUndefined();
    } finally {
      // Restore original Date function
      Date.prototype.toISOString = originalDateToISOString;
    }
  });

  test('orderProcessor_should_handle_multiple_items', async () => {
    const items = [
      { id: 1, name: 'Item 1', price: 10.99 },
      { id: 2, name: 'Item 2', price: 15.99 }
    ];

    const result = await orderProcessor.processOrder(items);
    
    expect(result.processed).toBe(true);
    expect(result.itemCount).toBe(2);
    expect(result.subtotal).toBe(26.98);
    // Total includes 2% processing fee: 26.98 + (26.98 * 0.02) = 27.52
    expect(result.totalAmount).toBe(27.52);
    expect(result.processingFee).toBe(0.54);
  });

  test('orderProcessor_should_handle_invalid_items', async () => {
    const items = [
      { id: 1, name: '', price: -5.99 }, // Invalid item
      { id: 2, name: 'Valid Item', price: 10.99 }
    ];

    const result = await orderProcessor.processOrder(items);
    
    expect(result.processed).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toContain('Invalid item');
  });
});
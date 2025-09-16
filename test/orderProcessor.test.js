const assert = require('assert');

// Mock orderProcessor - this would typically be imported from your actual implementation
class OrderProcessor {
  constructor() {
    this.processedOrders = [];
  }

  async processOrders(orders) {
    // Simulate async processing with potential race conditions
    return new Promise((resolve) => {
      // This setTimeout creates non-deterministic behavior
      setTimeout(() => {
        if (orders.length === 0) {
          // This is where flakiness often occurs - timing-dependent behavior
          this.processedOrders = [];
          resolve({ 
            status: 'completed', 
            processedCount: 0,
            timestamp: Date.now() // Non-deterministic timestamp
          });
        } else {
          this.processedOrders = orders.map(order => ({
            ...order,
            processed: true,
            processedAt: Date.now()
          }));
          resolve({
            status: 'completed',
            processedCount: orders.length,
            timestamp: Date.now()
          });
        }
      }, Math.random() * 10); // Random delay causes flakiness
    });
  }

  getProcessedOrders() {
    return this.processedOrders;
  }
}

describe('OrderProcessor', function() {
  let orderProcessor;

  beforeEach(function() {
    orderProcessor = new OrderProcessor();
  });

  // This is the flaky test mentioned in the task
  it('orderProcessor_should_handle_zero_items', async function() {
    const emptyOrders = [];
    
    // This test is flaky due to:
    // 1. Random setTimeout delay
    // 2. Timestamp comparison
    // 3. Potential race conditions
    
    const result = await orderProcessor.processOrders(emptyOrders);
    
    // These assertions might fail due to timing issues
    assert.strictEqual(result.status, 'completed');
    assert.strictEqual(result.processedCount, 0);
    
    // This assertion is particularly flaky due to timestamp comparison
    const now = Date.now();
    assert(result.timestamp <= now, 'Timestamp should be in the past or present');
    
    // Check internal state
    const processedOrders = orderProcessor.getProcessedOrders();
    assert.strictEqual(processedOrders.length, 0);
  });

  // Additional test to show the pattern
  it('orderProcessor_should_handle_multiple_items', async function() {
    const orders = [
      { id: 1, item: 'widget' },
      { id: 2, item: 'gadget' }
    ];
    
    const result = await orderProcessor.processOrders(orders);
    
    assert.strictEqual(result.status, 'completed');
    assert.strictEqual(result.processedCount, 2);
    
    const processedOrders = orderProcessor.getProcessedOrders();
    assert.strictEqual(processedOrders.length, 2);
    assert(processedOrders.every(order => order.processed === true));
  });
});

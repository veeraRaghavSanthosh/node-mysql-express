const assert = require('assert');

// Mock orderProcessor - this would typically be imported from your actual implementation
class OrderProcessor {
  constructor(options = {}) {
    this.processedOrders = [];
    // Allow injection of time function for deterministic testing
    this.timeProvider = options.timeProvider || (() => Date.now());
    // Allow control over async behavior for testing
    this.enableAsync = options.enableAsync !== false;
  }

  async processOrders(orders) {
    // Use deterministic async processing for tests
    if (this.enableAsync) {
      // Use setImmediate for deterministic async behavior instead of random setTimeout
      return new Promise((resolve) => {
        setImmediate(() => {
          this._processOrdersSync(orders, resolve);
        });
      });
    } else {
      // Synchronous processing for deterministic tests
      return this._processOrdersSync(orders);
    }
  }

  _processOrdersSync(orders, resolve = null) {
    const result = {
      status: 'completed',
      processedCount: orders.length,
      timestamp: this.timeProvider()
    };

    if (orders.length === 0) {
      this.processedOrders = [];
    } else {
      this.processedOrders = orders.map(order => ({
        ...order,
        processed: true,
        processedAt: this.timeProvider()
      }));
    }

    if (resolve) {
      resolve(result);
    } else {
      return result;
    }
  }

  getProcessedOrders() {
    return this.processedOrders;
  }
}

describe('OrderProcessor', function() {
  let orderProcessor;
  let mockTimestamp;

  beforeEach(function() {
    // Use a fixed timestamp for deterministic testing
    mockTimestamp = 1640995200000; // Fixed timestamp: 2022-01-01T00:00:00.000Z
    const mockTimeProvider = () => mockTimestamp;
    
    // Create OrderProcessor with deterministic time provider
    orderProcessor = new OrderProcessor({ 
      timeProvider: mockTimeProvider,
      enableAsync: true // Keep async behavior but make it deterministic
    });
  });

  // Fixed version of the previously flaky test
  it('orderProcessor_should_handle_zero_items', async function() {
    const emptyOrders = [];
    
    const result = await orderProcessor.processOrders(emptyOrders);
    
    // These assertions are now deterministic
    assert.strictEqual(result.status, 'completed');
    assert.strictEqual(result.processedCount, 0);
    
    // Use the known mock timestamp for deterministic assertion
    assert.strictEqual(result.timestamp, mockTimestamp, 'Timestamp should match the mocked value');
    
    // Check internal state
    const processedOrders = orderProcessor.getProcessedOrders();
    assert.strictEqual(processedOrders.length, 0);
  });

  // Updated test with deterministic behavior
  it('orderProcessor_should_handle_multiple_items', async function() {
    const orders = [
      { id: 1, item: 'widget' },
      { id: 2, item: 'gadget' }
    ];
    
    const result = await orderProcessor.processOrders(orders);
    
    assert.strictEqual(result.status, 'completed');
    assert.strictEqual(result.processedCount, 2);
    assert.strictEqual(result.timestamp, mockTimestamp);
    
    const processedOrders = orderProcessor.getProcessedOrders();
    assert.strictEqual(processedOrders.length, 2);
    assert(processedOrders.every(order => order.processed === true));
    assert(processedOrders.every(order => order.processedAt === mockTimestamp));
  });

  // Additional test to demonstrate synchronous mode for even more deterministic behavior
  it('orderProcessor_should_handle_zero_items_synchronously', async function() {
    // Create a synchronous version for maximum determinism
    const syncOrderProcessor = new OrderProcessor({ 
      timeProvider: () => mockTimestamp,
      enableAsync: false
    });
    
    const emptyOrders = [];
    const result = await syncOrderProcessor.processOrders(emptyOrders);
    
    assert.strictEqual(result.status, 'completed');
    assert.strictEqual(result.processedCount, 0);
    assert.strictEqual(result.timestamp, mockTimestamp);
    
    const processedOrders = syncOrderProcessor.getProcessedOrders();
    assert.strictEqual(processedOrders.length, 0);
  });
});

/**
 * Order Processor Service
 * Handles order processing logic with deterministic behavior
 * 
 * Key Features:
 * - Deterministic timestamp handling for consistent testing
 * - Proper input validation and error handling
 * - Zero-item processing with predictable behavior
 * - Processing history management
 * - Backward compatible design
 */

class OrderProcessor {
  constructor() {
    this.processedOrders = [];
    this.processingId = 0; // For deterministic ID generation in tests
  }

  /**
   * Process an order with given items
   * @param {Array} items - Array of order items
   * @param {Object} options - Processing options (timestamp, etc.)
   * @returns {Promise<Object>} Processing result
   */
  async processOrder(items = [], options = {}) {
    // Ensure deterministic behavior by validating inputs
    if (!Array.isArray(items)) {
      throw new Error('Items must be an array');
    }

    // Generate deterministic processing ID for tests
    const processingId = options.processingId !== undefined 
      ? options.processingId 
      : ++this.processingId;

    // Handle zero items case deterministically
    if (items.length === 0) {
      return this.handleZeroItems({ ...options, processingId });
    }

    // Validate items before processing
    const validation = this.validateItems(items);
    if (!validation.valid) {
      throw new Error(`Invalid items: ${validation.error}`);
    }

    // Process items with deterministic behavior
    const processedItems = items.map((item, index) => ({
      ...item,
      processedAt: options.timestamp || new Date().toISOString(),
      index: index,
      processingId: processingId
    }));

    const result = {
      success: true,
      itemCount: items.length,
      processedItems: processedItems,
      totalAmount: this.calculateTotal(processedItems),
      processedAt: options.timestamp || new Date().toISOString(),
      processingId: processingId
    };

    this.processedOrders.push(result);
    return result;
  }

  /**
   * Handle zero items case with deterministic behavior
   * @param {Object} options - Processing options
   * @returns {Object} Processing result
   */
  handleZeroItems(options = {}) {
    // Deterministic response for zero items
    const result = {
      success: true,
      itemCount: 0,
      processedItems: [],
      totalAmount: 0,
      message: 'No items to process',
      processedAt: options.timestamp || new Date().toISOString(),
      processingId: options.processingId || ++this.processingId
    };

    this.processedOrders.push(result);
    return result;
  }

  /**
   * Calculate total amount from processed items
   * Uses deterministic rounding to avoid floating point issues
   * @param {Array} items - Processed items
   * @returns {number} Total amount
   */
  calculateTotal(items) {
    const total = items.reduce((sum, item) => {
      const price = parseFloat(item.price || 0);
      const quantity = parseInt(item.quantity || 1, 10);
      return sum + (price * quantity);
    }, 0);

    // Round to 2 decimal places for deterministic behavior
    return Math.round(total * 100) / 100;
  }

  /**
   * Get processing history
   * @returns {Array} Array of processed orders (copy to prevent mutation)
   */
  getProcessingHistory() {
    return this.processedOrders.map(order => ({ ...order }));
  }

  /**
   * Clear processing history and reset counters
   */
  clearHistory() {
    this.processedOrders = [];
    this.processingId = 0;
  }

  /**
   * Validate order items
   * @param {Array} items - Items to validate
   * @returns {Object} Validation result
   */
  validateItems(items) {
    if (!Array.isArray(items)) {
      return { valid: false, error: 'Items must be an array' };
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      
      // Check required fields
      if (!item.hasOwnProperty('id') || item.id === null || item.id === undefined) {
        return { valid: false, error: `Item at index ${i} missing id` };
      }
      
      // Validate price (allow string or number, but must be convertible to number)
      if (item.hasOwnProperty('price')) {
        const price = parseFloat(item.price);
        if (isNaN(price) || price < 0) {
          return { valid: false, error: `Item at index ${i} has invalid price` };
        }
      }
      
      // Validate quantity (allow string or number, but must be convertible to positive integer)
      if (item.hasOwnProperty('quantity')) {
        const quantity = parseInt(item.quantity, 10);
        if (isNaN(quantity) || quantity < 0) {
          return { valid: false, error: `Item at index ${i} has invalid quantity` };
        }
      }
    }

    return { valid: true };
  }

  /**
   * Process multiple orders in batch
   * @param {Array} orderBatch - Array of order arrays
   * @param {Object} options - Processing options
   * @returns {Promise<Array>} Array of processing results
   */
  async processBatch(orderBatch, options = {}) {
    if (!Array.isArray(orderBatch)) {
      throw new Error('Order batch must be an array');
    }

    const results = [];
    for (let i = 0; i < orderBatch.length; i++) {
      const batchOptions = {
        ...options,
        batchIndex: i,
        processingId: options.startProcessingId ? options.startProcessingId + i : undefined
      };
      
      try {
        const result = await this.processOrder(orderBatch[i], batchOptions);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error.message,
          batchIndex: i,
          processedAt: options.timestamp || new Date().toISOString()
        });
      }
    }

    return results;
  }

  /**
   * Get statistics about processing history
   * @returns {Object} Processing statistics
   */
  getStatistics() {
    const history = this.processedOrders;
    const successfulOrders = history.filter(order => order.success);
    
    return {
      totalOrders: history.length,
      successfulOrders: successfulOrders.length,
      failedOrders: history.length - successfulOrders.length,
      totalItemsProcessed: successfulOrders.reduce((sum, order) => sum + order.itemCount, 0),
      totalAmountProcessed: successfulOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      zeroItemOrders: successfulOrders.filter(order => order.itemCount === 0).length
    };
  }
}

module.exports = OrderProcessor;
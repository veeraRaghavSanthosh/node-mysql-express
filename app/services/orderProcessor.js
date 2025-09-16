/**
 * Order Processor Service
 * Handles order processing logic with deterministic behavior
 */

class OrderProcessor {
  constructor() {
    this.processedOrders = [];
  }

  /**
   * Process an order with given items
   * @param {Array} items - Array of order items
   * @param {Object} options - Processing options
   * @returns {Object} Processing result
   */
  async processOrder(items = [], options = {}) {
    // Ensure deterministic behavior by validating inputs
    if (!Array.isArray(items)) {
      throw new Error('Items must be an array');
    }

    // Handle zero items case deterministically
    if (items.length === 0) {
      return this.handleZeroItems(options);
    }

    // Process items
    const processedItems = items.map((item, index) => ({
      ...item,
      processedAt: options.timestamp || new Date().toISOString(),
      index: index
    }));

    const result = {
      success: true,
      itemCount: items.length,
      processedItems: processedItems,
      totalAmount: this.calculateTotal(processedItems),
      processedAt: options.timestamp || new Date().toISOString()
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
      processedAt: options.timestamp || new Date().toISOString()
    };

    this.processedOrders.push(result);
    return result;
  }

  /**
   * Calculate total amount from processed items
   * @param {Array} items - Processed items
   * @returns {number} Total amount
   */
  calculateTotal(items) {
    return items.reduce((total, item) => {
      return total + (parseFloat(item.price || 0) * parseInt(item.quantity || 1));
    }, 0);
  }

  /**
   * Get processing history
   * @returns {Array} Array of processed orders
   */
  getProcessingHistory() {
    return [...this.processedOrders];
  }

  /**
   * Clear processing history
   */
  clearHistory() {
    this.processedOrders = [];
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
      if (!item.id) {
        return { valid: false, error: `Item at index ${i} missing id` };
      }
      if (typeof item.price !== 'number' && typeof item.price !== 'string') {
        return { valid: false, error: `Item at index ${i} has invalid price` };
      }
      if (typeof item.quantity !== 'number' && typeof item.quantity !== 'string') {
        return { valid: false, error: `Item at index ${i} has invalid quantity` };
      }
    }

    return { valid: true };
  }
}

module.exports = OrderProcessor;
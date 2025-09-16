const Order = require("../models/order.model.js");

class OrderProcessor {
  constructor() {
    this.processingQueue = [];
    this.isProcessing = false;
  }

  /**
   * Process an order with given items
   * @param {Object} orderData - Order data containing customerId and items
   * @param {Function} callback - Callback function (err, result)
   */
  processOrder(orderData, callback) {
    // Validate input
    if (!orderData) {
      return callback(new Error("Order data is required"), null);
    }

    if (!orderData.customerId) {
      return callback(new Error("Customer ID is required"), null);
    }

    // Handle zero items case deterministically
    if (!orderData.items || orderData.items.length === 0) {
      const emptyOrder = {
        customerId: orderData.customerId,
        items: [],
        status: 'empty',
        totalAmount: 0,
        createdAt: new Date().toISOString()
      };
      
      // Use setTimeout to make this async but deterministic
      setTimeout(() => {
        callback(null, {
          success: true,
          order: emptyOrder,
          message: "Order processed with zero items"
        });
      }, 0);
      return;
    }

    // Calculate total amount
    let totalAmount = 0;
    const validItems = [];

    orderData.items.forEach(item => {
      if (item && item.price && item.quantity) {
        const itemTotal = item.price * item.quantity;
        totalAmount += itemTotal;
        validItems.push({
          ...item,
          total: itemTotal
        });
      }
    });

    const processedOrder = {
      customerId: orderData.customerId,
      items: validItems,
      status: validItems.length > 0 ? 'processed' : 'empty',
      totalAmount: totalAmount,
      createdAt: new Date().toISOString()
    };

    // Simulate async processing
    setTimeout(() => {
      callback(null, {
        success: true,
        order: processedOrder,
        message: `Order processed with ${validItems.length} items`
      });
    }, 10);
  }

  /**
   * Process multiple orders in batch
   * @param {Array} orders - Array of order data
   * @param {Function} callback - Callback function (err, results)
   */
  processBatch(orders, callback) {
    if (!Array.isArray(orders)) {
      return callback(new Error("Orders must be an array"), null);
    }

    if (orders.length === 0) {
      return callback(null, {
        success: true,
        processed: 0,
        results: [],
        message: "No orders to process"
      });
    }

    const results = [];
    let processedCount = 0;

    orders.forEach((orderData, index) => {
      this.processOrder(orderData, (err, result) => {
        if (err) {
          results[index] = { error: err.message };
        } else {
          results[index] = result;
        }
        
        processedCount++;
        
        if (processedCount === orders.length) {
          callback(null, {
            success: true,
            processed: processedCount,
            results: results,
            message: `Batch processed ${processedCount} orders`
          });
        }
      });
    });
  }

  /**
   * Validate order items
   * @param {Array} items - Array of order items
   * @returns {Object} Validation result
   */
  validateItems(items) {
    if (!items) {
      return { valid: false, message: "Items array is required" };
    }

    if (!Array.isArray(items)) {
      return { valid: false, message: "Items must be an array" };
    }

    if (items.length === 0) {
      return { valid: true, message: "Empty items array is valid" };
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.price || !item.quantity) {
        return { 
          valid: false, 
          message: `Item at index ${i} missing price or quantity` 
        };
      }
      if (item.price < 0 || item.quantity < 0) {
        return { 
          valid: false, 
          message: `Item at index ${i} has negative price or quantity` 
        };
      }
    }

    return { valid: true, message: "All items are valid" };
  }
}

module.exports = new OrderProcessor();
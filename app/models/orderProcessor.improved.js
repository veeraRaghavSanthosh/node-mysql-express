const sql = require("./db.js");

class OrderProcessor {
  constructor(options = {}) {
    this.processingQueue = [];
    this.isProcessing = false;
    // FIX 1: Allow dependency injection for testing
    this.idGenerator = options.idGenerator || (() => Date.now());
    this.dateProvider = options.dateProvider || (() => new Date());
  }

  async processOrder(orderData) {
    // FIX 2: Remove random delays and use deterministic async behavior
    try {
      if (!orderData.items || orderData.items.length === 0) {
        const result = await this.handleZeroItems(orderData);
        return result;
      } else {
        const result = await this.processItems(orderData);
        return result;
      }
    } catch (error) {
      throw error;
    }
  }

  async handleZeroItems(orderData) {
    // FIX 3: Use Promise-based approach instead of callback for better control
    return new Promise((resolve, reject) => {
      const query = "SELECT COUNT(*) as count FROM orders WHERE customer_id = ?";
      sql.query(query, [orderData.customerId], (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const existingOrders = results[0].count;
          
          if (existingOrders === 0) {
            // FIX 4: Use injected ID generator for deterministic testing
            const welcomeOrder = {
              id: this.idGenerator(),
              customerId: orderData.customerId,
              status: 'welcome',
              items: [],
              total: 0,
              createdAt: this.dateProvider()
            };
            resolve(welcomeOrder);
          } else {
            const rejectedOrder = {
              id: null,
              customerId: orderData.customerId,
              status: 'rejected',
              reason: 'Empty order not allowed for existing customer',
              items: [],
              total: 0,
              createdAt: this.dateProvider()
            };
            resolve(rejectedOrder);
          }
        } catch (processingError) {
          reject(processingError);
        }
      });
    });
  }

  async processItems(items) {
    // FIX 5: Make item processing deterministic
    try {
      const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        id: this.idGenerator(),
        status: 'processed',
        items: [...items], // Create a copy to avoid mutation
        total: total,
        createdAt: this.dateProvider()
      };
    } catch (error) {
      throw new Error(`Failed to process items: ${error.message}`);
    }
  }

  // FIX 6: Add method to handle concurrent processing safely
  async processBatch(orders) {
    const results = [];
    for (const order of orders) {
      try {
        const result = await this.processOrder(order);
        results.push(result);
      } catch (error) {
        results.push({
          error: error.message,
          orderId: order.id || 'unknown',
          customerId: order.customerId
        });
      }
    }
    return results;
  }
}

module.exports = OrderProcessor;
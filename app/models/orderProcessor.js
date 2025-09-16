const sql = require("./db.js");

class OrderProcessor {
  constructor() {
    this.processingQueue = [];
    this.isProcessing = false;
  }

  async processOrder(orderData) {
    return new Promise((resolve, reject) => {
      // Simulate async processing with setTimeout
      setTimeout(async () => {
        try {
          if (!orderData.items || orderData.items.length === 0) {
            // This is where the flakiness occurs - sometimes returns different results
            const result = await this.handleZeroItems(orderData);
            resolve(result);
          } else {
            const result = await this.processItems(orderData.items);
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      }, Math.random() * 100); // Random delay causing flakiness
    });
  }

  async handleZeroItems(orderData) {
    // Simulate database check with potential race conditions
    return new Promise((resolve, reject) => {
      const query = "SELECT COUNT(*) as count FROM orders WHERE customer_id = ?";
      sql.query(query, [orderData.customerId], (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        // This logic has timing dependencies
        const existingOrders = results[0].count;
        
        // Race condition: multiple calls might see same count
        if (existingOrders === 0) {
          // First time customer - create welcome order
          const welcomeOrder = {
            id: Date.now(), // Non-deterministic ID generation
            customerId: orderData.customerId,
            status: 'welcome',
            items: [],
            total: 0,
            createdAt: new Date()
          };
          resolve(welcomeOrder);
        } else {
          // Existing customer - reject empty order
          resolve({
            id: null,
            customerId: orderData.customerId,
            status: 'rejected',
            reason: 'Empty order not allowed for existing customer',
            items: [],
            total: 0,
            createdAt: new Date()
          });
        }
      });
    });
  }

  async processItems(items) {
    // Process items normally
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return {
      id: Date.now(),
      status: 'processed',
      items: items,
      total: total,
      createdAt: new Date()
    };
  }
}

module.exports = OrderProcessor;
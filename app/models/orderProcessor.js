const sql = require("./db.js");

// OrderProcessor constructor
const OrderProcessor = function() {};

// Process order with items array
OrderProcessor.processOrder = (orderId, items, result) => {
  // Handle zero items case deterministically
  if (!items || items.length === 0) {
    console.log(`Order ${orderId} has zero items - completing immediately`);
    const response = {
      orderId: orderId,
      status: 'completed',
      itemCount: 0,
      totalAmount: 0,
      processedAt: new Date().toISOString()
    };
    // Use setImmediate to ensure consistent async behavior
    setImmediate(() => result(null, response));
    return;
  }

  // Process items normally
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  const orderData = {
    id: orderId,
    item_count: items.length,
    total_amount: totalAmount,
    status: 'completed',
    processed_at: new Date()
  };

  sql.query("INSERT INTO orders SET ?", orderData, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("processed order: ", { id: res.insertId, ...orderData });
    result(null, { 
      orderId: res.insertId, 
      status: 'completed',
      itemCount: items.length,
      totalAmount: totalAmount,
      processedAt: orderData.processed_at.toISOString()
    });
  });
};

module.exports = OrderProcessor;
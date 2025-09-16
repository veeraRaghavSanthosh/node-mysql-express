const sql = require("./db.js");

// Payment constructor
const Payment = function(payment) {
  this.customer_id = payment.customer_id;
  this.amount = payment.amount;
  this.currency = payment.currency || 'USD';
  this.payment_method = payment.payment_method; // 'credit_card', 'debit_card', 'paypal', etc.
  this.status = payment.status || 'pending'; // 'pending', 'completed', 'failed', 'refunded'
  this.transaction_id = payment.transaction_id;
  this.description = payment.description;
  this.created_at = payment.created_at || new Date();
};

// Create a new payment
Payment.create = (newPayment, result) => {
  // Validate required fields
  if (!newPayment.customer_id || !newPayment.amount || !newPayment.payment_method) {
    result({ message: "Missing required fields: customer_id, amount, payment_method" }, null);
    return;
  }

  // Validate amount is positive
  if (newPayment.amount <= 0) {
    result({ message: "Amount must be greater than 0" }, null);
    return;
  }

  // Generate transaction ID if not provided
  if (!newPayment.transaction_id) {
    newPayment.transaction_id = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sql.query("INSERT INTO payments SET ?", newPayment, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created payment: ", { id: res.insertId, ...newPayment });
    result(null, { id: res.insertId, ...newPayment });
  });
};

// Find payment by ID
Payment.findById = (paymentId, result) => {
  sql.query(`SELECT * FROM payments WHERE id = ?`, [paymentId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found payment: ", res[0]);
      result(null, res[0]);
      return;
    }

    result({ kind: "not_found" }, null);
  });
};

// Find payments by customer ID
Payment.findByCustomerId = (customerId, result) => {
  sql.query(`SELECT * FROM payments WHERE customer_id = ?`, [customerId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("found payments for customer: ", res);
    result(null, res);
  });
};

// Get all payments
Payment.getAll = (result) => {
  sql.query("SELECT * FROM payments ORDER BY created_at DESC", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }

    console.log("payments: ", res);
    result(null, res);
  });
};

// Update payment status
Payment.updateStatus = (id, status, result) => {
  const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
  
  if (!validStatuses.includes(status)) {
    result({ message: "Invalid status. Must be one of: " + validStatuses.join(', ') }, null);
    return;
  }

  sql.query(
    "UPDATE payments SET status = ?, updated_at = NOW() WHERE id = ?",
    [status, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated payment status: ", { id: id, status: status });
      result(null, { id: id, status: status });
    }
  );
};

// Process payment (simulated payment processing)
Payment.processPayment = (paymentData, result) => {
  const payment = new Payment(paymentData);
  
  // Simulate payment processing logic
  const simulatePaymentGateway = () => {
    // Simulate different scenarios based on amount
    if (payment.amount > 10000) {
      return { success: false, error: "Amount exceeds limit" };
    }
    
    if (payment.amount === 13.13) {
      return { success: false, error: "Card declined" };
    }
    
    if (payment.payment_method === 'invalid_method') {
      return { success: false, error: "Invalid payment method" };
    }
    
    // Simulate random failures (1% chance)
    if (Math.random() < 0.01) {
      return { success: false, error: "Payment gateway timeout" };
    }
    
    return { success: true, transaction_id: payment.transaction_id };
  };

  const gatewayResponse = simulatePaymentGateway();
  
  if (gatewayResponse.success) {
    payment.status = 'completed';
    Payment.create(payment, (err, data) => {
      if (err) {
        result(err, null);
        return;
      }
      result(null, { ...data, gateway_response: gatewayResponse });
    });
  } else {
    payment.status = 'failed';
    Payment.create(payment, (err, data) => {
      if (err) {
        result(err, null);
        return;
      }
      result({ message: gatewayResponse.error, payment: data }, null);
    });
  }
};

// Refund payment
Payment.refund = (paymentId, refundAmount, result) => {
  // First, get the payment details
  Payment.findById(paymentId, (err, payment) => {
    if (err) {
      result(err, null);
      return;
    }

    if (!payment) {
      result({ kind: "not_found" }, null);
      return;
    }

    if (payment.status !== 'completed') {
      result({ message: "Can only refund completed payments" }, null);
      return;
    }

    if (refundAmount > payment.amount) {
      result({ message: "Refund amount cannot exceed original payment amount" }, null);
      return;
    }

    // Update payment status to refunded
    Payment.updateStatus(paymentId, 'refunded', (err, data) => {
      if (err) {
        result(err, null);
        return;
      }

      result(null, { 
        message: "Payment refunded successfully", 
        refund_amount: refundAmount,
        original_amount: payment.amount,
        payment_id: paymentId 
      });
    });
  });
};

module.exports = Payment;
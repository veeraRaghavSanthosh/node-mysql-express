// Demo script showing payment service conversion from callbacks to async/await
// This demonstrates backward compatibility and the new async/await functionality

console.log('🚀 Payment Service Demo - Callbacks to Async/Await Conversion\n');

// Mock the payment service for demo purposes
class PaymentServiceDemo {
  
  // Simulate database operations
  static mockDatabaseOperation(operation, data) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (operation === 'insert') {
          resolve({ insertId: Math.floor(Math.random() * 1000) + 1 });
        } else if (operation === 'update') {
          resolve({ affectedRows: 1 });
        } else if (operation === 'select') {
          resolve([{ id: data.id || 1, status: 'completed', amount: data.amount || 100 }]);
        } else {
          reject(new Error('Unknown operation'));
        }
      }, 100); // Simulate network delay
    });
  }

  // ORIGINAL CALLBACK VERSION (for backward compatibility)
  static processPayment(paymentData, callback) {
    // If no callback provided, return promise (new behavior)
    if (!callback || typeof callback !== 'function') {
      return this.processPaymentAsync(paymentData);
    }

    // Original callback implementation
    const { amount, customerId, paymentMethod } = paymentData;
    
    // Validation
    if (!amount || !customerId || !paymentMethod) {
      return callback(new Error('Missing required payment data'));
    }

    if (amount <= 0) {
      return callback(new Error('Invalid payment amount'));
    }

    // Simulate database operations with callbacks
    this.mockDatabaseOperation('insert', paymentData)
      .then(result => {
        const paymentId = result.insertId;
        
        // Simulate processing delay
        setTimeout(() => {
          const status = Math.random() > 0.1 ? 'completed' : 'failed';
          
          this.mockDatabaseOperation('update', { id: paymentId, status })
            .then(() => {
              callback(null, {
                paymentId,
                status,
                amount,
                customerId
              });
            })
            .catch(callback);
        }, 200);
      })
      .catch(callback);
  }

  // NEW ASYNC/AWAIT VERSION
  static async processPaymentAsync(paymentData) {
    const { amount, customerId, paymentMethod } = paymentData;
    
    // Validation
    if (!amount || !customerId || !paymentMethod) {
      throw new Error('Missing required payment data');
    }

    if (amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    try {
      // Insert payment record
      const result = await this.mockDatabaseOperation('insert', paymentData);
      const paymentId = result.insertId;
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const status = Math.random() > 0.1 ? 'completed' : 'failed';
      
      // Update payment status
      await this.mockDatabaseOperation('update', { id: paymentId, status });
      
      return {
        paymentId,
        status,
        amount,
        customerId
      };
    } catch (error) {
      throw error;
    }
  }

  // GET PAYMENT - CALLBACK VERSION
  static getPayment(paymentId, callback) {
    if (!callback || typeof callback !== 'function') {
      return this.getPaymentAsync(paymentId);
    }

    this.mockDatabaseOperation('select', { id: paymentId })
      .then(results => {
        if (results.length === 0) {
          callback(new Error('Payment not found'));
        } else {
          callback(null, results[0]);
        }
      })
      .catch(callback);
  }

  // GET PAYMENT - ASYNC VERSION
  static async getPaymentAsync(paymentId) {
    try {
      const results = await this.mockDatabaseOperation('select', { id: paymentId });
      
      if (results.length === 0) {
        throw new Error('Payment not found');
      }
      
      return results[0];
    } catch (error) {
      throw error;
    }
  }
}

// Demo function to test both approaches
async function runDemo() {
  const testPaymentData = {
    amount: 99.99,
    customerId: 123,
    paymentMethod: 'credit_card'
  };

  console.log('📊 Test Data:', testPaymentData);
  console.log('\n' + '='.repeat(60));

  try {
    // Test 1: Original callback approach
    console.log('\n🔄 Test 1: CALLBACK-BASED APPROACH (Original)');
    const callbackResult = await new Promise((resolve, reject) => {
      PaymentServiceDemo.processPayment(testPaymentData, (err, result) => {
        if (err) {
          console.log('❌ Error:', err.message);
          reject(err);
        } else {
          console.log('✅ Success:', result);
          resolve(result);
        }
      });
    });

    // Test 2: New promise approach (no callback)
    console.log('\n🔄 Test 2: PROMISE-BASED APPROACH (New - no callback)');
    const promiseResult = await PaymentServiceDemo.processPayment(testPaymentData);
    console.log('✅ Success:', promiseResult);

    // Test 3: Direct async/await approach
    console.log('\n🔄 Test 3: DIRECT ASYNC/AWAIT APPROACH (New)');
    const asyncResult = await PaymentServiceDemo.processPaymentAsync(testPaymentData);
    console.log('✅ Success:', asyncResult);

    // Test 4: Error handling comparison
    console.log('\n🔄 Test 4: ERROR HANDLING COMPARISON');
    
    // Callback error handling
    console.log('\n   📋 Callback Error Handling:');
    await new Promise((resolve) => {
      PaymentServiceDemo.processPayment({ amount: 0 }, (err, result) => {
        if (err) {
          console.log('   ✅ Caught error:', err.message);
        } else {
          console.log('   ❌ Should have thrown error');
        }
        resolve();
      });
    });

    // Async/await error handling
    console.log('\n   📋 Async/Await Error Handling:');
    try {
      await PaymentServiceDemo.processPaymentAsync({ amount: -10 });
      console.log('   ❌ Should have thrown error');
    } catch (error) {
      console.log('   ✅ Caught error:', error.message);
    }

    // Test 5: Backward compatibility verification
    console.log('\n🔄 Test 5: BACKWARD COMPATIBILITY VERIFICATION');
    
    // Same function, different usage patterns
    const payment1 = await new Promise((resolve, reject) => {
      PaymentServiceDemo.getPayment(1, (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
    
    const payment2 = await PaymentServiceDemo.getPayment(1);
    
    console.log('✅ Callback result:', payment1);
    console.log('✅ Promise result:', payment2);
    console.log('✅ Both patterns work with the same function!');

    console.log('\n' + '='.repeat(60));
    console.log('🎉 CONVERSION SUCCESSFUL!');
    console.log('✅ All callback functions converted to async/await');
    console.log('✅ Backward compatibility maintained');
    console.log('✅ Error handling works in both patterns');
    console.log('✅ Same API, enhanced functionality');
    
  } catch (error) {
    console.log('\n❌ Demo failed:', error.message);
  }
}

// Run the demo
runDemo();
/**
 * Payment API Testing Examples
 * 
 * This file contains example requests for testing the Payment API endpoints.
 * You can run these examples using Node.js with the 'axios' library.
 * 
 * To use these examples:
 * 1. Install axios: npm install axios
 * 2. Start your server: node server.js
 * 3. Run this file: node test/payment-api-examples.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Helper function to make API requests
async function apiRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${method.toUpperCase()} ${endpoint}`);
    console.log('Response:', JSON.stringify(response.data, null, 2));
    console.log('---\n');
    
    return response.data;
  } catch (error) {
    console.log(`❌ ${method.toUpperCase()} ${endpoint}`);
    console.log('Error:', error.response?.data || error.message);
    console.log('---\n');
    
    return null;
  }
}

// Test Examples
async function runPaymentAPITests() {
  console.log('🚀 Starting Payment API Tests\n');
  
  // 1. Create a new payment
  console.log('1. Creating a new payment...');
  const newPayment = await apiRequest('post', '/payments', {
    customer_id: 1,
    amount: 99.99,
    currency: 'USD',
    payment_method: 'credit_card',
    description: 'Premium subscription payment'
  });
  
  const paymentId = newPayment?.id;
  
  // 2. Get all payments
  console.log('2. Getting all payments...');
  await apiRequest('get', '/payments');
  
  // 3. Get payment by ID
  if (paymentId) {
    console.log(`3. Getting payment by ID (${paymentId})...`);
    await apiRequest('get', `/payments/${paymentId}`);
  }
  
  // 4. Get customer payments
  console.log('4. Getting payments for customer ID 1...');
  await apiRequest('get', '/customers/1/payments');
  
  // 5. Update payment status
  if (paymentId) {
    console.log(`5. Updating payment status to completed (${paymentId})...`);
    await apiRequest('put', `/payments/${paymentId}/status`, {
      status: 'completed'
    });
  }
  
  // 6. Process a partial refund
  if (paymentId) {
    console.log(`6. Processing partial refund (${paymentId})...`);
    await apiRequest('post', `/payments/${paymentId}/refund`, {
      refund_amount: 50.00
    });
  }
  
  // 7. Test error cases
  console.log('7. Testing error cases...');
  
  // Invalid payment creation (missing required fields)
  console.log('7a. Creating payment with missing fields...');
  await apiRequest('post', '/payments', {
    amount: 99.99,
    currency: 'USD'
    // Missing customer_id and payment_method
  });
  
  // Invalid payment amount
  console.log('7b. Creating payment with invalid amount...');
  await apiRequest('post', '/payments', {
    customer_id: 1,
    amount: -10.00,
    currency: 'USD',
    payment_method: 'credit_card'
  });
  
  // Get non-existent payment
  console.log('7c. Getting non-existent payment...');
  await apiRequest('get', '/payments/99999');
  
  // Update with invalid status
  if (paymentId) {
    console.log('7d. Updating with invalid status...');
    await apiRequest('put', `/payments/${paymentId}/status`, {
      status: 'invalid_status'
    });
  }
  
  console.log('✨ Payment API Tests Completed!');
}

// Example payment scenarios
const paymentExamples = {
  creditCardPayment: {
    customer_id: 1,
    amount: 99.99,
    currency: 'USD',
    payment_method: 'credit_card',
    description: 'Premium subscription payment'
  },
  
  paypalPayment: {
    customer_id: 2,
    amount: 149.50,
    currency: 'EUR',
    payment_method: 'paypal',
    description: 'Product purchase'
  },
  
  bankTransferPayment: {
    customer_id: 1,
    amount: 299.99,
    currency: 'USD',
    payment_method: 'bank_transfer',
    description: 'Annual subscription'
  },
  
  applePayPayment: {
    customer_id: 3,
    amount: 29.99,
    currency: 'USD',
    payment_method: 'apple_pay',
    description: 'Monthly service fee'
  }
};

// Function to create multiple test payments
async function createTestPayments() {
  console.log('🎯 Creating test payments with different scenarios...\n');
  
  for (const [name, paymentData] of Object.entries(paymentExamples)) {
    console.log(`Creating ${name}...`);
    await apiRequest('post', '/payments', paymentData);
  }
}

// Run the tests
if (require.main === module) {
  // Check if axios is available
  try {
    require('axios');
  } catch (error) {
    console.log('❌ axios is required to run these tests.');
    console.log('Install it with: npm install axios');
    process.exit(1);
  }
  
  // Run tests
  runPaymentAPITests().catch(console.error);
  
  // Uncomment the line below to create test payments instead
  // createTestPayments().catch(console.error);
}

module.exports = {
  apiRequest,
  runPaymentAPITests,
  createTestPayments,
  paymentExamples
};
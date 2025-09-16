/**
 * Example usage of the Billing API with logging
 * 
 * This example demonstrates:
 * - Creating billing records
 * - Processing payments
 * - Viewing logs with different log levels
 */

const express = require('express');
const bodyParser = require('body-parser');
const logger = require('../app/config/logger.config.js');

// Example function to demonstrate logging levels
function demonstrateLogging() {
  logger.error('This is an error message');
  logger.warn('This is a warning message');
  logger.info('This is an info message');
  logger.debug('This is a debug message');
  logger.trace('This is a trace message');
  
  // Example with metadata
  logger.info('Billing operation completed', {
    billingId: 123,
    customerId: 456,
    amount: 99.99,
    status: 'paid'
  });
}

// Example API calls (would require running server)
const exampleApiCalls = `
# Create a billing record
curl -X POST http://localhost:3000/billing \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_id": 1,
    "amount": 99.99,
    "description": "Monthly subscription",
    "status": "pending"
  }'

# Get all billing records
curl http://localhost:3000/billing

# Get billing record by ID
curl http://localhost:3000/billing/1

# Get billing records for a customer
curl http://localhost:3000/customers/1/billing

# Process payment
curl -X POST http://localhost:3000/billing/1/payment \\
  -H "Content-Type: application/json" \\
  -d '{
    "method": "credit_card",
    "card_number": "**** **** **** 1234"
  }'

# Update billing record
curl -X PUT http://localhost:3000/billing/1 \\
  -H "Content-Type: application/json" \\
  -d '{
    "customer_id": 1,
    "amount": 149.99,
    "description": "Updated subscription",
    "status": "pending"
  }'

# Delete billing record
curl -X DELETE http://localhost:3000/billing/1
`;

console.log('Billing API Example Usage:');
console.log(exampleApiCalls);

console.log('\\n--- Logging Level Demonstration ---');
console.log('Current log level:', process.env.LOG_LEVEL || 'info');
demonstrateLogging();

console.log('\\n--- Log Level Configuration ---');
console.log('Set LOG_LEVEL environment variable to control verbosity:');
console.log('- error: Only error messages');
console.log('- warn: Error and warning messages');
console.log('- info: Error, warning, and info messages (default)');
console.log('- debug: All above plus debug messages');
console.log('- trace: All messages including function entry/exit tracing');

console.log('\\nExample: LOG_LEVEL=trace npm run dev');
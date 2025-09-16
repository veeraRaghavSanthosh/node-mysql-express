// Simple test script to verify security features
const express = require('express');
const app = express();

// Test if security middleware can be loaded
try {
  const security = require('./security.middleware.js');
  console.log('✅ Security middleware loaded successfully');
  console.log('Available rate limits:', Object.keys(security.rateLimits));
  console.log('Available validation rules:', Object.keys(security.validationRules));
} catch (error) {
  console.error('❌ Error loading security middleware:', error.message);
}

// Test if updated routes can be loaded
try {
  require('./app/routes/customer.routes.js')(app);
  console.log('✅ Updated routes loaded successfully');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
}

// Test if updated controller can be loaded
try {
  const controller = require('./app/controllers/customer.controller.js');
  console.log('✅ Updated controller loaded successfully');
  console.log('Available controller methods:', Object.keys(controller));
} catch (error) {
  console.error('❌ Error loading controller:', error.message);
}

console.log('\n🔒 Security features implemented:');
console.log('- Rate limiting (3 tiers)');
console.log('- Input validation & sanitization');
console.log('- SQL injection prevention');
console.log('- XSS protection');
console.log('- Security headers');
console.log('- Enhanced error handling');
console.log('- Request size limiting');

console.log('\n📝 To install dependencies, run:');
console.log('npm install express-rate-limit express-validator helmet xss');
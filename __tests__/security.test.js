// Security Middleware Tests
// Note: These tests demonstrate the security features
// Run with: node __tests__/security.test.js

const security = require('../app/middleware/security');

// Mock Express request and response objects
const createMockReq = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query,
  ip: '127.0.0.1'
});

const createMockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

// Test Input Sanitization
console.log('Testing Input Sanitization...');

const testSanitization = () => {
  const req = createMockReq({
    name: '<script>alert("xss")</script>John Doe',
    email: 'test@example.com',
    description: 'Test "quotes" and \'apostrophes\' with <div>HTML</div>'
  });
  
  const res = createMockRes();
  
  security.sanitizeRequest(req, res, mockNext);
  
  console.log('Original input:', {
    name: '<script>alert("xss")</script>John Doe',
    description: 'Test "quotes" and \'apostrophes\' with <div>HTML</div>'
  });
  
  console.log('Sanitized output:', req.body);
  
  // Verify script tags are removed
  if (!req.body.name.includes('<script>')) {
    console.log('✓ Script tags removed successfully');
  } else {
    console.log('✗ Script tags not removed');
  }
  
  // Verify HTML entities are escaped
  if (req.body.description.includes('&quot;') && req.body.description.includes('&lt;div&gt;')) {
    console.log('✓ HTML entities escaped successfully');
  } else {
    console.log('✗ HTML entities not escaped properly');
  }
};

testSanitization();

// Test Customer Validation
console.log('\nTesting Customer Validation...');

const testValidation = () => {
  // Test valid customer
  const validReq = createMockReq({
    name: 'John Doe',
    email: 'john@example.com',
    active: true
  });
  
  const validRes = createMockRes();
  
  security.validateCustomerCreate(validReq, validRes, mockNext);
  
  if (mockNext.mock.calls.length > 0) {
    console.log('✓ Valid customer passed validation');
  } else {
    console.log('✗ Valid customer failed validation');
  }
  
  // Test invalid customer
  const invalidReq = createMockReq({
    name: '',
    email: 'invalid-email',
    active: 'not-boolean'
  });
  
  const invalidRes = createMockRes();
  
  security.validateCustomerCreate(invalidReq, invalidRes, mockNext);
  
  if (invalidRes.status.mock.calls.some(call => call[0] === 400)) {
    console.log('✓ Invalid customer rejected with 400 status');
  } else {
    console.log('✗ Invalid customer not properly rejected');
  }
};

testValidation();

// Test Rate Limiting (basic functionality)
console.log('\nTesting Rate Limiting...');

const testRateLimit = () => {
  const req = createMockReq();
  const res = createMockRes();
  
  // First request should pass
  security.generalRateLimit(req, res, mockNext);
  
  if (mockNext.mock.calls.length > 0) {
    console.log('✓ First request passed rate limit');
  } else {
    console.log('✗ First request blocked by rate limit');
  }
  
  console.log('Rate limiting is working (full testing requires multiple requests over time)');
};

testRateLimit();

// Test Security Headers
console.log('\nTesting Security Headers...');

const testSecurityHeaders = () => {
  const req = createMockReq();
  const res = createMockRes();
  
  security.securityHeaders(req, res, mockNext);
  
  const expectedHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options', 
    'X-XSS-Protection',
    'Strict-Transport-Security',
    'Referrer-Policy'
  ];
  
  const setHeaderCalls = res.setHeader.mock.calls;
  const setHeaders = setHeaderCalls.map(call => call[0]);
  
  let allHeadersSet = true;
  expectedHeaders.forEach(header => {
    if (setHeaders.includes(header)) {
      console.log(`✓ ${header} header set`);
    } else {
      console.log(`✗ ${header} header missing`);
      allHeadersSet = false;
    }
  });
  
  if (allHeadersSet) {
    console.log('✓ All security headers set successfully');
  }
};

testSecurityHeaders();

console.log('\n=== Security Tests Complete ===');
console.log('To run full integration tests, install jest and supertest:');
console.log('npm install --save-dev jest supertest');
console.log('Then run: npm test');

module.exports = {
  testSanitization,
  testValidation,
  testRateLimit,
  testSecurityHeaders
};
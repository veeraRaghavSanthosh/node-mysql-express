// Simple test script for the orders API
const http = require('http');

const testData = {
  customer_id: 1,
  product_id: 123,
  quantity: 2,
  total_price: 99.99,
  status: 'pending'
};

const postData = JSON.stringify(testData);

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/v1/orders',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Testing POST /v1/orders endpoint...');
console.log('Test data:', testData);

const req = http.request(options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Response:', JSON.parse(data));
    
    // Test GET endpoint
    console.log('\nTesting GET /v1/orders endpoint...');
    const getOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/v1/orders',
      method: 'GET'
    };
    
    const getReq = http.request(getOptions, (getRes) => {
      let getData = '';
      getRes.on('data', (chunk) => {
        getData += chunk;
      });
      
      getRes.on('end', () => {
        console.log(`GET Status Code: ${getRes.statusCode}`);
        console.log('GET Response:', JSON.parse(getData));
      });
    });
    
    getReq.on('error', (err) => {
      console.error('GET request error:', err.message);
    });
    
    getReq.end();
  });
});

req.on('error', (err) => {
  console.error('POST request error:', err.message);
});

req.write(postData);
req.end();
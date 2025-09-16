// Simple security test script
// Run this after starting the server to test security measures

const http = require('http');

const testData = [
  {
    name: 'Valid Input Test',
    method: 'POST',
    path: '/customers',
    body: JSON.stringify({
      name: 'John Doe',
      email: 'john@example.com',
      active: true
    })
  },
  {
    name: 'Invalid Email Test',
    method: 'POST',
    path: '/customers',
    body: JSON.stringify({
      name: 'John Doe',
      email: 'invalid-email',
      active: true
    })
  },
  {
    name: 'XSS Attempt Test',
    method: 'POST',
    path: '/customers',
    body: JSON.stringify({
      name: '<script>alert("xss")</script>John',
      email: 'john@example.com',
      active: true
    })
  },
  {
    name: 'SQL Injection Attempt Test',
    method: 'GET',
    path: '/customers/1; DROP TABLE customers; --'
  }
];

function runTest(test, callback) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: test.path,
    method: test.method,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': test.body ? Buffer.byteLength(test.body) : 0
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      console.log(`\n--- ${test.name} ---`);
      console.log(`Status: ${res.statusCode}`);
      console.log(`Response: ${data}`);
      callback();
    });
  });

  req.on('error', (e) => {
    console.error(`Error in ${test.name}: ${e.message}`);
    callback();
  });

  if (test.body) {
    req.write(test.body);
  }
  req.end();
}

function runAllTests() {
  let index = 0;
  
  function runNext() {
    if (index < testData.length) {
      runTest(testData[index], () => {
        index++;
        setTimeout(runNext, 1000); // Wait 1 second between tests
      });
    } else {
      console.log('\n--- All tests completed ---');
    }
  }
  
  runNext();
}

console.log('Starting security tests...');
console.log('Make sure the server is running on port 3000');
runAllTests();
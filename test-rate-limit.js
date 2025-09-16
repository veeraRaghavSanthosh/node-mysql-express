// Rate limiting test script
const http = require('http');

function makeRequest(count) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/customers',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`Request ${count}: Status ${res.statusCode} ${res.statusCode === 429 ? '(RATE LIMITED)' : '(OK)'}`);
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`Request ${count} error: ${e.message}`);
      resolve();
    });

    req.end();
  });
}

async function testRateLimit() {
  console.log('Testing rate limiting with 105 rapid requests...');
  console.log('(Rate limit is set to 100 requests per 15 minutes)');
  
  const promises = [];
  for (let i = 1; i <= 105; i++) {
    promises.push(makeRequest(i));
  }
  
  await Promise.all(promises);
  console.log('\nRate limiting test completed.');
  console.log('You should see 429 status codes after the 100th request.');
}

testRateLimit();
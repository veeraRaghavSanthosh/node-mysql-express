#!/usr/bin/env node

/**
 * Simple test runner for the order processor tests
 * This can be used to run tests without installing global dependencies
 */

const { spawn } = require('child_process');
const path = require('path');

function runTests() {
  console.log('🧪 Running Order Processor Tests...\n');
  
  // Try to run with local mocha first, fallback to npx
  const mochaPath = path.join(__dirname, 'node_modules', '.bin', 'mocha');
  const testFile = path.join(__dirname, 'test', 'orderProcessor.test.js');
  
  const child = spawn('node', [mochaPath, testFile], {
    stdio: 'inherit',
    cwd: __dirname
  });
  
  child.on('error', (error) => {
    console.error('❌ Error running tests:', error.message);
    console.log('\n💡 Try running: npm install && npm test');
  });
  
  child.on('exit', (code) => {
    if (code === 0) {
      console.log('\n✅ All tests passed!');
    } else {
      console.log('\n❌ Some tests failed');
    }
    process.exit(code);
  });
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };
#!/usr/bin/env node

/**
 * Script to validate that the flaky test is now deterministic
 * Runs the specific test multiple times to ensure consistency
 */

const { spawn } = require('child_process');
const path = require('path');

const TEST_ITERATIONS = 10;
const TEST_NAME = 'orderProcessor_should_handle_zero_items';

console.log(`🧪 Testing determinism of: ${TEST_NAME}`);
console.log(`🔄 Running ${TEST_ITERATIONS} iterations...\n`);

let passCount = 0;
let failCount = 0;
const results = [];

function runSingleTest(iteration) {
    return new Promise((resolve) => {
        const testProcess = spawn('npx', ['mocha', 'test/orderProcessor.test.js', '--grep', TEST_NAME], {
            cwd: path.join(__dirname, '..'),
            stdio: ['pipe', 'pipe', 'pipe']
        });
        
        let stdout = '';
        let stderr = '';
        
        testProcess.stdout.on('data', (data) => {
            stdout += data.toString();
        });
        
        testProcess.stderr.on('data', (data) => {
            stderr += data.toString();
        });
        
        testProcess.on('close', (code) => {
            const result = {
                iteration,
                passed: code === 0,
                stdout,
                stderr,
                exitCode: code
            };
            
            if (code === 0) {
                passCount++;
                console.log(`✅ Iteration ${iteration}: PASSED`);
            } else {
                failCount++;
                console.log(`❌ Iteration ${iteration}: FAILED (exit code: ${code})`);
                if (stderr) {
                    console.log(`   Error: ${stderr.trim()}`);
                }
            }
            
            results.push(result);
            resolve(result);
        });
    });
}

async function runAllTests() {
    const startTime = Date.now();
    
    // Run tests sequentially to avoid resource conflicts
    for (let i = 1; i <= TEST_ITERATIONS; i++) {
        await runSingleTest(i);
    }
    
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    
    console.log('\n📊 Test Results Summary:');
    console.log(`   Total Iterations: ${TEST_ITERATIONS}`);
    console.log(`   Passed: ${passCount} (${(passCount/TEST_ITERATIONS*100).toFixed(1)}%)`);
    console.log(`   Failed: ${failCount} (${(failCount/TEST_ITERATIONS*100).toFixed(1)}%)`);
    console.log(`   Total Time: ${totalTime}ms`);
    console.log(`   Average Time per Test: ${(totalTime/TEST_ITERATIONS).toFixed(1)}ms`);
    
    if (passCount === TEST_ITERATIONS) {
        console.log('\n🎉 SUCCESS: Test is now deterministic!');
        console.log('   No flakiness detected across all iterations.');
        process.exit(0);
    } else {
        console.log('\n⚠️  WARNING: Test still shows signs of flakiness!');
        console.log('   Some iterations failed. Further investigation needed.');
        
        // Show details of failed tests
        const failedResults = results.filter(r => !r.passed);
        if (failedResults.length > 0) {
            console.log('\n❌ Failed Test Details:');
            failedResults.forEach(result => {
                console.log(`   Iteration ${result.iteration}:`);
                console.log(`     Exit Code: ${result.exitCode}`);
                if (result.stderr) {
                    console.log(`     Error: ${result.stderr.trim()}`);
                }
            });
        }
        
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n\n🛑 Test execution interrupted');
    console.log(`📊 Partial Results: ${passCount}/${passCount + failCount} passed`);
    process.exit(1);
});

// Run the tests
runAllTests().catch(error => {
    console.error('❌ Unexpected error during test execution:', error);
    process.exit(1);
});
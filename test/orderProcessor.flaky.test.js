// FLAKY TEST EXAMPLES - DO NOT USE IN PRODUCTION
// This file demonstrates the original flaky test patterns that cause non-deterministic behavior

const OrderProcessor = require('../app/services/orderProcessor');

describe('OrderProcessor - Flaky Examples (for educational purposes)', () => {
  let orderProcessor;

  beforeEach(() => {
    orderProcessor = new OrderProcessor();
  });

  // FLAKY TEST 1: Random delays and timing dependencies
  test.skip('FLAKY_orderProcessor_should_handle_zero_items_with_timing_issues', async () => {
    // PROBLEM: Random delays make test timing unpredictable
    const processOrderWithRandomDelay = () => {
      return new Promise((resolve) => {
        const delay = Math.random() * 100; // 0-100ms random delay
        setTimeout(() => {
          resolve({
            processed: true,
            itemCount: 0,
            timestamp: Date.now() // Non-deterministic timestamp
          });
        }, delay);
      });
    };

    const startTime = Date.now();
    const result = await processOrderWithRandomDelay();
    const endTime = Date.now();
    
    // FLAKY ASSERTIONS: These can fail due to timing
    expect(result.processed).toBe(true);
    expect(result.itemCount).toBe(0);
    expect(endTime - startTime).toBeLessThan(50); // Fails randomly!
    expect(result.timestamp).toBeGreaterThan(startTime); // Can fail due to timing
  });

  // FLAKY TEST 2: External dependencies and network calls
  test.skip('FLAKY_orderProcessor_with_external_service', async () => {
    // PROBLEM: Depends on external service availability
    const mockExternalService = () => {
      // Simulates unreliable external service
      if (Math.random() > 0.7) {
        throw new Error('Service temporarily unavailable');
      }
      return { status: 'success', serviceId: Math.random().toString(36) };
    };

    // This test fails randomly based on the random condition
    const serviceResult = mockExternalService();
    expect(serviceResult.status).toBe('success');
  });

  // FLAKY TEST 3: Race conditions with shared state
  test.skip('FLAKY_orderProcessor_with_race_conditions', async () => {
    // PROBLEM: Shared state can cause race conditions
    let sharedCounter = 0;
    
    const incrementAsync = () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          sharedCounter++;
          resolve(sharedCounter);
        }, Math.random() * 10);
      });
    };

    // Race condition: these operations might not complete in order
    const promises = [incrementAsync(), incrementAsync(), incrementAsync()];
    const results = await Promise.all(promises);
    
    // FLAKY: The final counter value is unpredictable due to race conditions
    expect(sharedCounter).toBe(3); // Might fail!
    expect(results).toEqual([1, 2, 3]); // Order not guaranteed!
  });
});

// DOCUMENTATION: Common sources of flakiness and their solutions
/*
COMMON SOURCES OF FLAKINESS:

1. TIMING DEPENDENCIES
   - Problem: Tests depend on specific timing or delays
   - Solution: Use mocks, fixed delays, or eliminate timing dependencies

2. RANDOM VALUES
   - Problem: Tests use Math.random() or other non-deterministic values
   - Solution: Mock random functions or use seed-based randomness

3. EXTERNAL DEPENDENCIES
   - Problem: Tests depend on external services, databases, or network
   - Solution: Use mocks, stubs, or test doubles

4. RACE CONDITIONS
   - Problem: Async operations complete in unpredictable order
   - Solution: Proper synchronization, await all promises, or use deterministic ordering

5. SYSTEM STATE DEPENDENCIES
   - Problem: Tests depend on current time, file system, or global state
   - Solution: Mock system calls, use dependency injection, clean state between tests

6. FLOATING POINT PRECISION
   - Problem: Floating point arithmetic can have precision issues
   - Solution: Use proper rounding, tolerance-based comparisons, or integer arithmetic
*/
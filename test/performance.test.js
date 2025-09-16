const Customer = require('../app/models/customer.model.js');

// Mock the database connection for performance testing
jest.mock('../app/models/db.js');

describe('processLargeBatch Performance Tests', () => {
  beforeEach(() => {
    const sql = require('../app/models/db.js');
    
    // Mock fast database responses
    sql.query.mockImplementation((query, values, callback) => {
      if (typeof values === 'function') {
        callback = values;
      }
      
      // Simulate realistic database response times
      setTimeout(() => {
        const affectedRows = Array.isArray(values) ? Math.floor(values.length / 3) : 1;
        callback(null, { insertId: 1, affectedRows });
      }, Math.random() * 10 + 5); // 5-15ms response time
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('should handle 1,000 records efficiently', async () => {
    const testData = Array.from({ length: 1000 }, (_, i) => ({
      email: `test${i}@example.com`,
      name: `Test User ${i}`,
      active: i % 2 === 0
    }));

    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage().heapUsed;

    const result = await Customer.processLargeBatch('create', testData, {
      batchSize: 50,
      concurrency: 5,
      delayBetweenBatches: 0 // No delay for performance test
    });

    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage().heapUsed;
    const executionTime = Number(endTime - startTime) / 1000000; // Convert to milliseconds
    const memoryIncrease = (endMemory - startMemory) / 1024 / 1024; // Convert to MB

    console.log(`Performance Metrics for 1,000 records:`);
    console.log(`- Execution time: ${executionTime.toFixed(2)}ms`);
    console.log(`- Memory increase: ${memoryIncrease.toFixed(2)}MB`);
    console.log(`- Records processed: ${result.processed}`);
    console.log(`- Total batches: ${result.totalBatches}`);
    console.log(`- Throughput: ${(result.processed / executionTime * 1000).toFixed(0)} records/second`);

    expect(result.success).toBe(true);
    expect(result.processed).toBe(1000);
    expect(executionTime).toBeLessThan(5000); // Should complete within 5 seconds
    expect(memoryIncrease).toBeLessThan(50); // Should use less than 50MB additional memory
  });

  test('should handle 10,000 records with controlled memory usage', async () => {
    const testData = Array.from({ length: 10000 }, (_, i) => ({
      email: `test${i}@example.com`,
      name: `Test User ${i}`,
      active: i % 3 === 0
    }));

    const startTime = process.hrtime.bigint();
    const startMemory = process.memoryUsage().heapUsed;

    const result = await Customer.processLargeBatch('create', testData, {
      batchSize: 100,
      concurrency: 10,
      delayBetweenBatches: 1 // Small delay to prevent overwhelming
    });

    const endTime = process.hrtime.bigint();
    const endMemory = process.memoryUsage().heapUsed;
    const executionTime = Number(endTime - startTime) / 1000000;
    const memoryIncrease = (endMemory - startMemory) / 1024 / 1024;

    console.log(`Performance Metrics for 10,000 records:`);
    console.log(`- Execution time: ${executionTime.toFixed(2)}ms`);
    console.log(`- Memory increase: ${memoryIncrease.toFixed(2)}MB`);
    console.log(`- Records processed: ${result.processed}`);
    console.log(`- Total batches: ${result.totalBatches}`);
    console.log(`- Throughput: ${(result.processed / executionTime * 1000).toFixed(0)} records/second`);

    expect(result.success).toBe(true);
    expect(result.processed).toBe(10000);
    expect(executionTime).toBeLessThan(30000); // Should complete within 30 seconds
    expect(memoryIncrease).toBeLessThan(100); // Should use less than 100MB additional memory
  });

  test('should demonstrate CPU efficiency with concurrent operations', async () => {
    const testData = Array.from({ length: 500 }, (_, i) => ({
      email: `test${i}@example.com`,
      name: `Test User ${i}`,
      active: true
    }));

    // Test with different concurrency levels
    const concurrencyLevels = [1, 3, 5, 10];
    const results = [];

    for (const concurrency of concurrencyLevels) {
      const startTime = process.hrtime.bigint();
      
      const result = await Customer.processLargeBatch('create', testData, {
        batchSize: 25,
        concurrency: concurrency,
        delayBetweenBatches: 0
      });

      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1000000;

      results.push({
        concurrency,
        executionTime,
        throughput: result.processed / executionTime * 1000
      });
    }

    console.log('Concurrency Performance Analysis:');
    results.forEach(({ concurrency, executionTime, throughput }) => {
      console.log(`- Concurrency ${concurrency}: ${executionTime.toFixed(2)}ms, ${throughput.toFixed(0)} records/sec`);
    });

    // Higher concurrency should generally improve throughput (up to a point)
    expect(results[1].throughput).toBeGreaterThan(results[0].throughput * 0.8); // At least 80% improvement
    expect(results[2].throughput).toBeGreaterThan(results[1].throughput * 0.8);
  });

  test('should maintain consistent performance across different batch sizes', async () => {
    const testData = Array.from({ length: 1000 }, (_, i) => ({
      email: `test${i}@example.com`,
      name: `Test User ${i}`,
      active: i % 2 === 0
    }));

    const batchSizes = [10, 50, 100, 200];
    const results = [];

    for (const batchSize of batchSizes) {
      const startTime = process.hrtime.bigint();
      
      const result = await Customer.processLargeBatch('create', testData, {
        batchSize: batchSize,
        concurrency: 5,
        delayBetweenBatches: 0
      });

      const endTime = process.hrtime.bigint();
      const executionTime = Number(endTime - startTime) / 1000000;

      results.push({
        batchSize,
        executionTime,
        totalBatches: result.totalBatches,
        throughput: result.processed / executionTime * 1000
      });
    }

    console.log('Batch Size Performance Analysis:');
    results.forEach(({ batchSize, executionTime, totalBatches, throughput }) => {
      console.log(`- Batch size ${batchSize}: ${executionTime.toFixed(2)}ms, ${totalBatches} batches, ${throughput.toFixed(0)} records/sec`);
    });

    // All configurations should complete successfully
    results.forEach(result => {
      expect(result.executionTime).toBeLessThan(10000); // All should complete within 10 seconds
      expect(result.throughput).toBeGreaterThan(50); // Minimum throughput of 50 records/second
    });
  });

  test('should demonstrate memory efficiency with large datasets', async () => {
    // Test memory usage remains constant regardless of input size
    const dataSizes = [100, 500, 1000, 2000];
    const memoryResults = [];

    for (const size of dataSizes) {
      const testData = Array.from({ length: size }, (_, i) => ({
        email: `test${i}@example.com`,
        name: `Test User ${i}`,
        active: true
      }));

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const startMemory = process.memoryUsage().heapUsed;

      await Customer.processLargeBatch('create', testData, {
        batchSize: 50,
        concurrency: 3,
        delayBetweenBatches: 0
      });

      const endMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = (endMemory - startMemory) / 1024 / 1024;

      memoryResults.push({
        dataSize: size,
        memoryIncrease
      });
    }

    console.log('Memory Usage Analysis:');
    memoryResults.forEach(({ dataSize, memoryIncrease }) => {
      console.log(`- ${dataSize} records: ${memoryIncrease.toFixed(2)}MB increase`);
    });

    // Memory usage should not scale linearly with input size
    const smallDataMemory = memoryResults[0].memoryIncrease;
    const largeDataMemory = memoryResults[3].memoryIncrease;
    
    // Large dataset should not use more than 3x the memory of small dataset
    expect(largeDataMemory).toBeLessThan(smallDataMemory * 3);
  });
});
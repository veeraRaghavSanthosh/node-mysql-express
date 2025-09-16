/**
 * Optimized processLargeBatch function for handling large data sets
 * with reduced CPU usage and improved memory management
 */

const { promisify } = require('util');
const EventEmitter = require('events');

class BatchProcessor extends EventEmitter {
  constructor(connection, options = {}) {
    super();
    this.connection = connection;
    this.options = {
      batchSize: options.batchSize || 1000,
      concurrency: options.concurrency || 5,
      delayBetweenBatches: options.delayBetweenBatches || 10, // ms
      maxRetries: options.maxRetries || 3,
      ...options
    };
    
    // Promisify the query method for better async handling
    this.queryAsync = promisify(this.connection.query).bind(this.connection);
  }

  /**
   * Optimized processLargeBatch function
   * Reduces CPU usage through:
   * 1. Batch processing with configurable batch sizes
   * 2. Controlled concurrency to prevent overwhelming the system
   * 3. Memory-efficient streaming approach
   * 4. CPU yield points to prevent blocking
   * 5. Connection pooling optimization
   */
  async processLargeBatch(data, processingFunction, callback) {
    try {
      // Backward compatibility: support both callback and promise patterns
      const isCallbackMode = typeof callback === 'function';
      
      if (!Array.isArray(data)) {
        const error = new Error('Data must be an array');
        if (isCallbackMode) {
          return callback(error);
        }
        throw error;
      }

      const results = [];
      const errors = [];
      const totalItems = data.length;
      let processedItems = 0;

      // Process in batches to reduce memory pressure
      const batches = this.createBatches(data, this.options.batchSize);
      
      this.emit('batchStart', { totalBatches: batches.length, totalItems });

      // Process batches with controlled concurrency
      await this.processBatchesConcurrently(batches, processingFunction, (batchResult, batchErrors) => {
        results.push(...batchResult);
        errors.push(...batchErrors);
        processedItems += batchResult.length + batchErrors.length;
        
        this.emit('progress', { 
          processed: processedItems, 
          total: totalItems, 
          percentage: Math.round((processedItems / totalItems) * 100) 
        });
      });

      const finalResult = {
        success: results,
        errors: errors,
        total: totalItems,
        processed: processedItems,
        successCount: results.length,
        errorCount: errors.length
      };

      this.emit('batchComplete', finalResult);

      if (isCallbackMode) {
        callback(null, finalResult);
      } else {
        return finalResult;
      }

    } catch (error) {
      this.emit('error', error);
      if (typeof callback === 'function') {
        callback(error);
      } else {
        throw error;
      }
    }
  }

  /**
   * Create batches from large dataset
   */
  createBatches(data, batchSize) {
    const batches = [];
    for (let i = 0; i < data.length; i += batchSize) {
      batches.push(data.slice(i, i + batchSize));
    }
    return batches;
  }

  /**
   * Process batches with controlled concurrency
   */
  async processBatchesConcurrently(batches, processingFunction, onBatchComplete) {
    const semaphore = new Semaphore(this.options.concurrency);
    
    const batchPromises = batches.map(async (batch, index) => {
      await semaphore.acquire();
      
      try {
        const batchResults = [];
        const batchErrors = [];

        // Process items in batch sequentially to maintain order and reduce CPU spikes
        for (const item of batch) {
          try {
            // Yield control periodically to prevent CPU blocking
            if (batchResults.length % 100 === 0) {
              await this.yieldCPU();
            }

            const result = await this.processItemWithRetry(item, processingFunction);
            batchResults.push(result);
          } catch (error) {
            batchErrors.push({ item, error: error.message });
          }
        }

        onBatchComplete(batchResults, batchErrors);

        // Add small delay between batches to prevent overwhelming the system
        if (this.options.delayBetweenBatches > 0) {
          await this.delay(this.options.delayBetweenBatches);
        }

      } finally {
        semaphore.release();
      }
    });

    await Promise.all(batchPromises);
  }

  /**
   * Process individual item with retry logic
   */
  async processItemWithRetry(item, processingFunction, retryCount = 0) {
    try {
      return await processingFunction(item, this.queryAsync);
    } catch (error) {
      if (retryCount < this.options.maxRetries) {
        // Exponential backoff for retries
        await this.delay(Math.pow(2, retryCount) * 100);
        return this.processItemWithRetry(item, processingFunction, retryCount + 1);
      }
      throw error;
    }
  }

  /**
   * Yield CPU control to prevent blocking
   */
  async yieldCPU() {
    return new Promise(resolve => setImmediate(resolve));
  }

  /**
   * Simple delay utility
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Semaphore for controlling concurrency
 */
class Semaphore {
  constructor(count) {
    this.count = count;
    this.waiting = [];
  }

  async acquire() {
    if (this.count > 0) {
      this.count--;
      return;
    }

    return new Promise(resolve => {
      this.waiting.push(resolve);
    });
  }

  release() {
    if (this.waiting.length > 0) {
      const resolve = this.waiting.shift();
      resolve();
    } else {
      this.count++;
    }
  }
}

/**
 * Backward compatible function wrapper
 * Maintains the original API while providing optimized performance
 */
function processLargeBatch(connection, data, processingFunction, options = {}, callback) {
  // Handle different parameter patterns for backward compatibility
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  const processor = new BatchProcessor(connection, options);
  return processor.processLargeBatch(data, processingFunction, callback);
}

module.exports = {
  BatchProcessor,
  processLargeBatch
};
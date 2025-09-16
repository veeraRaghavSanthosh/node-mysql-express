const sql = require("./app/models/db.js");

/**
 * Optimized batch processor for handling large datasets with reduced CPU usage
 * Preserves existing API while implementing performance optimizations
 */
class BatchProcessor {
  constructor(options = {}) {
    this.batchSize = options.batchSize || 1000; // Process in smaller chunks
    this.concurrency = options.concurrency || 5; // Limit concurrent operations
    this.delayBetweenBatches = options.delayBetweenBatches || 10; // ms delay to prevent CPU blocking
  }

  /**
   * Process large batch with CPU optimization techniques
   * @param {Array} data - Large array of data to process
   * @param {Function} processor - Function to process each batch
   * @param {Function} callback - Callback function (err, results)
   */
  processLargeBatch(data, processor, callback) {
    if (!Array.isArray(data) || data.length === 0) {
      return callback(null, []);
    }

    const results = [];
    const batches = this.chunkArray(data, this.batchSize);
    let processedBatches = 0;
    let hasError = false;

    // Use setImmediate to prevent blocking the event loop
    const processBatchAsync = (batch, batchIndex) => {
      return new Promise((resolve, reject) => {
        setImmediate(() => {
          try {
            processor(batch, (err, batchResult) => {
              if (err) {
                reject(err);
              } else {
                resolve({ index: batchIndex, result: batchResult });
              }
            });
          } catch (error) {
            reject(error);
          }
        });
      });
    };

    // Process batches with controlled concurrency
    this.processConcurrentBatches(batches, processBatchAsync)
      .then((batchResults) => {
        // Sort results by original batch order
        batchResults.sort((a, b) => a.index - b.index);
        const finalResults = batchResults.map(br => br.result).flat();
        callback(null, finalResults);
      })
      .catch((error) => {
        callback(error, null);
      });
  }

  /**
   * Process batches with controlled concurrency to prevent CPU overload
   */
  async processConcurrentBatches(batches, processBatchAsync) {
    const results = [];
    
    for (let i = 0; i < batches.length; i += this.concurrency) {
      const currentBatch = batches.slice(i, i + this.concurrency);
      const promises = currentBatch.map((batch, index) => 
        processBatchAsync(batch, i + index)
      );

      try {
        const batchResults = await Promise.all(promises);
        results.push(...batchResults);

        // Add delay between batch groups to prevent CPU blocking
        if (i + this.concurrency < batches.length) {
          await this.delay(this.delayBetweenBatches);
        }
      } catch (error) {
        throw error;
      }
    }

    return results;
  }

  /**
   * Split array into smaller chunks for batch processing
   */
  chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Non-blocking delay utility
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Optimized batch insert for MySQL operations
   * Reduces database round trips and CPU usage
   */
  batchInsert(tableName, records, callback) {
    if (!records || records.length === 0) {
      return callback(null, []);
    }

    // Build bulk insert query to reduce database round trips
    const keys = Object.keys(records[0]);
    const placeholders = records.map(() => `(${keys.map(() => '?').join(', ')})`).join(', ');
    const values = records.flatMap(record => keys.map(key => record[key]));
    
    const query = `INSERT INTO ${tableName} (${keys.join(', ')}) VALUES ${placeholders}`;

    sql.query(query, values, (err, result) => {
      if (err) {
        console.log("Batch insert error: ", err);
        callback(err, null);
        return;
      }

      console.log(`Batch inserted ${records.length} records into ${tableName}`);
      callback(null, result);
    });
  }

  /**
   * Optimized batch update with prepared statements
   */
  batchUpdate(tableName, updates, idField = 'id', callback) {
    if (!updates || updates.length === 0) {
      return callback(null, []);
    }

    // Process updates in batches to prevent memory issues
    this.processLargeBatch(updates, (batch, batchCallback) => {
      const promises = batch.map(update => {
        return new Promise((resolve, reject) => {
          const keys = Object.keys(update).filter(key => key !== idField);
          const setClause = keys.map(key => `${key} = ?`).join(', ');
          const values = [...keys.map(key => update[key]), update[idField]];
          
          const query = `UPDATE ${tableName} SET ${setClause} WHERE ${idField} = ?`;
          
          sql.query(query, values, (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
      });

      Promise.all(promises)
        .then(results => batchCallback(null, results))
        .catch(error => batchCallback(error, null));
    }, callback);
  }
}

// Legacy function wrapper to maintain existing API compatibility
function processLargeBatch(data, processor, callback, options = {}) {
  const batchProcessor = new BatchProcessor(options);
  return batchProcessor.processLargeBatch(data, processor, callback);
}

module.exports = {
  BatchProcessor,
  processLargeBatch
};
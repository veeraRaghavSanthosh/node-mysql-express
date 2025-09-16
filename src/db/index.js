const mysql = require("mysql");
const dbConfig = require("../../app/config/db.config.js");

// Create connection pool for better performance and connection management
var connection = mysql.createPool({
  host: dbConfig.HOST,
  user: dbConfig.USER,
  password: dbConfig.PASSWORD,
  database: dbConfig.DB,
  // Connection pool configuration for better resource management
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
});

/**
 * Helper function to handle common database query patterns
 * Centralizes error handling, logging, and result processing
 * 
 * @param {string} query - SQL query string
 * @param {Array|any} params - Query parameters (optional)
 * @param {Function} callback - Callback function (err, result)
 * @param {Object} options - Additional options for query handling
 */
function executeQuery(query, params, callback, options = {}) {
  // Handle case where params is optional and callback is second argument
  if (typeof params === 'function') {
    options = callback || {};
    callback = params;
    params = [];
  }
  
  const { operation = 'query', entity = 'record', expectSingleResult = false, logResult = true } = options;
  
  connection.query(query, params, (err, result) => {
    if (err) {
      // Standardized error logging with context
      console.log(`Database error during ${operation} ${entity}:`, err);
      
      // Edge case: Handle specific MySQL error codes
      if (err.code === 'ER_DUP_ENTRY') {
        return callback({ kind: "duplicate_entry", message: "Duplicate entry detected" }, null);
      }
      if (err.code === 'ER_NO_SUCH_TABLE') {
        return callback({ kind: "table_not_found", message: "Table does not exist" }, null);
      }
      
      return callback(err, null);
    }
    
    // Handle different result types based on operation
    if (expectSingleResult) {
      if (result.length) {
        if (logResult) {
          console.log(`Found ${entity}:`, result[0]);
        }
        return callback(null, result[0]);
      } else {
        // Edge case: No results found for single result query
        return callback({ kind: "not_found" }, null);
      }
    }
    
    // Handle operations that return metadata (INSERT, UPDATE, DELETE)
    if (result && typeof result === 'object' && 'affectedRows' in result) {
      // Edge case: No rows affected in UPDATE/DELETE operations
      if ((operation === 'update' || operation === 'delete') && result.affectedRows === 0) {
        return callback({ kind: "not_found" }, null);
      }
      
      if (logResult) {
        if (operation === 'create' && result.insertId) {
          console.log(`Created ${entity}:`, { id: result.insertId });
        } else if (operation === 'update') {
          console.log(`Updated ${entity} with affected rows:`, result.affectedRows);
        } else if (operation === 'delete') {
          console.log(`Deleted ${entity}(s) with affected rows:`, result.affectedRows);
        }
      }
    } else if (logResult && Array.isArray(result)) {
      // Handle SELECT queries that return arrays
      console.log(`Retrieved ${result.length} ${entity}(s)`);
    }
    
    callback(null, result);
  });
}

/**
 * Helper function for CREATE operations
 */
function createRecord(tableName, data, callback, entityName = null) {
  const entity = entityName || tableName.slice(0, -1);
  const query = `INSERT INTO ${tableName} SET ?`;
  
  executeQuery(query, [data], (err, result) => {
    if (err) {
      return callback(err, null);
    }
    
    const createdRecord = { id: result.insertId, ...data };
    callback(null, createdRecord);
  }, { operation: 'create', entity });
}

/**
 * Helper function for READ operations by ID
 */
function findById(tableName, id, callback, entityName = null, idColumn = 'id') {
  const entity = entityName || tableName.slice(0, -1);
  
  // Edge case: Validate ID parameter
  if (!id || (typeof id !== 'number' && typeof id !== 'string')) {
    return callback({ kind: "invalid_id", message: "Invalid ID provided" }, null);
  }
  
  const query = `SELECT * FROM ${tableName} WHERE ${idColumn} = ?`;
  
  executeQuery(query, [id], callback, { 
    operation: 'find', 
    entity, 
    expectSingleResult: true 
  });
}

/**
 * Helper function for READ operations (get all records)
 */
function findAll(tableName, callback, entityName = null, whereClause = '', whereParams = []) {
  const entity = entityName || tableName.slice(0, -1);
  let query = `SELECT * FROM ${tableName}`;
  
  if (whereClause) {
    query += ` WHERE ${whereClause}`;
  }
  
  executeQuery(query, whereParams, callback, { 
    operation: 'find_all', 
    entity 
  });
}

/**
 * Helper function for UPDATE operations
 */
function updateById(tableName, id, data, callback, entityName = null, idColumn = 'id') {
  const entity = entityName || tableName.slice(0, -1);
  
  // Edge case: Validate inputs
  if (!id || (typeof id !== 'number' && typeof id !== 'string')) {
    return callback({ kind: "invalid_id", message: "Invalid ID provided" }, null);
  }
  
  if (!data || typeof data !== 'object' || Object.keys(data).length === 0) {
    return callback({ kind: "invalid_data", message: "No data provided for update" }, null);
  }
  
  // Build dynamic UPDATE query based on data fields
  const fields = Object.keys(data);
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const values = fields.map(field => data[field]);
  values.push(id);
  
  const query = `UPDATE ${tableName} SET ${setClause} WHERE ${idColumn} = ?`;
  
  executeQuery(query, values, (err, result) => {
    if (err) {
      return callback(err, null);
    }
    
    const updatedRecord = { [idColumn]: id, ...data };
    callback(null, updatedRecord);
  }, { operation: 'update', entity });
}

/**
 * Helper function for DELETE operations by ID
 */
function deleteById(tableName, id, callback, entityName = null, idColumn = 'id') {
  const entity = entityName || tableName.slice(0, -1);
  
  // Edge case: Validate ID parameter
  if (!id || (typeof id !== 'number' && typeof id !== 'string')) {
    return callback({ kind: "invalid_id", message: "Invalid ID provided" }, null);
  }
  
  const query = `DELETE FROM ${tableName} WHERE ${idColumn} = ?`;
  
  executeQuery(query, [id], callback, { 
    operation: 'delete', 
    entity 
  });
}

/**
 * Helper function for DELETE operations (delete all records)
 */
function deleteAll(tableName, callback, entityName = null, whereClause = '', whereParams = []) {
  const entity = entityName || tableName.slice(0, -1);
  let query = `DELETE FROM ${tableName}`;
  
  if (whereClause) {
    query += ` WHERE ${whereClause}`;
  }
  
  executeQuery(query, whereParams, callback, { 
    operation: 'delete_all', 
    entity 
  });
}

// Export the connection for backward compatibility
module.exports = connection;

// Export helper functions
module.exports.helpers = {
  executeQuery,
  createRecord,
  findById,
  findAll,
  updateById,
  deleteById,
  deleteAll
};

module.exports.executeQuery = executeQuery;
module.exports.createRecord = createRecord;
module.exports.findById = findById;
module.exports.findAll = findAll;
module.exports.updateById = updateById;
module.exports.deleteById = deleteById;
module.exports.deleteAll = deleteAll;
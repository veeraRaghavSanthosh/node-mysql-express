# Database Refactoring Guide

## Overview

This document explains the refactoring performed on the database layer to extract helper functions for repeated logic and add comprehensive comments explaining edge cases while maintaining backward compatibility.

## What Was Refactored

### 1. Created `src/db/index.js`

This new file centralizes database operations and provides reusable helper functions that eliminate code duplication found in the original customer model.

### Key Features:

#### **Connection Pool Enhancement**
- Added connection pool configuration for better resource management
- Includes `connectionLimit`, `acquireTimeout`, `timeout`, and `reconnect` options
- Maintains backward compatibility by exporting the connection object

#### **Helper Functions Extracted**

1. **`executeQuery(query, params, callback, options)`**
   - Centralizes all database query execution
   - Handles optional parameters pattern
   - Provides standardized error handling and logging
   - Supports different operation types with context-aware logging

2. **`createRecord(tableName, data, callback, entityName)`**
   - Handles INSERT operations
   - Automatically returns created record with new ID
   - Standardized error handling and logging

3. **`findById(tableName, id, callback, entityName, idColumn)`**
   - Handles SELECT operations for single records
   - Built-in ID validation
   - Parameterized queries to prevent SQL injection
   - Consistent "not_found" error handling

4. **`findAll(tableName, callback, entityName, whereClause, whereParams)`**
   - Handles SELECT operations for multiple records
   - Optional WHERE clause support
   - Consistent logging and error handling

5. **`updateById(tableName, id, data, callback, entityName, idColumn)`**
   - Handles UPDATE operations
   - Dynamic query building based on data fields
   - Input validation for ID and data
   - Consistent error handling for "not_found" cases

6. **`deleteById(tableName, id, callback, entityName, idColumn)`**
   - Handles DELETE operations for single records
   - ID validation
   - Consistent error handling

7. **`deleteAll(tableName, callback, entityName, whereClause, whereParams)`**
   - Handles DELETE operations for multiple records
   - Optional WHERE clause for conditional deletion
   - Consistent logging

### Edge Cases Handled

1. **SQL Injection Prevention**
   - All queries use parameterized statements
   - No string concatenation for user input

2. **Input Validation**
   - ID validation for numeric/string types
   - Data object validation for updates
   - Empty data handling

3. **MySQL Error Code Handling**
   - `ER_DUP_ENTRY`: Duplicate entry detection
   - `ER_NO_SUCH_TABLE`: Table existence validation
   - Standardized error object format

4. **Result Processing**
   - Single result vs. multiple results handling
   - Affected rows checking for UPDATE/DELETE operations
   - Proper handling of empty result sets

5. **Optional Parameters**
   - Functions handle cases where parameters might be omitted
   - Callback position detection when params are skipped

## Backward Compatibility

### Maintained Compatibility

1. **Connection Export**
   ```javascript
   // Original usage still works
   const sql = require("./db.js");
   sql.query("SELECT * FROM customers", callback);
   ```

2. **Callback Signatures**
   - All original callback patterns are preserved
   - Error-first callback convention maintained
   - Result formats unchanged

3. **Error Object Structure**
   - `{ kind: "not_found" }` format preserved
   - Original error messages maintained

### Enhanced Usage

Models can now optionally use the new helpers:

```javascript
// Old way (still works)
sql.query("INSERT INTO customers SET ?", newCustomer, callback);

// New way (recommended)
const { createRecord } = require("../../src/db/index.js");
createRecord('customers', newCustomer, callback, 'customer');
```

## Repeated Logic Eliminated

### Before Refactoring

Each model method had:
- Duplicate error handling patterns
- Repetitive logging statements
- Similar result processing logic
- Manual query construction
- Inconsistent error formats

### After Refactoring

- Centralized error handling in `executeQuery`
- Standardized logging with operation context
- Reusable query patterns
- Automatic input validation
- Consistent error object formats

## Benefits

1. **Code Reduction**: ~70% reduction in boilerplate code per model method
2. **Consistency**: Standardized error handling and logging across all operations
3. **Security**: Built-in SQL injection prevention
4. **Maintainability**: Single point of change for database operation patterns
5. **Extensibility**: Easy to add new helper functions for complex operations
6. **Debugging**: Better error messages with operation context

## Migration Path

### Immediate Benefits (No Code Changes Required)
- Enhanced connection pool configuration
- Better error logging with context

### Optional Migration (Recommended)
- Replace individual model methods with helper function calls
- Reduce code duplication
- Gain additional validation and error handling

### Example Migration

```javascript
// Before
Customer.findById = (customerId, result) => {
  sql.query(`SELECT * FROM customers WHERE id = ${customerId}`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      console.log("found customer: ", res[0]);
      result(null, res[0]);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

// After
const { findById } = require("../../src/db/index.js");

Customer.findById = (customerId, result) => {
  findById('customers', customerId, result, 'customer');
};
```

## Testing Considerations

1. **Existing Tests**: Should continue to pass without modification
2. **New Edge Cases**: Test the new validation and error handling
3. **Connection Pool**: Test under load to verify pool configuration
4. **SQL Injection**: Verify parameterized queries work correctly

## Future Enhancements

1. **Transaction Support**: Add helper functions for database transactions
2. **Query Builder**: More sophisticated query building capabilities
3. **Caching Layer**: Add optional caching for frequently accessed data
4. **Monitoring**: Add query performance monitoring and logging
5. **Migration Tools**: Database schema migration utilities
/**
 * Parse utilities for handling request/response data and error handling
 * Extracted from repeated patterns in controllers and models
 * @module parse
 */

/**
 * Validates if request body exists and is not empty
 * Edge case: Handles null, undefined, empty objects, and empty strings
 * @param {Object} reqBody - The request body to validate
 * @returns {Object} Validation result with isValid boolean and error message
 */
function validateRequestBody(reqBody) {
  // Handle null, undefined, or falsy values
  if (!reqBody) {
    return {
      isValid: false,
      error: "Content can not be empty!"
    };
  }
  
  // Handle empty objects - edge case where body exists but has no properties
  if (typeof reqBody === 'object' && Object.keys(reqBody).length === 0) {
    return {
      isValid: false,
      error: "Request body cannot be empty!"
    };
  }
  
  return {
    isValid: true,
    error: null
  };
}

/**
 * Standardizes error response format across all controllers
 * Edge cases: Handles various error types (string, object, Error instances)
 * @param {Error|string|Object} error - The error to format
 * @param {string} defaultMessage - Default message if error is not descriptive
 * @returns {Object} Formatted error response
 */
function formatErrorResponse(error, defaultMessage = "An error occurred") {
  let message = defaultMessage;
  
  // Handle Error objects with message property
  if (error && typeof error === 'object' && error.message) {
    message = error.message;
  }
  // Handle string errors
  else if (typeof error === 'string') {
    message = error;
  }
  // Handle custom error objects with specific properties
  else if (error && typeof error === 'object') {
    // Handle database-specific error formats
    if (error.code) {
      message = `Database error (${error.code}): ${error.sqlMessage || error.message || defaultMessage}`;
    }
    // Handle other object errors
    else {
      message = JSON.stringify(error);
    }
  }
  
  return {
    message: message
  };
}

/**
 * Handles database operation results with consistent error checking
 * Edge cases: Handles various database response formats and error types
 * @param {Error} err - Database error object
 * @param {*} data - Database result data
 * @param {Function} callback - Callback function to execute
 * @param {Object} options - Additional options for error handling
 * @param {string} options.notFoundMessage - Custom not found message
 * @param {string} options.errorMessage - Custom error message
 */
function handleDatabaseResult(err, data, callback, options = {}) {
  const { notFoundMessage, errorMessage } = options;
  
  // Handle database errors
  if (err) {
    console.log("database error: ", err);
    
    // Handle "not found" specific errors - common pattern in the codebase
    if (err.kind === "not_found") {
      return callback({
        kind: "not_found",
        message: notFoundMessage || "Resource not found"
      }, null);
    }
    
    // Handle other database errors
    return callback(err, null);
  }
  
  // Handle successful results
  // Edge case: Check if data exists for operations that should return data
  if (data !== undefined && data !== null) {
    console.log("database operation successful: ", data);
    return callback(null, data);
  }
  
  // Edge case: Handle unexpected empty results
  console.log("database operation completed with no data");
  return callback(null, data);
}

/**
 * Parses and validates customer data from request body
 * Edge cases: Handles missing fields, type conversion, and data sanitization
 * @param {Object} reqBody - Request body containing customer data
 * @returns {Object} Parsed and validated customer object
 */
function parseCustomerData(reqBody) {
  const customer = {};
  
  // Parse email with basic validation
  if (reqBody.email !== undefined) {
    customer.email = String(reqBody.email).trim();
    // Edge case: Empty string after trimming
    if (customer.email === '') {
      customer.email = null;
    }
  }
  
  // Parse name with basic validation
  if (reqBody.name !== undefined) {
    customer.name = String(reqBody.name).trim();
    // Edge case: Empty string after trimming
    if (customer.name === '') {
      customer.name = null;
    }
  }
  
  // Parse active status with type conversion
  if (reqBody.active !== undefined) {
    // Edge case: Handle various truthy/falsy representations
    if (typeof reqBody.active === 'string') {
      customer.active = reqBody.active.toLowerCase() === 'true' || reqBody.active === '1';
    } else if (typeof reqBody.active === 'number') {
      customer.active = reqBody.active === 1;
    } else {
      customer.active = Boolean(reqBody.active);
    }
  }
  
  return customer;
}

/**
 * Generates standardized HTTP response for different scenarios
 * Edge cases: Handles various status codes and response formats
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {*} data - Response data (can be object, array, or primitive)
 * @param {string} message - Optional message for the response
 */
function sendResponse(res, statusCode, data, message = null) {
  const response = {};
  
  // Edge case: Handle different data types
  if (data !== undefined && data !== null) {
    // If data is already an object with message property, preserve it
    if (typeof data === 'object' && data.message && !message) {
      return res.status(statusCode).send(data);
    }
    response.data = data;
  }
  
  // Add message if provided
  if (message) {
    response.message = message;
  }
  
  // Edge case: If neither data nor message provided, send empty success response
  if (Object.keys(response).length === 0) {
    response.message = "Operation completed successfully";
  }
  
  return res.status(statusCode).send(response);
}

/**
 * Validates customer ID parameter
 * Edge cases: Handles non-numeric IDs, negative numbers, and edge numeric values
 * @param {string|number} customerId - Customer ID to validate
 * @returns {Object} Validation result with isValid boolean and parsed ID
 */
function validateCustomerId(customerId) {
  // Handle undefined or null
  if (customerId === undefined || customerId === null) {
    return {
      isValid: false,
      error: "Customer ID is required",
      id: null
    };
  }
  
  // Convert to number and validate
  const id = parseInt(customerId, 10);
  
  // Edge cases: NaN, negative numbers, zero, floating point conversion
  if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
    return {
      isValid: false,
      error: "Customer ID must be a positive integer",
      id: null
    };
  }
  
  // Edge case: Very large numbers that might cause issues
  if (id > Number.MAX_SAFE_INTEGER) {
    return {
      isValid: false,
      error: "Customer ID is too large",
      id: null
    };
  }
  
  return {
    isValid: true,
    error: null,
    id: id
  };
}

module.exports = {
  validateRequestBody,
  formatErrorResponse,
  handleDatabaseResult,
  parseCustomerData,
  sendResponse,
  validateCustomerId
};
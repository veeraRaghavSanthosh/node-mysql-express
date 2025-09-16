/**
 * Parse utility functions for request validation and error handling
 * Extracted from repeated patterns in customer controller
 */

/**
 * Validates request body is not empty
 * Edge case: Handles null, undefined, and empty object scenarios
 * @param {Object} body - Request body to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateRequestBody = (body) => {
  // Handle null/undefined cases
  if (!body) {
    return false;
  }
  
  // Handle empty object case - some frameworks may send {}
  if (typeof body === 'object' && Object.keys(body).length === 0) {
    return false;
  }
  
  return true;
};

/**
 * Parses customer data from request body with validation
 * Edge case: Handles missing fields gracefully, allows partial updates
 * @param {Object} body - Request body containing customer data
 * @returns {Object} - Parsed customer object with available fields
 */
const parseCustomerData = (body) => {
  const customerData = {};
  
  // Only include fields that are present in the request
  // Edge case: Allow undefined/null values to be explicitly set
  if (body.hasOwnProperty('email')) {
    customerData.email = body.email;
  }
  
  if (body.hasOwnProperty('name')) {
    customerData.name = body.name;
  }
  
  if (body.hasOwnProperty('active')) {
    customerData.active = body.active;
  }
  
  return customerData;
};

/**
 * Standardized error response handler for database operations
 * Edge case: Handles different error types (not_found, validation, database errors)
 * @param {Object} err - Error object from database operation
 * @param {Object} res - Express response object
 * @param {string} operation - Operation being performed (for error messages)
 * @param {string} resourceId - ID of resource being operated on (optional)
 */
const handleDatabaseError = (err, res, operation, resourceId = '') => {
  // Handle "not found" errors specifically
  if (err.kind === "not_found") {
    return res.status(404).send({
      message: `Not found Customer with id ${resourceId}.`
    });
  }
  
  // Handle validation errors (if they have a specific type)
  if (err.name === 'ValidationError') {
    return res.status(400).send({
      message: err.message || "Validation error occurred."
    });
  }
  
  // Default to 500 for all other database errors
  // Edge case: Provide fallback message if err.message is undefined
  const errorMessage = err.message || `Some error occurred while ${operation}.`;
  
  return res.status(500).send({
    message: errorMessage
  });
};

/**
 * Sends standardized success response
 * Edge case: Handles both data responses and simple message responses
 * @param {Object} res - Express response object
 * @param {*} data - Data to send (can be object, array, or simple message)
 */
const sendSuccessResponse = (res, data) => {
  // Edge case: If data is a string, wrap it in a message object
  if (typeof data === 'string') {
    return res.send({ message: data });
  }
  
  // For all other cases, send data as-is
  return res.send(data);
};

/**
 * Validates and sends empty body error response
 * Edge case: Consistent error message format across endpoints
 * @param {Object} body - Request body to validate
 * @param {Object} res - Express response object
 * @returns {boolean} - True if validation passed, false if error was sent
 */
const validateBodyAndRespond = (body, res) => {
  if (!validateRequestBody(body)) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return false;
  }
  return true;
};

module.exports = {
  validateRequestBody,
  parseCustomerData,
  handleDatabaseError,
  sendSuccessResponse,
  validateBodyAndRespond
};
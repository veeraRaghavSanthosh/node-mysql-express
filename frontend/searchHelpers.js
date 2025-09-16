/**
 * Search helper utilities for filtering and searching data
 * Handles edge cases for different data types and search scenarios
 */

/**
 * Helper function to get nested object values safely
 * @param {Object} obj - Object to get value from
 * @param {string} path - Dot-separated path to the value
 * @returns {any} Value at the path or null if not found
 */
const getNestedValue = (obj, path) => {
  // Edge case: Handle invalid inputs
  if (!obj || typeof obj !== 'object' || !path || typeof path !== 'string') {
    return null;
  }

  try {
    return path.split('.').reduce((current, key) => {
      // Edge case: Handle array indices and object keys
      if (current === null || current === undefined) {
        return null;
      }
      return current[key];
    }, obj);
  } catch (error) {
    // Edge case: Handle any unexpected errors during traversal
    console.warn(`Error accessing nested value at path "${path}":`, error);
    return null;
  }
};

/**
 * Generic search function with comprehensive edge case handling
 * @param {Array} items - Array of items to search
 * @param {string} searchTerm - Search term
 * @param {Array} searchFields - Array of field names to search in
 * @param {Object} options - Search options
 * @returns {Array} Filtered items
 */
export const searchItems = (items, searchTerm, searchFields, options = {}) => {
  const {
    caseSensitive = false,
    exactMatch = false,
    minSearchLength = 1
  } = options;

  // Edge case: Handle invalid inputs
  if (!Array.isArray(items)) {
    console.warn('searchItems: items must be an array');
    return [];
  }

  if (!Array.isArray(searchFields) || searchFields.length === 0) {
    console.warn('searchItems: searchFields must be a non-empty array');
    return items;
  }

  // Edge case: Handle empty or invalid search terms
  if (!searchTerm || typeof searchTerm !== 'string') {
    return items;
  }

  const trimmedSearchTerm = searchTerm.trim();
  
  // Edge case: Return all items if search term is too short
  if (trimmedSearchTerm.length < minSearchLength) {
    return items;
  }

  const processedSearchTerm = caseSensitive ? trimmedSearchTerm : trimmedSearchTerm.toLowerCase();

  return items.filter(item => {
    // Edge case: Handle null or undefined items
    if (!item || typeof item !== 'object') {
      return false;
    }

    return searchFields.some(field => {
      // Edge case: Handle nested field paths (e.g., 'user.profile.name')
      const fieldValue = getNestedValue(item, field);
      
      // Edge case: Handle non-string field values
      if (fieldValue === null || fieldValue === undefined) {
        return false;
      }

      const stringValue = String(fieldValue);
      const processedFieldValue = caseSensitive ? stringValue : stringValue.toLowerCase();

      if (exactMatch) {
        return processedFieldValue === processedSearchTerm;
      } else {
        return processedFieldValue.includes(processedSearchTerm);
      }
    });
  });
};

/**
 * Specialized search function for customer data
 * @param {Array} customers - Array of customer objects
 * @param {string} searchTerm - Search term
 * @returns {Array} Filtered customers
 */
export const searchCustomers = (customers, searchTerm) => {
  return searchItems(
    customers,
    searchTerm,
    ['firstName', 'lastName', 'email'],
    {
      caseSensitive: false,
      exactMatch: false,
      minSearchLength: 1
    }
  );
};
/**
 * API Helper utilities for handling common API operations
 * Centralizes error handling, loading states, and HTTP request logic
 */

/**
 * Generic API request handler with standardized error handling
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options (method, headers, body, etc.)
 * @param {Function} setLoading - Loading state setter
 * @param {Function} setError - Error state setter
 * @param {string} errorPrefix - Prefix for error messages
 * @returns {Promise<Object|null>} Response data or null if error
 */
export const makeApiRequest = async (url, options = {}, setLoading, setError, errorPrefix = 'API request failed') => {
  // Edge case: Validate required parameters
  if (!url || typeof url !== 'string') {
    throw new Error('URL is required and must be a string');
  }
  
  // Edge case: Ensure state setters are functions
  if (typeof setLoading !== 'function' || typeof setError !== 'function') {
    throw new Error('setLoading and setError must be functions');
  }

  setLoading(true);
  setError(null);
  
  try {
    // Edge case: Handle network timeouts by setting a reasonable timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    // Edge case: Handle non-JSON responses gracefully
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    if (!response.ok) {
      // Edge case: Handle different HTTP error status codes with specific messages
      let errorMessage = `${errorPrefix}: `;
      switch (response.status) {
        case 400:
          errorMessage += 'Bad request - please check your input';
          break;
        case 401:
          errorMessage += 'Unauthorized - please log in';
          break;
        case 403:
          errorMessage += 'Forbidden - you don\'t have permission';
          break;
        case 404:
          errorMessage += 'Resource not found';
          break;
        case 500:
          errorMessage += 'Server error - please try again later';
          break;
        default:
          errorMessage += `HTTP ${response.status}`;
      }
      
      throw new Error(errorMessage);
    }
    
    return data;
  } catch (err) {
    // Edge case: Handle different types of errors with appropriate messages
    let errorMessage;
    if (err.name === 'AbortError') {
      errorMessage = `${errorPrefix}: Request timed out`;
    } else if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
      errorMessage = `${errorPrefix}: Network error - please check your connection`;
    } else {
      errorMessage = err.message;
    }
    
    setError(errorMessage);
    console.error(`${errorPrefix}:`, err);
    return null;
  } finally {
    setLoading(false);
  }
};

/**
 * Helper for GET requests
 */
export const apiGet = (url, setLoading, setError, errorPrefix = 'Failed to fetch data') => {
  return makeApiRequest(url, { method: 'GET' }, setLoading, setError, errorPrefix);
};

/**
 * Helper for POST requests
 */
export const apiPost = (url, data, setLoading, setError, errorPrefix = 'Failed to create resource') => {
  return makeApiRequest(
    url,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    },
    setLoading,
    setError,
    errorPrefix
  );
};

/**
 * Helper for PUT requests
 */
export const apiPut = (url, data, setLoading, setError, errorPrefix = 'Failed to update resource') => {
  return makeApiRequest(
    url,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    },
    setLoading,
    setError,
    errorPrefix
  );
};

/**
 * Helper for DELETE requests
 */
export const apiDelete = (url, setLoading, setError, errorPrefix = 'Failed to delete resource') => {
  return makeApiRequest(url, { method: 'DELETE' }, setLoading, setError, errorPrefix);
};
/**
 * Validation helper utilities for form data validation
 * Centralizes validation logic with comprehensive edge case handling
 */

/**
 * Validates email format with comprehensive edge case handling
 * @param {string} email - Email to validate
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  // Edge case: Handle null, undefined, or non-string inputs
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email is required' };
  }

  // Edge case: Handle empty or whitespace-only emails
  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return { isValid: false, error: 'Email cannot be empty' };
  }

  // Edge case: Basic email format validation (more comprehensive than just checking for @)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  // Edge case: Check for common invalid patterns
  if (trimmedEmail.includes('..')) {
    return { isValid: false, error: 'Email cannot contain consecutive dots' };
  }

  // Edge case: Check email length limits (RFC 5321 standard)
  if (trimmedEmail.length > 254) {
    return { isValid: false, error: 'Email address is too long' };
  }

  const [localPart, domain] = trimmedEmail.split('@');
  
  // Edge case: Check local part length
  if (localPart.length > 64) {
    return { isValid: false, error: 'Email local part is too long' };
  }

  return { isValid: true, error: null };
};

/**
 * Validates required text fields with edge case handling
 * @param {string} value - Value to validate
 * @param {string} fieldName - Name of the field for error messages
 * @param {number} minLength - Minimum length (default: 1)
 * @param {number} maxLength - Maximum length (default: 100)
 * @returns {Object} { isValid: boolean, error: string }
 */
export const validateRequiredField = (value, fieldName, minLength = 1, maxLength = 100) => {
  // Edge case: Handle null, undefined, or non-string inputs
  if (value === null || value === undefined) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (typeof value !== 'string') {
    return { isValid: false, error: `${fieldName} must be text` };
  }

  // Edge case: Handle empty or whitespace-only values
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return { isValid: false, error: `${fieldName} cannot be empty` };
  }

  // Edge case: Check minimum length
  if (trimmedValue.length < minLength) {
    return { 
      isValid: false, 
      error: `${fieldName} must be at least ${minLength} character${minLength > 1 ? 's' : ''} long` 
    };
  }

  // Edge case: Check maximum length
  if (trimmedValue.length > maxLength) {
    return { 
      isValid: false, 
      error: `${fieldName} cannot exceed ${maxLength} characters` 
    };
  }

  // Edge case: Check for potentially harmful characters (basic XSS prevention)
  const dangerousChars = /[<>]/;
  if (dangerousChars.test(trimmedValue)) {
    return { isValid: false, error: `${fieldName} contains invalid characters` };
  }

  return { isValid: true, error: null };
};

/**
 * Validates customer form data with all fields
 * @param {Object} formData - Form data object
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateCustomerForm = (formData) => {
  const errors = {};
  let isValid = true;

  // Edge case: Handle null or undefined form data
  if (!formData || typeof formData !== 'object') {
    return { 
      isValid: false, 
      errors: { form: 'Invalid form data' } 
    };
  }

  // Validate first name
  const firstNameValidation = validateRequiredField(formData.firstName, 'First name', 2, 50);
  if (!firstNameValidation.isValid) {
    errors.firstName = firstNameValidation.error;
    isValid = false;
  }

  // Validate last name
  const lastNameValidation = validateRequiredField(formData.lastName, 'Last name', 2, 50);
  if (!lastNameValidation.isValid) {
    errors.lastName = lastNameValidation.error;
    isValid = false;
  }

  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Sanitizes text input to prevent XSS attacks
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
export const sanitizeInput = (input) => {
  // Edge case: Handle null, undefined, or non-string inputs
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Basic HTML entity encoding for common XSS vectors
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
};
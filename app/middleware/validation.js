// Validation middleware for order creation
const validateOrderData = (req, res, next) => {
  const { customer_name, customer_email, product_name, quantity, price, shipping_address } = req.body;
  
  const errors = [];
  
  // Required field validations
  if (!customer_name || customer_name.trim().length === 0) {
    errors.push('Customer name is required');
  }
  
  if (!customer_email || customer_email.trim().length === 0) {
    errors.push('Customer email is required');
  } else if (!isValidEmail(customer_email)) {
    errors.push('Customer email format is invalid');
  }
  
  if (!product_name || product_name.trim().length === 0) {
    errors.push('Product name is required');
  }
  
  if (!quantity) {
    errors.push('Quantity is required');
  } else if (!Number.isInteger(quantity) || quantity <= 0) {
    errors.push('Quantity must be a positive integer');
  }
  
  if (!price) {
    errors.push('Price is required');
  } else if (typeof price !== 'number' || price <= 0) {
    errors.push('Price must be a positive number');
  }
  
  if (!shipping_address || shipping_address.trim().length === 0) {
    errors.push('Shipping address is required');
  }
  
  // Length validations
  if (customer_name && customer_name.length > 100) {
    errors.push('Customer name must be less than 100 characters');
  }
  
  if (product_name && product_name.length > 100) {
    errors.push('Product name must be less than 100 characters');
  }
  
  if (shipping_address && shipping_address.length > 500) {
    errors.push('Shipping address must be less than 500 characters');
  }
  
  // If there are validation errors, return them
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors
    });
  }
  
  // Validation passed, continue to next middleware
  next();
};

// Email validation helper function
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

module.exports = {
  validateOrderData
};

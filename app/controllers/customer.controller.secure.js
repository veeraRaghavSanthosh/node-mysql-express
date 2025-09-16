const Customer = require("../models/customer.model.js");

// Enhanced error response function
const sendErrorResponse = (res, statusCode, message, details = null) => {
  const response = {
    error: true,
    message: message
  };
  
  if (details && process.env.NODE_ENV === 'development') {
    response.details = details;
  }
  
  res.status(statusCode).json(response);
};

// Enhanced success response function
const sendSuccessResponse = (res, data, message = null) => {
  const response = {
    error: false,
    data: data
  };
  
  if (message) {
    response.message = message;
  }
  
  res.json(response);
};

// Create and Save a new Customer (enhanced with better validation)
exports.create = (req, res) => {
  // Additional validation (input sanitization already applied by middleware)
  if (!req.body || Object.keys(req.body).length === 0) {
    return sendErrorResponse(res, 400, "Request body cannot be empty");
  }

  // Validate required fields based on business logic
  const { email, name, active } = req.body;
  
  if (!email && !name) {
    return sendErrorResponse(res, 400, "At least email or name is required");
  }

  // Create a Customer with sanitized data
  const customer = new Customer({
    email: email || null,
    name: name || null,
    active: active !== undefined ? active : true
  });

  // Save Customer in the database
  Customer.create(customer, (err, data) => {
    if (err) {
      // Log error for monitoring (don't expose internal details)
      console.error('Customer creation error:', err);
      
      if (err.code === 'ER_DUP_ENTRY') {
        return sendErrorResponse(res, 409, "Customer with this email already exists");
      }
      
      return sendErrorResponse(res, 500, "An error occurred while creating the customer");
    }
    
    sendSuccessResponse(res, data, "Customer created successfully");
  });
};

// Retrieve all Customers from the database (enhanced with pagination)
exports.findAll = (req, res) => {
  // Add basic pagination to prevent large data dumps
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 50, 100); // Max 100 records
  const offset = (page - 1) * limit;
  
  Customer.getAll((err, data) => {
    if (err) {
      console.error('Customer retrieval error:', err);
      return sendErrorResponse(res, 500, "An error occurred while retrieving customers");
    }
    
    // Apply pagination
    const paginatedData = data.slice(offset, offset + limit);
    
    const response = {
      error: false,
      data: paginatedData,
      pagination: {
        page: page,
        limit: limit,
        total: data.length,
        totalPages: Math.ceil(data.length / limit)
      }
    };
    
    res.json(response);
  });
};

// Find a single Customer with a customerId (enhanced validation)
exports.findOne = (req, res) => {
  const customerId = req.params.customerId;
  
  Customer.findById(customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return sendErrorResponse(res, 404, `Customer with id ${customerId} not found`);
      }
      
      console.error('Customer find error:', err);
      return sendErrorResponse(res, 500, "Error retrieving customer");
    }
    
    sendSuccessResponse(res, data);
  });
};

// Update a Customer identified by the customerId in the request
exports.update = (req, res) => {
  // Validate request
  if (!req.body || Object.keys(req.body).length === 0) {
    return sendErrorResponse(res, 400, "Request body cannot be empty");
  }

  const customerId = req.params.customerId;
  const updateData = {};
  
  // Only include fields that are present in the request
  if (req.body.email !== undefined) updateData.email = req.body.email;
  if (req.body.name !== undefined) updateData.name = req.body.name;
  if (req.body.active !== undefined) updateData.active = req.body.active;
  
  if (Object.keys(updateData).length === 0) {
    return sendErrorResponse(res, 400, "No valid fields to update");
  }

  Customer.updateById(customerId, new Customer(updateData), (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return sendErrorResponse(res, 404, `Customer with id ${customerId} not found`);
      }
      
      console.error('Customer update error:', err);
      
      if (err.code === 'ER_DUP_ENTRY') {
        return sendErrorResponse(res, 409, "Customer with this email already exists");
      }
      
      return sendErrorResponse(res, 500, "Error updating customer");
    }
    
    sendSuccessResponse(res, data, "Customer updated successfully");
  });
};

// Delete a Customer with the specified customerId in the request
exports.delete = (req, res) => {
  const customerId = req.params.customerId;
  
  Customer.remove(customerId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        return sendErrorResponse(res, 404, `Customer with id ${customerId} not found`);
      }
      
      console.error('Customer deletion error:', err);
      return sendErrorResponse(res, 500, "Could not delete customer");
    }
    
    sendSuccessResponse(res, { message: "Customer deleted successfully" });
  });
};

// Delete all Customers from the database
exports.deleteAll = (req, res) => {
  Customer.removeAll((err, data) => {
    if (err) {
      console.error('All customers deletion error:', err);
      return sendErrorResponse(res, 500, "Some error occurred while removing all customers");
    }
    
    sendSuccessResponse(res, { message: `${data.affectedRows} customers deleted successfully` });
  });
};
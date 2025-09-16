const Customer = require("../models/customer.model.js");
const { 
  validateBodyAndRespond, 
  parseCustomerData, 
  handleDatabaseError, 
  sendSuccessResponse 
} = require("../../src/utils/parse.js");

// Create and Save a new Customer
exports.create = (req, res) => {
  // Validate request using helper function
  if (!validateBodyAndRespond(req.body, res)) {
    return; // Response already sent by helper
  }

  // Parse customer data using helper function
  const customerData = parseCustomerData(req.body);
  const customer = new Customer(customerData);

  // Save Customer in the database
  Customer.create(customer, (err, data) => {
    if (err) {
      return handleDatabaseError(err, res, "creating the Customer");
    }
    sendSuccessResponse(res, data);
  });
};

// Retrieve all Customers from the database.
exports.findAll = (req, res) => {
  Customer.getAll((err, data) => {
    if (err) {
      return handleDatabaseError(err, res, "retrieving customers");
    }
    sendSuccessResponse(res, data);
  });
};

// Find a single Customer with a customerId
exports.findOne = (req, res) => {
  Customer.findById(req.params.customerId, (err, data) => {
    if (err) {
      return handleDatabaseError(err, res, "retrieving Customer", req.params.customerId);
    }
    sendSuccessResponse(res, data);
  });
};

// Update a Customer identified by the customerId in the request
exports.update = (req, res) => {
  // Validate request using helper function
  if (!validateBodyAndRespond(req.body, res)) {
    return; // Response already sent by helper
  }

  console.log(req.body);

  // Parse customer data using helper function
  const customerData = parseCustomerData(req.body);
  
  Customer.updateById(
    req.params.customerId,
    new Customer(customerData),
    (err, data) => {
      if (err) {
        return handleDatabaseError(err, res, "updating Customer", req.params.customerId);
      }
      sendSuccessResponse(res, data);
    }
  );
};

// Delete a Customer with the specified customerId in the request
exports.delete = (req, res) => {
  Customer.remove(req.params.customerId, (err, data) => {
    if (err) {
      return handleDatabaseError(err, res, "deleting Customer", req.params.customerId);
    }
    sendSuccessResponse(res, "Customer was deleted successfully!");
  });
};

// Delete all Customers from the database.
exports.deleteAll = (req, res) => {
  Customer.removeAll((err, data) => {
    if (err)
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all customers."
      });
    else res.send({ message: `All Customers were deleted successfully!` });
  });
};

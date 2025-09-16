const sql = require("./db.js");
const logger = require("../utils/logger.js");

// constructor
const Customer = function(customer) {
  this.email = customer.email;
  this.name = customer.name;
  this.active = customer.active;
};

Customer.create = (newCustomer, result) => {
  logger.trace("Starting customer creation", { customer: newCustomer });
  
  sql.query("INSERT INTO customers SET ?", newCustomer, (err, res) => {
    if (err) {
      logger.error("Error creating customer", { error: err, customer: newCustomer });
      result(err, null);
      return;
    }

    const createdCustomer = { id: res.insertId, ...newCustomer };
    logger.debug("Customer created successfully", { customer: createdCustomer });
    logger.info("Customer created", { customerId: res.insertId });
    result(null, createdCustomer);
  });
};

Customer.findById = (customerId, result) => {
  logger.trace("Starting customer lookup", { customerId });
  
  sql.query(`SELECT * FROM customers WHERE id = ${customerId}`, (err, res) => {
    if (err) {
      logger.error("Error finding customer by ID", { error: err, customerId });
      result(err, null);
      return;
    }

    if (res.length) {
      logger.debug("Customer found", { customer: res[0] });
      logger.trace("Customer lookup completed successfully", { customerId });
      result(null, res[0]);
      return;
    }

    logger.debug("Customer not found", { customerId });
    // not found Customer with the id
    result({ kind: "not_found" }, null);
  });
};

Customer.getAll = result => {
  logger.trace("Starting retrieval of all customers");
  
  sql.query("SELECT * FROM customers", (err, res) => {
    if (err) {
      logger.error("Error retrieving all customers", { error: err });
      result(null, err);
      return;
    }

    logger.debug("Retrieved all customers", { count: res.length });
    logger.trace("Customer retrieval completed", { customers: res });
    result(null, res);
  });
};

Customer.updateById = (id, customer, result) => {
  logger.trace("Starting customer update", { customerId: id, updateData: customer });
  
  sql.query(
    "UPDATE customers SET email = ?, name = ?, active = ? WHERE id = ?",
    [customer.email, customer.name, customer.active, id],
    (err, res) => {
      if (err) {
        logger.error("Error updating customer", { error: err, customerId: id, updateData: customer });
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        logger.debug("Customer not found for update", { customerId: id });
        // not found Customer with the id
        result({ kind: "not_found" }, null);
        return;
      }

      const updatedCustomer = { id: id, ...customer };
      logger.debug("Customer updated successfully", { customer: updatedCustomer });
      logger.info("Customer updated", { customerId: id });
      result(null, updatedCustomer);
    }
  );
};

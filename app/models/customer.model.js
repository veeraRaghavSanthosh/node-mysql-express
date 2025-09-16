const sql = require("./db.js");
const logger = require("../config/logger.config.js");

// constructor
const Customer = function(customer) {
  this.email = customer.email;
  this.name = customer.name;
  this.active = customer.active;
};

Customer.create = (newCustomer, result) => {
  logger.trace("Creating new customer", { customer: newCustomer });
  
  sql.query("INSERT INTO customers SET ?", newCustomer, (err, res) => {
    if (err) {
      logger.error("Error creating customer", { error: err, customer: newCustomer });
      result(err, null);
      return;
    }

    const createdCustomer = { id: res.insertId, ...newCustomer };
    logger.info("Customer created successfully", { customer: createdCustomer });
    logger.trace("Customer creation result", { insertId: res.insertId, affectedRows: res.affectedRows });
    result(null, createdCustomer);
  });
};

Customer.findById = (customerId, result) => {
  logger.trace("Finding customer by ID", { customerId });
  
  sql.query(`SELECT * FROM customers WHERE id = ${customerId}`, (err, res) => {
    if (err) {
      logger.error("Error finding customer by ID", { error: err, customerId });
      result(err, null);
      return;
    }

    if (res.length) {
      logger.info("Customer found", { customerId, customer: res[0] });
      logger.trace("Database query result", { resultCount: res.length, result: res[0] });
      result(null, res[0]);
      return;
    }

    logger.warn("Customer not found", { customerId });
    logger.trace("No customer found with ID", { customerId, queryResult: res });
    // not found Customer with the id
    result({ kind: "not_found" }, null);
  });
};

Customer.getAll = result => {
  logger.trace("Retrieving all customers");
  
  sql.query("SELECT * FROM customers", (err, res) => {
    if (err) {
      logger.error("Error retrieving all customers", { error: err });
      result(null, err);
      return;
    }

    logger.info("All customers retrieved successfully", { count: res.length });
    logger.trace("Customer retrieval result", { customers: res, totalCount: res.length });
    result(null, res);
  });
};

Customer.updateById = (id, customer, result) => {
  logger.trace("Updating customer by ID", { customerId: id, updateData: customer });
  
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
        logger.warn("Customer not found for update", { customerId: id });
        logger.trace("Update query affected no rows", { customerId: id, affectedRows: res.affectedRows });
        // not found Customer with the id
        result({ kind: "not_found" }, null);
        return;
      }

      const updatedCustomer = { id: id, ...customer };
      logger.info("Customer updated successfully", { customer: updatedCustomer });
      logger.trace("Customer update result", { customerId: id, affectedRows: res.affectedRows, changedRows: res.changedRows });
      result(null, updatedCustomer);
    }
  );
};

Customer.remove = (id, result) => {
  logger.trace("Removing customer by ID", { customerId: id });
  
  sql.query("DELETE FROM customers WHERE id = ?", id, (err, res) => {
    if (err) {
      logger.error("Error removing customer", { error: err, customerId: id });
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      logger.warn("Customer not found for deletion", { customerId: id });
      logger.trace("Delete query affected no rows", { customerId: id, affectedRows: res.affectedRows });
      // not found Customer with the id
      result({ kind: "not_found" }, null);
      return;
    }

    logger.info("Customer removed successfully", { customerId: id });
    logger.trace("Customer removal result", { customerId: id, affectedRows: res.affectedRows });
    result(null, res);
  });
};

Customer.removeAll = result => {
  logger.trace("Removing all customers");
  
  sql.query("DELETE FROM customers", (err, res) => {
    if (err) {
      logger.error("Error removing all customers", { error: err });
      result(null, err);
      return;
    }

    logger.info("All customers removed successfully", { deletedCount: res.affectedRows });
    logger.trace("Remove all customers result", { affectedRows: res.affectedRows });
    result(null, res);
  });
};

module.exports = Customer;
const sql = require("./db.js");
const notificationLogger = require("../utils/notification.logger.js");

// constructor
const Customer = function(customer) {
  this.email = customer.email;
  this.name = customer.name;
  this.active = customer.active;
};

Customer.create = (newCustomer, result) => {
  const query = "INSERT INTO customers SET ?";
  
  // Trace logging for the operation start
  notificationLogger.trace('customer_create', 'Starting customer creation', {
    customerEmail: newCustomer.email,
    customerName: newCustomer.name,
    customerActive: newCustomer.active
  });

  sql.query(query, newCustomer, (err, res) => {
    if (err) {
      // Log the database error with trace details
      notificationLogger.logDatabaseOperation('INSERT', query, newCustomer, null, err);
      
      // Backward compatible error logging
      console.log("error: ", err);
      result(err, null);
      return;
    }

    const createdCustomer = { id: res.insertId, ...newCustomer };
    
    // Log successful database operation
    notificationLogger.logDatabaseOperation('INSERT', query, newCustomer, res);
    
    // Log the customer operation (backward compatible)
    notificationLogger.logCustomerOperation('create', 'created customer: ', createdCustomer);
    
    // Trace logging for operation completion
    notificationLogger.trace('customer_create', 'Customer creation completed successfully', {
      customerId: res.insertId,
      insertId: res.insertId,
      affectedRows: res.affectedRows
    });

    result(null, createdCustomer);
  });
};

Customer.findById = (customerId, result) => {
  const query = `SELECT * FROM customers WHERE id = ${customerId}`;
  
  // Trace logging for the operation start
  notificationLogger.trace('customer_findById', 'Starting customer lookup by ID', {
    customerId: customerId,
    queryType: 'SELECT'
  });

  sql.query(query, (err, res) => {
    if (err) {
      // Log the database error with trace details
      notificationLogger.logDatabaseOperation('SELECT', query, { customerId }, null, err);
      
      // Backward compatible error logging
      console.log("error: ", err);
      result(err, null);
      return;
    }

    // Log successful database operation
    notificationLogger.logDatabaseOperation('SELECT', query, { customerId }, res);

    if (res.length) {
      const foundCustomer = res[0];
      
      // Log the customer operation (backward compatible)
      notificationLogger.logCustomerOperation('findById', 'found customer: ', foundCustomer);
      
      // Trace logging for successful find
      notificationLogger.trace('customer_findById', 'Customer found successfully', {
        customerId: customerId,
        foundCustomerId: foundCustomer.id,
        customerEmail: foundCustomer.email
      });

      result(null, foundCustomer);
      return;
    }

    // Trace logging for customer not found
    notificationLogger.trace('customer_findById', 'Customer not found', {
      customerId: customerId,
      resultLength: res.length
    });

    // not found Customer with the id
    result({ kind: "not_found" }, null);
  });
};

Customer.getAll = result => {
  const query = "SELECT * FROM customers";
  
  // Trace logging for the operation start
  notificationLogger.trace('customer_getAll', 'Starting retrieval of all customers', {
    queryType: 'SELECT_ALL'
  });

  sql.query(query, (err, res) => {
    if (err) {
      // Log the database error with trace details
      notificationLogger.logDatabaseOperation('SELECT', query, null, null, err);
      
      // Backward compatible error logging
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // Log successful database operation
    notificationLogger.logDatabaseOperation('SELECT', query, null, res);
    
    // Log the customer operation (backward compatible)
    notificationLogger.logCustomerOperation('getAll', 'customers: ', res);
    
    // Trace logging for operation completion
    notificationLogger.trace('customer_getAll', 'All customers retrieved successfully', {
      customerCount: res.length,
      customers: res.map(c => ({ id: c.id, email: c.email, name: c.name }))
    });

    result(null, res);
  });
};

Customer.updateById = (id, customer, result) => {
  const query = "UPDATE customers SET email = ?, name = ?, active = ? WHERE id = ?";
  const params = [customer.email, customer.name, customer.active, id];
  
  // Trace logging for the operation start
  notificationLogger.trace('customer_updateById', 'Starting customer update', {
    customerId: id,
    updateData: {
      email: customer.email,
      name: customer.name,
      active: customer.active
    }
  });

  sql.query(query, params, (err, res) => {
    if (err) {
      // Log the database error with trace details
      notificationLogger.logDatabaseOperation('UPDATE', query, params, null, err);
      
      // Backward compatible error logging
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // Log successful database operation
    notificationLogger.logDatabaseOperation('UPDATE', query, params, res);

    if (res.affectedRows == 0) {
      // Trace logging for customer not found during update
      notificationLogger.trace('customer_updateById', 'Customer not found for update', {
        customerId: id,
        affectedRows: res.affectedRows
      });

      // not found Customer with the id
      result({ kind: "not_found" }, null);
      return;
    }

    const updatedCustomer = { id: id, ...customer };
    
    // Log the customer operation (backward compatible)
    notificationLogger.logCustomerOperation('updateById', 'updated customer: ', updatedCustomer);
    
    // Trace logging for successful update
    notificationLogger.trace('customer_updateById', 'Customer updated successfully', {
      customerId: id,
      affectedRows: res.affectedRows,
      changedRows: res.changedRows
    });

    result(null, updatedCustomer);
  });
};

Customer.remove = (id, result) => {
  const query = "DELETE FROM customers WHERE id = ?";
  
  // Trace logging for the operation start
  notificationLogger.trace('customer_remove', 'Starting customer deletion', {
    customerId: id
  });

  sql.query(query, id, (err, res) => {
    if (err) {
      // Log the database error with trace details
      notificationLogger.logDatabaseOperation('DELETE', query, { id }, null, err);
      
      // Backward compatible error logging
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // Log successful database operation
    notificationLogger.logDatabaseOperation('DELETE', query, { id }, res);

    if (res.affectedRows == 0) {
      // Trace logging for customer not found during deletion
      notificationLogger.trace('customer_remove', 'Customer not found for deletion', {
        customerId: id,
        affectedRows: res.affectedRows
      });

      // not found Customer with the id
      result({ kind: "not_found" }, null);
      return;
    }

    // Log the customer operation (backward compatible)
    notificationLogger.logCustomerOperation('remove', 'deleted customer with id: ', id);
    
    // Trace logging for successful deletion
    notificationLogger.trace('customer_remove', 'Customer deleted successfully', {
      customerId: id,
      affectedRows: res.affectedRows
    });

    result(null, res);
  });
};

Customer.removeAll = result => {
  const query = "DELETE FROM customers";
  
  // Trace logging for the operation start
  notificationLogger.trace('customer_removeAll', 'Starting deletion of all customers', {
    operation: 'DELETE_ALL'
  });

  sql.query(query, (err, res) => {
    if (err) {
      // Log the database error with trace details
      notificationLogger.logDatabaseOperation('DELETE', query, null, null, err);
      
      // Backward compatible error logging
      console.log("error: ", err);
      result(null, err);
      return;
    }

    // Log successful database operation
    notificationLogger.logDatabaseOperation('DELETE', query, null, res);
    
    // Log the customer operation (backward compatible)
    notificationLogger.logCustomerOperation('removeAll', `deleted ${res.affectedRows} customers`);
    
    // Trace logging for operation completion
    notificationLogger.trace('customer_removeAll', 'All customers deleted successfully', {
      deletedCount: res.affectedRows,
      affectedRows: res.affectedRows
    });

    result(null, res);
  });
};

module.exports = Customer;
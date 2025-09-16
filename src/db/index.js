const sql = require("./db.js");
const { promisify } = require('util');

// Promisify the query method
const query = promisify(sql.query).bind(sql);

// constructor
const Customer = function(customer) {
  this.email = customer.email;
  this.name = customer.name;
  this.active = customer.active;
};

Customer.create = async (newCustomer) => {
  try {
    const res = await query("INSERT INTO customers SET ?", newCustomer);
    console.log("created customer: ", { id: res.insertId, ...newCustomer });
    return { id: res.insertId, ...newCustomer };
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

Customer.findById = async (customerId) => {
  try {
    const res = await query(`SELECT * FROM customers WHERE id = ${customerId}`);
    
    if (res.length) {
      console.log("found customer: ", res[0]);
      return res[0];
    }
    
    // not found Customer with the id
    const error = new Error("Customer not found");
    error.kind = "not_found";
    throw error;
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

Customer.getAll = async () => {
  try {
    const res = await query("SELECT * FROM customers");
    console.log("customers: ", res);
    return res;
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

Customer.updateById = async (id, customer) => {
  try {
    const res = await query(
      "UPDATE customers SET email = ?, name = ?, active = ? WHERE id = ?",
      [customer.email, customer.name, customer.active, id]
    );
    
    if (res.affectedRows == 0) {
      // not found Customer with the id
      const error = new Error("Customer not found");
      error.kind = "not_found";
      throw error;
    }
    
    console.log("updated customer: ", { id: id, ...customer });
    return { id: id, ...customer };
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

Customer.remove = async (id) => {
  try {
    const res = await query("DELETE FROM customers WHERE id = ?", id);
    
    if (res.affectedRows == 0) {
      // not found Customer with the id
      const error = new Error("Customer not found");
      error.kind = "not_found";
      throw error;
    }
    
    console.log("deleted customer with id: ", id);
    return res;
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

Customer.removeAll = async () => {
  try {
    const res = await query("DELETE FROM customers");
    console.log(`deleted ${res.affectedRows} customers`);
    return res;
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

module.exports = Customer;

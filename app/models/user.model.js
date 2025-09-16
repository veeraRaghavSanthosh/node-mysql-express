const sql = require("./db.js");

// constructor
const User = function(user) {
  // Safe property assignment with null checks
  if (user) {
    this.email = user.email !== undefined ? user.email : null;
    this.name = user.name !== undefined ? user.name : null;
    this.active = user.active !== undefined ? user.active : false;
  } else {
    this.email = null;
    this.name = null;
    this.active = false;
  }
};

User.create = (newUser, result) => {
  // Validate input before database operation
  if (!newUser || !newUser.email || !newUser.name) {
    const error = new Error("Email and name are required");
    console.log("error: ", error);
    result(error, null);
    return;
  }

  sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created user: ", { id: res.insertId, ...newUser });
    result(null, { id: res.insertId, ...newUser });
  });
};

User.findById = (userId, result) => {
  // Validate userId
  if (!userId || isNaN(userId)) {
    const error = new Error("Invalid user ID");
    console.log("error: ", error);
    result(error, null);
    return;
  }

  sql.query(`SELECT * FROM users WHERE id = ?`, [userId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("found user: ", res[0]);
      result(null, res[0]);
      return;
    }

    // not found User with the id
    result({ kind: "not_found" }, null);
  });
};

User.getAll = result => {
  sql.query("SELECT * FROM users", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("users: ", res);
    result(null, res);
  });
};

User.updateById = (id, user, result) => {
  // Validate inputs
  if (!id || isNaN(id)) {
    const error = new Error("Invalid user ID");
    console.log("error: ", error);
    result(error, null);
    return;
  }

  if (!user) {
    const error = new Error("User data is required");
    console.log("error: ", error);
    result(error, null);
    return;
  }

  // Build dynamic query based on provided fields
  const updates = [];
  const values = [];
  
  if (user.email !== null && user.email !== undefined) {
    updates.push("email = ?");
    values.push(user.email);
  }
  
  if (user.name !== null && user.name !== undefined) {
    updates.push("name = ?");
    values.push(user.name);
  }
  
  if (user.active !== null && user.active !== undefined) {
    updates.push("active = ?");
    values.push(user.active);
  }

  if (updates.length === 0) {
    const error = new Error("No valid fields to update");
    console.log("error: ", error);
    result(error, null);
    return;
  }

  values.push(id); // Add id for WHERE clause

  const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

  sql.query(query, values, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      // not found User with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("updated user: ", { id: id, ...user });
    result(null, { id: id, ...user });
  });
};

User.remove = (id, result) => {
  // Validate id
  if (!id || isNaN(id)) {
    const error = new Error("Invalid user ID");
    console.log("error: ", error);
    result(error, null);
    return;
  }

  sql.query("DELETE FROM users WHERE id = ?", [id], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      // not found User with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted user with id: ", id);
    result(null, res);
  });
};

User.removeAll = result => {
  sql.query("DELETE FROM users", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log(`deleted ${res.affectedRows} users`);
    result(null, res);
  });
};

module.exports = User;
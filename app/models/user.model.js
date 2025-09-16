const sql = require("./db.js");
const bcrypt = require('bcrypt');

// Constructor
const User = function(user) {
  this.email = user.email;
  this.name = user.name;
  this.password = user.password;
  this.role = user.role || 'user';
  this.active = user.active !== undefined ? user.active : true;
  this.created_at = new Date();
};

User.create = (newUser, result) => {
  // Hash password before saving
  bcrypt.hash(newUser.password, 10, (err, hashedPassword) => {
    if (err) {
      console.log("Error hashing password: ", err);
      result(err, null);
      return;
    }

    newUser.password = hashedPassword;
    
    sql.query("INSERT INTO users SET ?", newUser, (err, res) => {
      if (err) {
        console.log("Error creating user: ", err);
        result(err, null);
        return;
      }

      console.log("Created user: ", { id: res.insertId, ...newUser });
      result(null, { id: res.insertId, ...newUser });
    });
  });
};

User.findById = (userId, result) => {
  sql.query(`SELECT * FROM users WHERE id = ${userId}`, (err, res) => {
    if (err) {
      console.log("Error finding user: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("Found user: ", res[0]);
      result(null, res[0]);
      return;
    }

    // Not found User with the id
    result({ kind: "not_found" }, null);
  });
};

User.findByEmail = (email, result) => {
  sql.query("SELECT * FROM users WHERE email = ?", [email], (err, res) => {
    if (err) {
      console.log("Error finding user by email: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      console.log("Found user by email: ", res[0]);
      result(null, res[0]);
      return;
    }

    // Not found User with the email
    result({ kind: "not_found" }, null);
  });
};

User.getAll = result => {
  sql.query("SELECT id, email, name, role, active, created_at FROM users", (err, res) => {
    if (err) {
      console.log("Error getting all users: ", err);
      result(null, err);
      return;
    }

    console.log("Users: ", res);
    result(null, res);
  });
};

User.updateById = (id, user, result) => {
  // If password is being updated, hash it first
  if (user.password) {
    bcrypt.hash(user.password, 10, (err, hashedPassword) => {
      if (err) {
        console.log("Error hashing password: ", err);
        result(err, null);
        return;
      }

      user.password = hashedPassword;
      performUpdate();
    });
  } else {
    performUpdate();
  }

  function performUpdate() {
    sql.query(
      "UPDATE users SET email = ?, name = ?, role = ?, active = ? WHERE id = ?",
      [user.email, user.name, user.role, user.active, id],
      (err, res) => {
        if (err) {
          console.log("Error updating user: ", err);
          result(null, err);
          return;
        }

        if (res.affectedRows == 0) {
          // Not found User with the id
          result({ kind: "not_found" }, null);
          return;
        }

        console.log("Updated user: ", { id: id, ...user });
        result(null, { id: id, ...user });
      }
    );
  }
};

User.remove = (id, result) => {
  sql.query("DELETE FROM users WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("Error deleting user: ", err);
      result(null, err);
      return;
    }

    if (res.affectedRows == 0) {
      // Not found User with the id
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("Deleted user with id: ", id);
    result(null, res);
  });
};

User.removeAll = result => {
  sql.query("DELETE FROM users", (err, res) => {
    if (err) {
      console.log("Error deleting all users: ", err);
      result(null, err);
      return;
    }

    console.log(`Deleted ${res.affectedRows} users`);
    result(null, res);
  });
};

User.comparePassword = (candidatePassword, hashedPassword, callback) => {
  bcrypt.compare(candidatePassword, hashedPassword, callback);
};

module.exports = User;
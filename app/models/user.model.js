const sql = require("./db.js");

// constructor
const User = function(user) {
  if (!user) {
    throw new Error("User data cannot be null or undefined");
  }
  
  this.email = user.email;
  this.name = user.name;
  this.age = user.age;
};

User.create = (newUser, result) => {
  if (!newUser) {
    result(new Error("User data cannot be null"), null);
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
  if (!userId || userId === 'null' || userId === 'undefined') {
    result(new Error("User ID cannot be null or undefined"), null);
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
      result(null, err);
      return;
    }

    console.log("users: ", res);
    result(null, res);
  });
};

User.updateById = (id, user, result) => {
  if (!id || id === 'null' || id === 'undefined') {
    result(new Error("User ID cannot be null or undefined"), null);
    return;
  }

  if (!user) {
    result(new Error("User data cannot be null"), null);
    return;
  }

  sql.query(
    "UPDATE users SET email = ?, name = ?, age = ? WHERE id = ?",
    [user.email, user.name, user.age, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(null, err);
        return;
      }

      if (res.affectedRows == 0) {
        // not found User with the id
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("updated user: ", { id: id, ...user });
      result(null, { id: id, ...user });
    }
  );
};

User.remove = (id, result) => {
  if (!id || id === 'null' || id === 'undefined') {
    result(new Error("User ID cannot be null or undefined"), null);
    return;
  }

  sql.query("DELETE FROM users WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
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
      result(null, err);
      return;
    }

    console.log(`deleted ${res.affectedRows} users`);
    result(null, res);
  });
};

module.exports = User;
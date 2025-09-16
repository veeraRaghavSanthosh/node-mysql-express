const sql = require("../../app/models/db.js");
const { promisify } = require('util');

// Promisify the database query function
const query = promisify(sql.query).bind(sql);

// User model constructor
const User = function(user) {
  this.email = user.email;
  this.name = user.name;
  this.active = user.active;
};

// Create and Save a new User (async/await)
exports.create = async (req, res) => {
  try {
    // Validate request
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }

    // Create a User
    const user = new User({
      email: req.body.email,
      name: req.body.name,
      active: req.body.active
    });

    // Save User in the database using async/await
    const data = await User.create(user);
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while creating the User."
    });
  }
};

// Retrieve all Users from the database (async/await)
exports.findAll = async (req, res) => {
  try {
    const data = await User.getAll();
    res.send(data);
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while retrieving users."
    });
  }
};

// Find a single User with a userId (async/await)
exports.findOne = async (req, res) => {
  try {
    const data = await User.findById(req.params.userId);
    res.send(data);
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        message: `Not found User with id ${req.params.userId}.`
      });
    } else {
      res.status(500).send({
        message: "Error retrieving User with id " + req.params.userId
      });
    }
  }
};

// Update a User identified by the userId in the request (async/await)
exports.update = async (req, res) => {
  try {
    // Validate Request
    if (!req.body) {
      res.status(400).send({
        message: "Content can not be empty!"
      });
      return;
    }

    const data = await User.updateById(req.params.userId, new User(req.body));
    res.send(data);
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        message: `Not found User with id ${req.params.userId}.`
      });
    } else {
      res.status(500).send({
        message: "Error updating User with id " + req.params.userId
      });
    }
  }
};

// Delete a User with the specified userId in the request (async/await)
exports.delete = async (req, res) => {
  try {
    await User.remove(req.params.userId);
    res.send({ message: `User was deleted successfully!` });
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        message: `Not found User with id ${req.params.userId}.`
      });
    } else {
      res.status(500).send({
        message: "Could not delete User with id " + req.params.userId
      });
    }
  }
};

// Delete all Users from the database (async/await)
exports.deleteAll = async (req, res) => {
  try {
    await User.removeAll();
    res.send({ message: `All Users were deleted successfully!` });
  } catch (err) {
    res.status(500).send({
      message: err.message || "Some error occurred while removing all users."
    });
  }
};

// User model methods with async/await
User.create = async (newUser) => {
  try {
    const res = await query("INSERT INTO users SET ?", newUser);
    console.log("created user: ", { id: res.insertId, ...newUser });
    return { id: res.insertId, ...newUser };
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

User.findById = async (userId) => {
  try {
    const res = await query(`SELECT * FROM users WHERE id = ?`, [userId]);
    
    if (res.length) {
      console.log("found user: ", res[0]);
      return res[0];
    }

    // not found User with the id
    const error = new Error("User not found");
    error.kind = "not_found";
    throw error;
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

User.getAll = async () => {
  try {
    const res = await query("SELECT * FROM users");
    console.log("users: ", res);
    return res;
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

User.updateById = async (id, user) => {
  try {
    const res = await query(
      "UPDATE users SET email = ?, name = ?, active = ? WHERE id = ?",
      [user.email, user.name, user.active, id]
    );

    if (res.affectedRows == 0) {
      // not found User with the id
      const error = new Error("User not found");
      error.kind = "not_found";
      throw error;
    }

    console.log("updated user: ", { id: id, ...user });
    return { id: id, ...user };
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

User.remove = async (id) => {
  try {
    const res = await query("DELETE FROM users WHERE id = ?", [id]);
    
    if (res.affectedRows == 0) {
      // not found User with the id
      const error = new Error("User not found");
      error.kind = "not_found";
      throw error;
    }

    console.log("deleted user with id: ", id);
    return res;
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};

User.removeAll = async () => {
  try {
    const res = await query("DELETE FROM users");
    console.log(`deleted ${res.affectedRows} users`);
    return res;
  } catch (err) {
    console.log("error: ", err);
    throw err;
  }
};
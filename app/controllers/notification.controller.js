const Notification = require("../models/notification.model.js");

// Create and Save a new Notification
exports.create = (req, res) => {
  // Validate request
  if (!req.body) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Validate required fields
  if (!req.body.title || !req.body.message) {
    res.status(400).send({
      message: "Title and message are required!"
    });
    return;
  }

  if (!req.body.recipient_id && !req.body.recipient_email) {
    res.status(400).send({
      message: "Either recipient_id or recipient_email is required!"
    });
    return;
  }

  // Create a Notification
  const notification = new Notification({
    title: req.body.title,
    message: req.body.message,
    recipient_id: req.body.recipient_id,
    recipient_email: req.body.recipient_email,
    type: req.body.type,
    status: req.body.status,
    priority: req.body.priority,
    scheduled_at: req.body.scheduled_at,
    metadata: req.body.metadata
  });

  // Save Notification in the database
  Notification.create(notification, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the Notification."
      });
    } else {
      res.status(201).send(data);
    }
  });
};

// Retrieve all Notifications from the database
exports.findAll = (req, res) => {
  // Extract query parameters for filtering
  const filters = {
    recipient_id: req.query.recipient_id,
    recipient_email: req.query.recipient_email,
    type: req.query.type,
    status: req.query.status,
    priority: req.query.priority,
    limit: req.query.limit
  };

  // Remove undefined values
  Object.keys(filters).forEach(key => {
    if (filters[key] === undefined) {
      delete filters[key];
    }
  });

  Notification.getAll(filters, (err, data) => {
    if (err) {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving notifications."
      });
    } else {
      res.send(data);
    }
  });
};

// Find a single Notification with a notificationId
exports.findOne = (req, res) => {
  const notificationId = req.params.notificationId;

  if (!notificationId || isNaN(notificationId)) {
    res.status(400).send({
      message: "Invalid notification ID!"
    });
    return;
  }

  Notification.findById(notificationId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Notification with id ${notificationId}.`
        });
      } else {
        res.status(500).send({
          message: "Error retrieving Notification with id " + notificationId
        });
      }
    } else {
      res.send(data);
    }
  });
};

// Send a notification
exports.send = (req, res) => {
  const notificationId = req.params.notificationId;

  if (!notificationId || isNaN(notificationId)) {
    res.status(400).send({
      message: "Invalid notification ID!"
    });
    return;
  }

  Notification.send(notificationId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          message: `Not found Notification with id ${notificationId}.`
        });
      } else {
        res.status(500).send({
          message: err.message || "Error sending Notification with id " + notificationId
        });
      }
    } else {
      if (data.success) {
        res.send(data);
      } else {
        res.status(422).send(data);
      }
    }
  });
};
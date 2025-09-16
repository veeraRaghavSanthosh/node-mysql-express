const sql = require("./db.js");

// Constructor
const Notification = function(notification) {
  this.title = notification.title;
  this.message = notification.message;
  this.recipient_id = notification.recipient_id;
  this.recipient_email = notification.recipient_email;
  this.type = notification.type || 'info'; // info, warning, error, success
  this.status = notification.status || 'pending'; // pending, sent, failed
  this.priority = notification.priority || 'normal'; // low, normal, high, urgent
  this.scheduled_at = notification.scheduled_at;
  this.sent_at = notification.sent_at;
  this.metadata = notification.metadata ? JSON.stringify(notification.metadata) : null;
};

// Create notification
Notification.create = (newNotification, result) => {
  if (!newNotification.title || !newNotification.message) {
    result({ message: "Title and message are required!" }, null);
    return;
  }

  if (!newNotification.recipient_id && !newNotification.recipient_email) {
    result({ message: "Either recipient_id or recipient_email is required!" }, null);
    return;
  }

  // Validate type
  const validTypes = ['info', 'warning', 'error', 'success'];
  if (newNotification.type && !validTypes.includes(newNotification.type)) {
    result({ message: "Invalid notification type!" }, null);
    return;
  }

  // Validate priority
  const validPriorities = ['low', 'normal', 'high', 'urgent'];
  if (newNotification.priority && !validPriorities.includes(newNotification.priority)) {
    result({ message: "Invalid priority level!" }, null);
    return;
  }

  const query = `INSERT INTO notifications 
    (title, message, recipient_id, recipient_email, type, status, priority, scheduled_at, metadata, created_at) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`;

  const values = [
    newNotification.title,
    newNotification.message,
    newNotification.recipient_id || null,
    newNotification.recipient_email || null,
    newNotification.type || 'info',
    newNotification.status || 'pending',
    newNotification.priority || 'normal',
    newNotification.scheduled_at || null,
    newNotification.metadata
  ];

  sql.query(query, values, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log("created notification: ", { id: res.insertId, ...newNotification });
    result(null, { id: res.insertId, ...newNotification });
  });
};

// Find notification by ID
Notification.findById = (notificationId, result) => {
  if (!notificationId || isNaN(notificationId)) {
    result({ message: "Invalid notification ID!" }, null);
    return;
  }

  sql.query("SELECT * FROM notifications WHERE id = ?", [notificationId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      const notification = res[0];
      if (notification.metadata) {
        try {
          notification.metadata = JSON.parse(notification.metadata);
        } catch (e) {
          notification.metadata = null;
        }
      }
      console.log("found notification: ", notification);
      result(null, notification);
      return;
    }

    result({ kind: "not_found" }, null);
  });
};

// Get all notifications with optional filters
Notification.getAll = (filters, result) => {
  let query = "SELECT * FROM notifications WHERE 1=1";
  const values = [];

  if (filters) {
    if (filters.recipient_id) {
      query += " AND recipient_id = ?";
      values.push(filters.recipient_id);
    }
    if (filters.recipient_email) {
      query += " AND recipient_email = ?";
      values.push(filters.recipient_email);
    }
    if (filters.type) {
      query += " AND type = ?";
      values.push(filters.type);
    }
    if (filters.status) {
      query += " AND status = ?";
      values.push(filters.status);
    }
    if (filters.priority) {
      query += " AND priority = ?";
      values.push(filters.priority);
    }
  }

  query += " ORDER BY created_at DESC";

  if (filters && filters.limit) {
    query += " LIMIT ?";
    values.push(parseInt(filters.limit));
  }

  sql.query(query, values, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    // Parse metadata for each notification
    const notifications = res.map(notification => {
      if (notification.metadata) {
        try {
          notification.metadata = JSON.parse(notification.metadata);
        } catch (e) {
          notification.metadata = null;
        }
      }
      return notification;
    });

    console.log("notifications: ", notifications);
    result(null, notifications);
  });
};

// Update notification
Notification.updateById = (id, notification, result) => {
  if (!id || isNaN(id)) {
    result({ message: "Invalid notification ID!" }, null);
    return;
  }

  // Validate type if provided
  if (notification.type) {
    const validTypes = ['info', 'warning', 'error', 'success'];
    if (!validTypes.includes(notification.type)) {
      result({ message: "Invalid notification type!" }, null);
      return;
    }
  }

  // Validate priority if provided
  if (notification.priority) {
    const validPriorities = ['low', 'normal', 'high', 'urgent'];
    if (!validPriorities.includes(notification.priority)) {
      result({ message: "Invalid priority level!" }, null);
      return;
    }
  }

  const query = `UPDATE notifications SET 
    title = COALESCE(?, title),
    message = COALESCE(?, message),
    recipient_id = COALESCE(?, recipient_id),
    recipient_email = COALESCE(?, recipient_email),
    type = COALESCE(?, type),
    status = COALESCE(?, status),
    priority = COALESCE(?, priority),
    scheduled_at = COALESCE(?, scheduled_at),
    sent_at = COALESCE(?, sent_at),
    metadata = COALESCE(?, metadata),
    updated_at = NOW()
    WHERE id = ?`;

  const values = [
    notification.title || null,
    notification.message || null,
    notification.recipient_id || null,
    notification.recipient_email || null,
    notification.type || null,
    notification.status || null,
    notification.priority || null,
    notification.scheduled_at || null,
    notification.sent_at || null,
    notification.metadata ? JSON.stringify(notification.metadata) : null,
    id
  ];

  sql.query(query, values, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("updated notification: ", { id: id, ...notification });
    result(null, { id: id, ...notification });
  });
};

// Mark notification as sent
Notification.markAsSent = (id, result) => {
  if (!id || isNaN(id)) {
    result({ message: "Invalid notification ID!" }, null);
    return;
  }

  sql.query(
    "UPDATE notifications SET status = 'sent', sent_at = NOW(), updated_at = NOW() WHERE id = ?",
    [id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("marked notification as sent: ", id);
      result(null, { id: id, status: 'sent', sent_at: new Date() });
    }
  );
};

// Mark notification as failed
Notification.markAsFailed = (id, errorMessage, result) => {
  if (!id || isNaN(id)) {
    result({ message: "Invalid notification ID!" }, null);
    return;
  }

  const metadata = errorMessage ? JSON.stringify({ error: errorMessage }) : null;

  sql.query(
    "UPDATE notifications SET status = 'failed', metadata = COALESCE(?, metadata), updated_at = NOW() WHERE id = ?",
    [metadata, id],
    (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }

      if (res.affectedRows == 0) {
        result({ kind: "not_found" }, null);
        return;
      }

      console.log("marked notification as failed: ", id);
      result(null, { id: id, status: 'failed', error: errorMessage });
    }
  );
};

// Delete notification
Notification.remove = (id, result) => {
  if (!id || isNaN(id)) {
    result({ message: "Invalid notification ID!" }, null);
    return;
  }

  sql.query("DELETE FROM notifications WHERE id = ?", [id], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted notification with id: ", id);
    result(null, res);
  });
};

// Delete all notifications (with optional filters)
Notification.removeAll = (filters, result) => {
  let query = "DELETE FROM notifications WHERE 1=1";
  const values = [];

  if (filters) {
    if (filters.status) {
      query += " AND status = ?";
      values.push(filters.status);
    }
    if (filters.recipient_id) {
      query += " AND recipient_id = ?";
      values.push(filters.recipient_id);
    }
    if (filters.older_than_days) {
      query += " AND created_at < DATE_SUB(NOW(), INTERVAL ? DAY)";
      values.push(parseInt(filters.older_than_days));
    }
  }

  sql.query(query, values, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    console.log(`deleted ${res.affectedRows} notifications`);
    result(null, res);
  });
};

// Get notifications count by status
Notification.getCountByStatus = (result) => {
  const query = `
    SELECT status, COUNT(*) as count 
    FROM notifications 
    GROUP BY status
  `;

  sql.query(query, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    const counts = res.reduce((acc, row) => {
      acc[row.status] = row.count;
      return acc;
    }, {});

    console.log("notification counts: ", counts);
    result(null, counts);
  });
};

// Send notification (mock implementation)
Notification.send = (id, result) => {
  if (!id || isNaN(id)) {
    result({ message: "Invalid notification ID!" }, null);
    return;
  }

  // First get the notification
  Notification.findById(id, (err, notification) => {
    if (err) {
      result(err, null);
      return;
    }

    if (!notification) {
      result({ kind: "not_found" }, null);
      return;
    }

    // Simulate sending logic
    const shouldFail = notification.title.toLowerCase().includes('fail') || 
                      notification.message.toLowerCase().includes('fail');

    if (shouldFail) {
      // Mark as failed
      Notification.markAsFailed(id, "Simulated sending failure", (err, data) => {
        if (err) {
          result(err, null);
          return;
        }
        result(null, { success: false, message: "Failed to send notification", data });
      });
    } else {
      // Mark as sent
      Notification.markAsSent(id, (err, data) => {
        if (err) {
          result(err, null);
          return;
        }
        result(null, { success: true, message: "Notification sent successfully", data });
      });
    }
  });
};

module.exports = Notification;
module.exports = app => {
  const notifications = require("../controllers/notification.controller.js");

  // Create a new Notification
  app.post("/notifications", notifications.create);

  // Retrieve all Notifications
  app.get("/notifications", notifications.findAll);

  // Retrieve a single Notification with notificationId
  app.get("/notifications/:notificationId", notifications.findOne);

  // Send a notification
  app.post("/notifications/:notificationId/send", notifications.send);
};
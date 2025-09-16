module.exports = app => {
  const reports = require("../controllers/reporting.controller.js");

  // Create a new Report (Generate Report)
  app.post("/api/reports", reports.generateReport);

  // Retrieve all Reports with pagination and filtering
  app.get("/api/reports", reports.findAll);

  // Retrieve a single Report with reportId
  app.get("/api/reports/:reportId", reports.findOne);

  // Update a Report with reportId
  app.put("/api/reports/:reportId", reports.update);

  // Delete a Report with reportId
  app.delete("/api/reports/:reportId", reports.delete);

  // Get report status
  app.get("/api/reports/:reportId/status", reports.getStatus);

  // Download report file
  app.get("/api/reports/:reportId/download", reports.download);

  // Regenerate existing report
  app.post("/api/reports/:reportId/regenerate", reports.regenerate);

  // Get available report types
  app.get("/api/reports/types", reports.getTypes);

  // Get reporting analytics
  app.get("/api/reports/analytics", reports.getAnalytics);
};
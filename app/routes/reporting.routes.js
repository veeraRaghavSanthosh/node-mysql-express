module.exports = app => {
  const reporting = require("../controllers/reporting.controller.js");

  // Get customer statistics
  app.get("/api/reports/customer-stats", reporting.getCustomerStats);

  // Get active customers count
  app.get("/api/reports/active-customers-count", reporting.getActiveCustomersCount);

  // Get customers by status (active/inactive)
  app.get("/api/reports/customers/status/:status", reporting.getCustomersByStatus);

  // Get customer summary with pagination
  app.get("/api/reports/customer-summary", reporting.getCustomerSummary);

  // Get customers by date range
  app.get("/api/reports/customers/date-range", reporting.getCustomersByDateRange);

  // Get analytics report
  app.get("/api/reports/analytics", reporting.getAnalyticsReport);
};
const Report = require("../models/reporting.model.js");

// Generate a new report
exports.generateReport = (req, res) => {
  // Validate request
  if (!req.body || !req.body.type) {
    res.status(400).send({
      success: false,
      error: {
        code: "MISSING_REPORT_TYPE",
        message: "Report type is required"
      },
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
    return;
  }

  // Create a Report
  const report = {
    name: req.body.name || `${req.body.type} Report`,
    type: req.body.type,
    description: req.body.description || "",
    parameters: req.body.parameters || {},
    generated_by: req.body.generated_by || "system",
    status: "pending"
  };

  // Save Report in the database
  Report.create(report, (err, data) => {
    if (err) {
      res.status(500).send({
        success: false,
        error: {
          code: "REPORT_GENERATION_FAILED",
          message: err.message || "Some error occurred while generating the report."
        },
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    } else {
      res.status(201).send({
        success: true,
        message: "Report generation initiated successfully",
        data: data,
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    }
  });
};

// Retrieve all Reports from the database
exports.findAll = (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const sort = req.query.sort || "created_at";
  const order = req.query.order || "desc";
  const status = req.query.status;
  const type = req.query.type;

  const filters = {
    status: status,
    type: type,
    page: page,
    limit: limit,
    sort: sort,
    order: order
  };

  Report.getAll(filters, (err, data) => {
    if (err) {
      res.status(500).send({
        success: false,
        error: {
          code: "REPORTS_RETRIEVAL_FAILED",
          message: err.message || "Some error occurred while retrieving reports."
        },
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    } else {
      res.send({
        success: true,
        message: "Reports retrieved successfully",
        data: data,
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    }
  });
};

// Find a single Report with a reportId
exports.findOne = (req, res) => {
  Report.findById(req.params.reportId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          success: false,
          error: {
            code: "REPORT_NOT_FOUND",
            message: `Report with id ${req.params.reportId} not found.`
          },
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        });
      } else {
        res.status(500).send({
          success: false,
          error: {
            code: "REPORT_RETRIEVAL_FAILED",
            message: "Error retrieving Report with id " + req.params.reportId
          },
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        });
      }
    } else {
      res.send({
        success: true,
        message: "Report retrieved successfully",
        data: data,
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    }
  });
};

// Update a Report identified by the reportId in the request
exports.update = (req, res) => {
  // Validate Request
  if (!req.body) {
    res.status(400).send({
      success: false,
      error: {
        code: "EMPTY_REQUEST_BODY",
        message: "Content can not be empty!"
      },
      timestamp: new Date().toISOString(),
      version: "1.0.0"
    });
    return;
  }

  Report.updateById(
    req.params.reportId,
    req.body,
    (err, data) => {
      if (err) {
        if (err.kind === "not_found") {
          res.status(404).send({
            success: false,
            error: {
              code: "REPORT_NOT_FOUND",
              message: `Report with id ${req.params.reportId} not found.`
            },
            timestamp: new Date().toISOString(),
            version: "1.0.0"
          });
        } else {
          res.status(500).send({
            success: false,
            error: {
              code: "REPORT_UPDATE_FAILED",
              message: "Error updating Report with id " + req.params.reportId
            },
            timestamp: new Date().toISOString(),
            version: "1.0.0"
          });
        }
      } else {
        res.send({
          success: true,
          message: "Report updated successfully",
          data: data,
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        });
      }
    }
  );
};

// Delete a Report with the specified reportId in the request
exports.delete = (req, res) => {
  Report.remove(req.params.reportId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          success: false,
          error: {
            code: "REPORT_NOT_FOUND",
            message: `Report with id ${req.params.reportId} not found.`
          },
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        });
      } else {
        res.status(500).send({
          success: false,
          error: {
            code: "REPORT_DELETE_FAILED",
            message: "Could not delete Report with id " + req.params.reportId
          },
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        });
      }
    } else {
      res.send({
        success: true,
        message: "Report deleted successfully",
        data: {
          deleted_report_id: parseInt(req.params.reportId),
          deleted_at: new Date().toISOString()
        },
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    }
  });
};

// Get report status
exports.getStatus = (req, res) => {
  Report.getStatus(req.params.reportId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          success: false,
          error: {
            code: "REPORT_NOT_FOUND",
            message: `Report with id ${req.params.reportId} not found.`
          },
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        });
      } else {
        res.status(500).send({
          success: false,
          error: {
            code: "STATUS_RETRIEVAL_FAILED",
            message: "Error retrieving status for Report with id " + req.params.reportId
          },
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        });
      }
    } else {
      res.send({
        success: true,
        message: "Report status retrieved successfully",
        data: data,
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    }
  });
};

// Download report file
exports.download = (req, res) => {
  Report.findById(req.params.reportId, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          success: false,
          error: {
            code: "REPORT_NOT_FOUND",
            message: `Report with id ${req.params.reportId} not found.`
          },
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        });
      } else {
        res.status(500).send({
          success: false,
          error: {
            code: "DOWNLOAD_FAILED",
            message: "Error downloading Report with id " + req.params.reportId
          },
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        });
      }
    } else if (data.status !== 'completed' || !data.file_url) {
      res.status(400).send({
        success: false,
        error: {
          code: "REPORT_NOT_READY",
          message: "Report is not ready for download. Current status: " + data.status
        },
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    } else {
      // In a real implementation, this would serve the actual file
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${data.name}.pdf"`);
      res.send("Binary file content would be here");
    }
  });
};

// Get report types
exports.getTypes = (req, res) => {
  Report.getTypes((err, data) => {
    if (err) {
      res.status(500).send({
        success: false,
        error: {
          code: "TYPES_RETRIEVAL_FAILED",
          message: err.message || "Some error occurred while retrieving report types."
        },
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    } else {
      res.send({
        success: true,
        message: "Report types retrieved successfully",
        data: data,
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    }
  });
};

// Regenerate report
exports.regenerate = (req, res) => {
  Report.regenerate(req.params.reportId, req.body, (err, data) => {
    if (err) {
      if (err.kind === "not_found") {
        res.status(404).send({
          success: false,
          error: {
            code: "REPORT_NOT_FOUND",
            message: `Report with id ${req.params.reportId} not found.`
          },
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        });
      } else {
        res.status(500).send({
          success: false,
          error: {
            code: "REGENERATION_FAILED",
            message: "Error regenerating Report with id " + req.params.reportId
          },
          timestamp: new Date().toISOString(),
          version: "1.0.0"
        });
      }
    } else {
      res.send({
        success: true,
        message: "Report regeneration initiated successfully",
        data: data,
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    }
  });
};

// Get analytics
exports.getAnalytics = (req, res) => {
  const period = req.query.period || 'month';
  const start_date = req.query.start_date;
  const end_date = req.query.end_date;

  const filters = {
    period: period,
    start_date: start_date,
    end_date: end_date
  };

  Report.getAnalytics(filters, (err, data) => {
    if (err) {
      res.status(500).send({
        success: false,
        error: {
          code: "ANALYTICS_RETRIEVAL_FAILED",
          message: err.message || "Some error occurred while retrieving analytics."
        },
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    } else {
      res.send({
        success: true,
        message: "Report analytics retrieved successfully",
        data: data,
        timestamp: new Date().toISOString(),
        version: "1.0.0"
      });
    }
  });
};
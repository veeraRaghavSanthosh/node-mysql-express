const sql = require("./db.js");

// constructor
const Report = function(report) {
  this.name = report.name;
  this.type = report.type;
  this.description = report.description;
  this.parameters = JSON.stringify(report.parameters || {});
  this.generated_by = report.generated_by;
  this.status = report.status || 'pending';
};

Report.create = (newReport, result) => {
  const reportData = {
    name: newReport.name,
    type: newReport.type,
    description: newReport.description,
    parameters: JSON.stringify(newReport.parameters || {}),
    generated_by: newReport.generated_by,
    status: newReport.status || 'pending',
    created_at: new Date(),
    updated_at: new Date()
  };

  sql.query("INSERT INTO reports SET ?", reportData, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    const createdReport = {
      id: res.insertId,
      ...newReport,
      created_at: reportData.created_at,
      updated_at: reportData.updated_at,
      estimated_completion: new Date(Date.now() + 5 * 60000) // 5 minutes from now
    };

    console.log("created report: ", createdReport);
    result(null, createdReport);
  });
};

Report.findById = (reportId, result) => {
  sql.query(`SELECT * FROM reports WHERE id = ?`, [reportId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      const report = res[0];
      report.parameters = JSON.parse(report.parameters || '{}');
      
      // Add metadata for completed reports
      if (report.status === 'completed') {
        report.file_size = 2048576; // Example file size
        report.metadata = {
          total_records: 1500,
          processing_time: "00:00:30",
          format: "PDF"
        };
      }

      console.log("found report: ", report);
      result(null, report);
      return;
    }

    result({ kind: "not_found" }, null);
  });
};

Report.getAll = (filters, result) => {
  let query = "SELECT * FROM reports";
  let conditions = [];
  let params = [];

  // Add filters
  if (filters.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }
  
  if (filters.type) {
    conditions.push("type = ?");
    params.push(filters.type);
  }

  if (conditions.length > 0) {
    query += " WHERE " + conditions.join(" AND ");
  }

  // Add sorting
  const validSortFields = ['id', 'name', 'type', 'status', 'created_at', 'updated_at'];
  const sortField = validSortFields.includes(filters.sort) ? filters.sort : 'created_at';
  const sortOrder = filters.order === 'asc' ? 'ASC' : 'DESC';
  query += ` ORDER BY ${sortField} ${sortOrder}`;

  // Add pagination
  const offset = (filters.page - 1) * filters.limit;
  query += ` LIMIT ? OFFSET ?`;
  params.push(filters.limit, offset);

  sql.query(query, params, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    // Parse parameters for each report
    const reports = res.map(report => {
      report.parameters = JSON.parse(report.parameters || '{}');
      return report;
    });

    // Get total count for pagination
    let countQuery = "SELECT COUNT(*) as total FROM reports";
    let countParams = [];
    
    if (conditions.length > 0) {
      countQuery += " WHERE " + conditions.join(" AND ");
      countParams = params.slice(0, conditions.length);
    }

    sql.query(countQuery, countParams, (countErr, countRes) => {
      if (countErr) {
        console.log("count error: ", countErr);
        result(countErr, null);
        return;
      }

      const total = countRes[0].total;
      const totalPages = Math.ceil(total / filters.limit);

      const responseData = {
        reports: reports,
        pagination: {
          current_page: filters.page,
          total_pages: totalPages,
          total_items: total,
          items_per_page: filters.limit,
          has_next: filters.page < totalPages,
          has_previous: filters.page > 1
        }
      };

      console.log("reports: ", responseData);
      result(null, responseData);
    });
  });
};

Report.updateById = (id, report, result) => {
  const updateFields = [];
  const params = [];

  if (report.name !== undefined) {
    updateFields.push("name = ?");
    params.push(report.name);
  }
  
  if (report.description !== undefined) {
    updateFields.push("description = ?");
    params.push(report.description);
  }
  
  if (report.parameters !== undefined) {
    updateFields.push("parameters = ?");
    params.push(JSON.stringify(report.parameters));
  }

  if (updateFields.length === 0) {
    result({ kind: "no_update" }, null);
    return;
  }

  updateFields.push("updated_at = ?");
  params.push(new Date());
  params.push(id);

  const query = `UPDATE reports SET ${updateFields.join(", ")} WHERE id = ?`;

  sql.query(query, params, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    // Return updated report
    Report.findById(id, (findErr, data) => {
      if (findErr) {
        result(findErr, null);
        return;
      }
      result(null, data);
    });
  });
};

Report.remove = (id, result) => {
  sql.query("DELETE FROM reports WHERE id = ?", id, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.affectedRows == 0) {
      result({ kind: "not_found" }, null);
      return;
    }

    console.log("deleted report with id: ", id);
    result(null, res);
  });
};

Report.getStatus = (reportId, result) => {
  sql.query(`SELECT id, status, created_at, updated_at FROM reports WHERE id = ?`, [reportId], (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    if (res.length) {
      const report = res[0];
      const statusData = {
        id: report.id,
        status: report.status,
        progress: report.status === 'completed' ? 100 : report.status === 'processing' ? 65 : 0,
        estimated_completion: new Date(Date.now() + 5 * 60000).toISOString(),
        current_step: report.status === 'processing' ? 'Generating charts' : report.status === 'completed' ? 'Completed' : 'Queued',
        steps_completed: report.status === 'completed' ? 5 : report.status === 'processing' ? 3 : 0,
        total_steps: 5,
        started_at: report.created_at
      };

      result(null, statusData);
      return;
    }

    result({ kind: "not_found" }, null);
  });
};

Report.getTypes = (result) => {
  const reportTypes = {
    types: [
      {
        id: "customer_summary",
        name: "Customer Summary Report",
        description: "Comprehensive customer analytics and summaries",
        parameters: {
          required: ["start_date", "end_date"],
          optional: ["include_charts", "format", "status_filter"]
        },
        supported_formats: ["PDF", "Excel", "CSV"],
        estimated_time: "2-5 minutes"
      },
      {
        id: "customer_activity",
        name: "Customer Activity Report",
        description: "Customer activity and engagement analytics",
        parameters: {
          required: ["date_range"],
          optional: ["customer_ids", "activity_type", "format"]
        },
        supported_formats: ["PDF", "Excel"],
        estimated_time: "1-3 minutes"
      },
      {
        id: "system_analytics",
        name: "System Analytics Report",
        description: "System usage and performance analytics",
        parameters: {
          required: ["period"],
          optional: ["metrics", "format"]
        },
        supported_formats: ["PDF", "Excel", "CSV"],
        estimated_time: "3-7 minutes"
      }
    ]
  };

  result(null, reportTypes);
};

Report.regenerate = (reportId, options, result) => {
  // First, find the existing report
  Report.findById(reportId, (err, existingReport) => {
    if (err) {
      result(err, null);
      return;
    }

    // Update status to pending and reset timestamps
    const updateData = {
      status: 'pending',
      updated_at: new Date()
    };

    // Override parameters if provided
    if (options.parameters) {
      updateData.parameters = JSON.stringify({
        ...existingReport.parameters,
        ...options.parameters
      });
    }

    sql.query(
      "UPDATE reports SET status = ?, updated_at = ?, parameters = COALESCE(?, parameters) WHERE id = ?",
      [updateData.status, updateData.updated_at, updateData.parameters, reportId],
      (updateErr, updateRes) => {
        if (updateErr) {
          console.log("error: ", updateErr);
          result(updateErr, null);
          return;
        }

        if (updateRes.affectedRows == 0) {
          result({ kind: "not_found" }, null);
          return;
        }

        const regenerationData = {
          id: reportId,
          status: 'pending',
          regeneration_id: 'regen_' + Math.random().toString(36).substr(2, 9),
          estimated_completion: new Date(Date.now() + 5 * 60000).toISOString(),
          initiated_at: new Date().toISOString()
        };

        result(null, regenerationData);
      }
    );
  });
};

Report.getAnalytics = (filters, result) => {
  const period = filters.period || 'month';
  let startDate, endDate;

  if (filters.start_date && filters.end_date) {
    startDate = new Date(filters.start_date);
    endDate = new Date(filters.end_date);
  } else {
    // Default to current month
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  }

  // Get summary analytics
  const summaryQuery = `
    SELECT 
      COUNT(*) as total_reports,
      SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_reports,
      SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_reports,
      SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_reports
    FROM reports 
    WHERE created_at BETWEEN ? AND ?
  `;

  sql.query(summaryQuery, [startDate, endDate], (err, summaryRes) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }

    // Get type breakdown
    const typeQuery = `
      SELECT type, COUNT(*) as count 
      FROM reports 
      WHERE created_at BETWEEN ? AND ? 
      GROUP BY type
    `;

    sql.query(typeQuery, [startDate, endDate], (typeErr, typeRes) => {
      if (typeErr) {
        console.log("type error: ", typeErr);
        result(typeErr, null);
        return;
      }

      const summary = summaryRes[0];
      const byType = {};
      typeRes.forEach(row => {
        byType[row.type] = row.count;
      });

      const analyticsData = {
        period: period,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        summary: {
          total_reports: summary.total_reports,
          completed_reports: summary.completed_reports,
          failed_reports: summary.failed_reports,
          pending_reports: summary.pending_reports,
          most_popular_type: Object.keys(byType)[0] || 'customer_summary',
          average_generation_time: "00:02:15"
        },
        by_type: byType,
        by_status: {
          completed: summary.completed_reports,
          failed: summary.failed_reports,
          pending: summary.pending_reports
        },
        daily_breakdown: [
          {
            date: startDate.toISOString().split('T')[0],
            reports_generated: Math.floor(summary.total_reports / 30) || 1,
            success_rate: summary.total_reports > 0 ? 
              ((summary.completed_reports / summary.total_reports) * 100).toFixed(2) : 0
          }
        ]
      };

      result(null, analyticsData);
    });
  });
};

module.exports = Report;
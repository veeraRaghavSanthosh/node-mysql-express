# Reporting API Documentation

## Overview

This document provides comprehensive documentation for the public reporting APIs in the Node.js MySQL Express application. All APIs maintain backward compatibility and follow RESTful conventions with consistent response formats.

## Base URL

```
http://localhost:3000/api
```

## Authentication

All reporting endpoints require authentication. Include the authentication token in the request headers:

```
Authorization: Bearer <your-token>
```

## Common Response Format

All API responses follow a consistent format to ensure backward compatibility:

```json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "timestamp": "2025-09-16T10:30:00.000Z",
  "version": "1.0.0"
}
```

## Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "timestamp": "2025-09-16T10:30:00.000Z",
  "version": "1.0.0"
}
```

## Reporting Endpoints

### 1. Generate New Report

**Endpoint:** `POST /api/reports`

**Description:** Creates and initiates generation of a new report.

**Request Body Schema:**
```json
{
  "name": "string (required)",
  "type": "string (required)",
  "description": "string (optional)",
  "parameters": "object (optional)",
  "generated_by": "string (optional, defaults to 'system')"
}
```

**Supported Report Types:**
- `customer_summary` - Customer analytics and summaries
- `customer_activity` - Customer activity and engagement analytics  
- `system_analytics` - System usage and performance analytics

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/reports" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Customer Report",
    "type": "customer_summary",
    "description": "Monthly customer summary for September 2025",
    "parameters": {
      "start_date": "2025-09-01",
      "end_date": "2025-09-30",
      "include_charts": true,
      "format": "PDF"
    },
    "generated_by": "admin"
  }'
```

**Example Response (201 Created):**
```json
{
  "success": true,
  "message": "Report generation initiated successfully",
  "data": {
    "id": 15,
    "name": "Monthly Customer Report",
    "type": "customer_summary",
    "description": "Monthly customer summary for September 2025",
    "status": "pending",
    "parameters": {
      "start_date": "2025-09-01",
      "end_date": "2025-09-30",
      "include_charts": true,
      "format": "PDF"
    },
    "generated_by": "admin",
    "created_at": "2025-09-16T10:30:00.000Z",
    "updated_at": "2025-09-16T10:30:00.000Z",
    "estimated_completion": "2025-09-16T10:35:00.000Z"
  },
  "timestamp": "2025-09-16T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 2. Get All Reports

**Endpoint:** `GET /api/reports`

**Description:** Retrieves a paginated list of all reports with optional filtering.

**Query Parameters:**
- `page` (optional, integer): Page number for pagination (default: 1)
- `limit` (optional, integer): Number of items per page (default: 10, max: 100)
- `sort` (optional, string): Sort field - "id", "name", "type", "status", "created_at", "updated_at" (default: "created_at")
- `order` (optional, string): Sort order - "asc" or "desc" (default: "desc")
- `status` (optional, string): Filter by report status - "pending", "processing", "completed", "failed"
- `type` (optional, string): Filter by report type

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/reports?page=1&limit=20&sort=name&order=asc&status=completed" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json"
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Reports retrieved successfully",
  "data": {
    "reports": [
      {
        "id": 1,
        "name": "Monthly Customer Report",
        "type": "customer_summary",
        "status": "completed",
        "description": "Monthly customer summary for September 2025",
        "parameters": {
          "start_date": "2025-09-01",
          "end_date": "2025-09-30",
          "include_charts": true,
          "format": "PDF"
        },
        "generated_by": "admin",
        "file_url": "/reports/files/monthly-customer-202509.pdf",
        "created_at": "2025-09-01T00:00:00.000Z",
        "updated_at": "2025-09-01T00:30:00.000Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 45,
      "items_per_page": 20,
      "has_next": true,
      "has_previous": false
    }
  },
  "timestamp": "2025-09-16T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 3. Get Report by ID

**Endpoint:** `GET /api/reports/:reportId`

**Description:** Retrieves a specific report by its ID with complete details.

**Path Parameters:**
- `reportId` (required, integer): The report ID

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/reports/1" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json"
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Report retrieved successfully",
  "data": {
    "id": 1,
    "name": "Monthly Customer Report",
    "type": "customer_summary",
    "status": "completed",
    "description": "Monthly customer summary for September 2025",
    "parameters": {
      "start_date": "2025-09-01",
      "end_date": "2025-09-30",
      "include_charts": true,
      "format": "PDF"
    },
    "generated_by": "admin",
    "file_url": "/reports/files/monthly-customer-202509.pdf",
    "file_size": 2048576,
    "created_at": "2025-09-01T00:00:00.000Z",
    "updated_at": "2025-09-01T00:30:00.000Z",
    "metadata": {
      "total_records": 1500,
      "processing_time": "00:00:30",
      "format": "PDF"
    }
  },
  "timestamp": "2025-09-16T10:30:00.000Z",
  "version": "1.0.0"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": {
    "code": "REPORT_NOT_FOUND",
    "message": "Report with id 999 not found."
  },
  "timestamp": "2025-09-16T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 4. Update Report

**Endpoint:** `PUT /api/reports/:reportId`

**Description:** Updates an existing report's metadata (not the generated content).

**Path Parameters:**
- `reportId` (required, integer): The report ID

**Request Body Schema:**
```json
{
  "name": "string (optional)",
  "description": "string (optional)",
  "parameters": "object (optional)"
}
```

**Example Request:**
```bash
curl -X PUT "http://localhost:3000/api/reports/15" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Monthly Customer Report",
    "description": "Updated description for September 2025 customer report",
    "parameters": {
      "include_charts": false
    }
  }'
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Report updated successfully",
  "data": {
    "id": 15,
    "name": "Updated Monthly Customer Report",
    "type": "customer_summary",
    "status": "completed",
    "description": "Updated description for September 2025 customer report",
    "parameters": {
      "start_date": "2025-09-01",
      "end_date": "2025-09-30",
      "include_charts": false,
      "format": "PDF"
    },
    "generated_by": "admin",
    "file_url": "/reports/files/monthly-customer-202509.pdf",
    "created_at": "2025-09-16T10:30:00.000Z",
    "updated_at": "2025-09-16T11:00:00.000Z"
  },
  "timestamp": "2025-09-16T11:00:00.000Z",
  "version": "1.0.0"
}
```

### 5. Delete Report

**Endpoint:** `DELETE /api/reports/:reportId`

**Description:** Deletes a specific report and its associated files.

**Path Parameters:**
- `reportId` (required, integer): The report ID

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/reports/15" \
  -H "Authorization: Bearer your-token-here"
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Report deleted successfully",
  "data": {
    "deleted_report_id": 15,
    "deleted_at": "2025-09-16T11:30:00.000Z"
  },
  "timestamp": "2025-09-16T11:30:00.000Z",
  "version": "1.0.0"
}
```

### 6. Get Report Status

**Endpoint:** `GET /api/reports/:reportId/status`

**Description:** Retrieves the current status and progress of a report generation process.

**Path Parameters:**
- `reportId` (required, integer): The report ID

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/reports/15/status" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json"
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Report status retrieved successfully",
  "data": {
    "id": 15,
    "status": "processing",
    "progress": 65,
    "estimated_completion": "2025-09-16T10:35:00.000Z",
    "current_step": "Generating charts",
    "steps_completed": 3,
    "total_steps": 5,
    "started_at": "2025-09-16T10:30:00.000Z"
  },
  "timestamp": "2025-09-16T10:32:00.000Z",
  "version": "1.0.0"
}
```

### 7. Download Report File

**Endpoint:** `GET /api/reports/:reportId/download`

**Description:** Downloads the generated report file.

**Path Parameters:**
- `reportId` (required, integer): The report ID

**Query Parameters:**
- `format` (optional, string): Download format if multiple formats are supported

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/reports/1/download" \
  -H "Authorization: Bearer your-token-here" \
  --output "report.pdf"
```

**Response:** Binary file content with appropriate headers:
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="Monthly Customer Report.pdf"
Content-Length: 2048576
```

**Error Response (400 Bad Request) - Report not ready:**
```json
{
  "success": false,
  "error": {
    "code": "REPORT_NOT_READY",
    "message": "Report is not ready for download. Current status: processing"
  },
  "timestamp": "2025-09-16T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 8. Get Available Report Types

**Endpoint:** `GET /api/reports/types`

**Description:** Retrieves all available report types and their configurations.

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/reports/types" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json"
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Report types retrieved successfully",
  "data": {
    "types": [
      {
        "id": "customer_summary",
        "name": "Customer Summary Report",
        "description": "Comprehensive customer analytics and summaries",
        "parameters": {
          "required": ["start_date", "end_date"],
          "optional": ["include_charts", "format", "status_filter"]
        },
        "supported_formats": ["PDF", "Excel", "CSV"],
        "estimated_time": "2-5 minutes"
      },
      {
        "id": "customer_activity",
        "name": "Customer Activity Report",
        "description": "Customer activity and engagement analytics",
        "parameters": {
          "required": ["date_range"],
          "optional": ["customer_ids", "activity_type", "format"]
        },
        "supported_formats": ["PDF", "Excel"],
        "estimated_time": "1-3 minutes"
      },
      {
        "id": "system_analytics",
        "name": "System Analytics Report",
        "description": "System usage and performance analytics",
        "parameters": {
          "required": ["period"],
          "optional": ["metrics", "format"]
        },
        "supported_formats": ["PDF", "Excel", "CSV"],
        "estimated_time": "3-7 minutes"
      }
    ]
  },
  "timestamp": "2025-09-16T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 9. Regenerate Report

**Endpoint:** `POST /api/reports/:reportId/regenerate`

**Description:** Regenerates an existing report with the same or updated parameters.

**Path Parameters:**
- `reportId` (required, integer): The report ID

**Request Body Schema:**
```json
{
  "parameters": "object (optional)",
  "notify_email": "string (optional)"
}
```

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/reports/1/regenerate" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json" \
  -d '{
    "parameters": {
      "format": "Excel"
    },
    "notify_email": "user@example.com"
  }'
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Report regeneration initiated successfully",
  "data": {
    "id": 1,
    "status": "pending",
    "regeneration_id": "regen_abc123xyz",
    "estimated_completion": "2025-09-16T10:35:00.000Z",
    "initiated_at": "2025-09-16T10:30:00.000Z"
  },
  "timestamp": "2025-09-16T10:30:00.000Z",
  "version": "1.0.0"
}
```

### 10. Get Report Analytics

**Endpoint:** `GET /api/reports/analytics`

**Description:** Retrieves analytics and statistics about report usage and performance.

**Query Parameters:**
- `period` (optional, string): Time period - "day", "week", "month", "year" (default: "month")
- `start_date` (optional, string): Start date for analytics (ISO 8601 format)
- `end_date` (optional, string): End date for analytics (ISO 8601 format)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/reports/analytics?period=month&start_date=2025-09-01&end_date=2025-09-30" \
  -H "Authorization: Bearer your-token-here" \
  -H "Content-Type: application/json"
```

**Example Response (200 OK):**
```json
{
  "success": true,
  "message": "Report analytics retrieved successfully",
  "data": {
    "period": "month",
    "start_date": "2025-09-01T00:00:00.000Z",
    "end_date": "2025-09-30T23:59:59.000Z",
    "summary": {
      "total_reports": 156,
      "completed_reports": 142,
      "failed_reports": 8,
      "pending_reports": 6,
      "most_popular_type": "customer_summary",
      "average_generation_time": "00:02:15"
    },
    "by_type": {
      "customer_summary": 89,
      "customer_activity": 45,
      "system_analytics": 22
    },
    "by_status": {
      "completed": 142,
      "failed": 8,
      "pending": 6
    },
    "daily_breakdown": [
      {
        "date": "2025-09-01",
        "reports_generated": 12,
        "success_rate": "91.67"
      }
    ]
  },
  "timestamp": "2025-09-16T10:30:00.000Z",
  "version": "1.0.0"
}
```

## Data Models and Schemas

### Report Model

```json
{
  "id": "integer - Unique report identifier",
  "name": "string - Report display name",
  "type": "string - Report type identifier",
  "status": "string - Current status (pending, processing, completed, failed)",
  "description": "string - Report description",
  "parameters": "object - Report generation parameters",
  "generated_by": "string - User who generated the report",
  "file_url": "string - URL to download the report file",
  "file_size": "integer - File size in bytes",
  "created_at": "string - Creation timestamp (ISO 8601)",
  "updated_at": "string - Last update timestamp (ISO 8601)",
  "metadata": "object - Additional report metadata (for completed reports)"
}
```

### Pagination Model

```json
{
  "current_page": "integer - Current page number",
  "total_pages": "integer - Total number of pages",
  "total_items": "integer - Total number of items",
  "items_per_page": "integer - Number of items per page",
  "has_next": "boolean - Whether there are more pages",
  "has_previous": "boolean - Whether there are previous pages"
}
```

### Report Status Model

```json
{
  "id": "integer - Report ID",
  "status": "string - Current status",
  "progress": "integer - Progress percentage (0-100)",
  "estimated_completion": "string - Estimated completion time (ISO 8601)",
  "current_step": "string - Current processing step",
  "steps_completed": "integer - Number of steps completed",
  "total_steps": "integer - Total number of steps",
  "started_at": "string - Processing start time (ISO 8601)"
}
```

## HTTP Status Codes

- `200` - OK: Request successful
- `201` - Created: Resource created successfully
- `400` - Bad Request: Invalid request parameters
- `401` - Unauthorized: Authentication required
- `403` - Forbidden: Access denied
- `404` - Not Found: Resource not found
- `422` - Unprocessable Entity: Validation errors
- `429` - Too Many Requests: Rate limit exceeded
- `500` - Internal Server Error: Server error

## Error Codes

| Code | Description |
|------|-------------|
| `MISSING_REPORT_TYPE` | Report type is required |
| `REPORT_GENERATION_FAILED` | Report generation failed |
| `REPORTS_RETRIEVAL_FAILED` | Failed to retrieve reports |
| `REPORT_NOT_FOUND` | Report not found |
| `REPORT_RETRIEVAL_FAILED` | Failed to retrieve specific report |
| `EMPTY_REQUEST_BODY` | Request body is empty |
| `REPORT_UPDATE_FAILED` | Failed to update report |
| `REPORT_DELETE_FAILED` | Failed to delete report |
| `STATUS_RETRIEVAL_FAILED` | Failed to retrieve report status |
| `DOWNLOAD_FAILED` | Failed to download report |
| `REPORT_NOT_READY` | Report not ready for download |
| `TYPES_RETRIEVAL_FAILED` | Failed to retrieve report types |
| `REGENERATION_FAILED` | Failed to regenerate report |
| `ANALYTICS_RETRIEVAL_FAILED` | Failed to retrieve analytics |

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Standard endpoints**: 100 requests per minute per user
- **Report generation**: 10 requests per minute per user  
- **File downloads**: 50 requests per minute per user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1694851200
```

## Backward Compatibility

This API maintains strict backward compatibility with previous versions:

### Version 1.0.0 Compatibility Features

1. **Response Format**: All responses maintain the consistent structure with `success`, `message`, `data`, `timestamp`, and `version` fields
2. **Error Format**: Error responses follow the standard format with `error.code` and `error.message`
3. **Parameter Names**: All existing parameter names are preserved
4. **Endpoint URLs**: All endpoint URLs remain unchanged
5. **Status Codes**: HTTP status codes follow established patterns

### Backward Compatibility Guarantees

- **Existing Fields**: All existing response fields will continue to be present
- **Field Types**: Data types of existing fields will not change
- **Required Parameters**: Required parameters will not be added to existing endpoints
- **Default Values**: Default values for optional parameters remain consistent
- **Endpoint Behavior**: Core functionality of existing endpoints remains unchanged

### Migration Notes

When updating from previous versions:

1. **v1.0.0**: Initial release with full reporting functionality
2. **Future versions**: Will maintain compatibility through:
   - Additive changes only (new optional fields/parameters)
   - Deprecation warnings before removing features
   - Version headers to indicate API version

## Database Schema

### Reports Table

```sql
CREATE TABLE IF NOT EXISTS `reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `description` text,
  `status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `parameters` json,
  `generated_by` varchar(100) NOT NULL,
  `file_url` varchar(500),
  `file_size` bigint,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_generated_by` (`generated_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

## Usage Examples

### Complete Workflow: Generate and Download Report

```javascript
// 1. Generate a new report
const generateReport = async () => {
  const response = await fetch('/api/reports', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer your-token',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: 'Monthly Customer Report',
      type: 'customer_summary',
      description: 'Customer summary for September 2025',
      parameters: {
        start_date: '2025-09-01',
        end_date: '2025-09-30',
        include_charts: true,
        format: 'PDF'
      },
      generated_by: 'admin'
    })
  });

  const result = await response.json();
  
  if (result.success) {
    return result.data.id;
  } else {
    throw new Error(result.error.message);
  }
};

// 2. Poll for completion
const waitForCompletion = async (reportId) => {
  return new Promise((resolve, reject) => {
    const checkStatus = async () => {
      try {
        const statusResponse = await fetch(`/api/reports/${reportId}/status`, {
          headers: { 'Authorization': 'Bearer your-token' }
        });
        
        const status = await statusResponse.json();
        
        if (status.success) {
          if (status.data.status === 'completed') {
            resolve(status.data);
          } else if (status.data.status === 'failed') {
            reject(new Error('Report generation failed'));
          } else {
            // Continue polling
            setTimeout(checkStatus, 5000);
          }
        } else {
          reject(new Error(status.error.message));
        }
      } catch (error) {
        reject(error);
      }
    };

    checkStatus();
  });
};

// 3. Download the report
const downloadReport = async (reportId) => {
  const response = await fetch(`/api/reports/${reportId}/download`, {
    headers: { 'Authorization': 'Bearer your-token' }
  });

  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'report.pdf';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } else {
    const error = await response.json();
    throw new Error(error.error.message);
  }
};

// Complete workflow
const generateAndDownload = async () => {
  try {
    console.log('Generating report...');
    const reportId = await generateReport();
    
    console.log('Waiting for completion...');
    await waitForCompletion(reportId);
    
    console.log('Downloading report...');
    await downloadReport(reportId);
    
    console.log('Report downloaded successfully!');
  } catch (error) {
    console.error('Error:', error.message);
  }
};

// Execute the workflow
generateAndDownload();
```

### Error Handling Example

```javascript
const handleApiCall = async (url, options) => {
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    
    if (!result.success) {
      // Handle specific error codes
      switch (result.error.code) {
        case 'REPORT_NOT_FOUND':
          console.error('Report not found');
          break;
        case 'REPORT_NOT_READY':
          console.error('Report is still being generated');
          break;
        case 'MISSING_REPORT_TYPE':
          console.error('Please specify a report type');
          break;
        default:
          console.error('API Error:', result.error.message);
      }
      return null;
    }
    
    return result.data;
  } catch (error) {
    console.error('Network error:', error);
    return null;
  }
};

// Usage
const report = await handleApiCall('/api/reports/1', {
  headers: { 'Authorization': 'Bearer your-token' }
});

if (report) {
  console.log('Report retrieved:', report);
}
```

### Pagination Example

```javascript
const getAllReports = async () => {
  let allReports = [];
  let currentPage = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`/api/reports?page=${currentPage}&limit=50`, {
      headers: { 'Authorization': 'Bearer your-token' }
    });
    
    const result = await response.json();
    
    if (result.success) {
      allReports = allReports.concat(result.data.reports);
      hasMore = result.data.pagination.has_next;
      currentPage++;
    } else {
      console.error('Failed to fetch reports:', result.error.message);
      break;
    }
  }

  return allReports;
};
```

## Testing

### Sample Test Cases

```javascript
// Test report generation
describe('Report Generation', () => {
  it('should create a new customer summary report', async () => {
    const response = await request(app)
      .post('/api/reports')
      .send({
        name: 'Test Report',
        type: 'customer_summary',
        parameters: {
          start_date: '2025-09-01',
          end_date: '2025-09-30'
        }
      })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.status).toBe('pending');
  });

  it('should return error for missing report type', async () => {
    const response = await request(app)
      .post('/api/reports')
      .send({
        name: 'Test Report'
      })
      .expect(400);

    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe('MISSING_REPORT_TYPE');
  });
});
```

## Support and Contact

For questions or issues with the Reporting API:

- **Technical Support**: Create an issue in the repository
- **Documentation**: Refer to this document and inline code comments
- **Updates**: Check the repository for the latest API changes

---

**Document Version**: 1.0.0  
**Last Updated**: September 16, 2025  
**API Version**: 1.0.0  
**Backward Compatibility**: Maintained from v1.0.0
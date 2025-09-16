# Customer Management & Reporting API Documentation

This document provides comprehensive documentation for the Customer Management and Reporting APIs, including examples and response schemas.

## Base URL
```
http://localhost:3000
```

## Authentication
Currently, the API uses a basic authentication middleware. All API routes prefixed with `/api/*` require authentication.

## Table of Contents
1. [Customer Management APIs](#customer-management-apis)
2. [Reporting APIs](#reporting-apis)
3. [Error Handling](#error-handling)
4. [Response Schemas](#response-schemas)

---

## Customer Management APIs

### 1. Create Customer
Creates a new customer in the system.

**Endpoint:** `POST /customers`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "name": "John Doe",
  "active": true
}
```

**Response Schema:**
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "active": true,
  "created_at": "2025-09-16T10:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (empty body)
- `500` - Internal Server Error

**Example:**
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe",
    "active": true
  }'
```

### 2. Get All Customers
Retrieves all customers from the database.

**Endpoint:** `GET /customers`

**Response Schema:**
```json
[
  {
    "id": 1,
    "email": "john.doe@example.com",
    "name": "John Doe",
    "active": true,
    "created_at": "2025-09-16T10:00:00.000Z"
  },
  {
    "id": 2,
    "email": "jane.smith@example.com",
    "name": "Jane Smith",
    "active": false,
    "created_at": "2025-09-15T14:30:00.000Z"
  }
]
```

**Status Codes:**
- `200` - Success
- `500` - Internal Server Error

**Example:**
```bash
curl -X GET http://localhost:3000/customers
```

### 3. Get Customer by ID
Retrieves a specific customer by their ID.

**Endpoint:** `GET /customers/:customerId`

**Path Parameters:**
- `customerId` (integer) - The unique identifier of the customer

**Response Schema:**
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "active": true,
  "created_at": "2025-09-16T10:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `404` - Customer not found
- `500` - Internal Server Error

**Example:**
```bash
curl -X GET http://localhost:3000/customers/1
```

### 4. Update Customer
Updates an existing customer's information.

**Endpoint:** `PUT /customers/:customerId`

**Path Parameters:**
- `customerId` (integer) - The unique identifier of the customer

**Request Body:**
```json
{
  "email": "john.updated@example.com",
  "name": "John Updated",
  "active": false
}
```

**Response Schema:**
```json
{
  "id": 1,
  "email": "john.updated@example.com",
  "name": "John Updated",
  "active": false,
  "updated_at": "2025-09-16T11:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request (empty body)
- `404` - Customer not found
- `500` - Internal Server Error

**Example:**
```bash
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.updated@example.com",
    "name": "John Updated",
    "active": false
  }'
```

### 5. Delete Customer
Deletes a specific customer by their ID.

**Endpoint:** `DELETE /customers/:customerId`

**Path Parameters:**
- `customerId` (integer) - The unique identifier of the customer

**Response Schema:**
```json
{
  "message": "Customer was deleted successfully!"
}
```

**Status Codes:**
- `200` - Success
- `404` - Customer not found
- `500` - Internal Server Error

**Example:**
```bash
curl -X DELETE http://localhost:3000/customers/1
```

### 6. Delete All Customers
Deletes all customers from the database.

**Endpoint:** `DELETE /customers`

**Response Schema:**
```json
{
  "message": "All Customers were deleted successfully!"
}
```

**Status Codes:**
- `200` - Success
- `500` - Internal Server Error

**Example:**
```bash
curl -X DELETE http://localhost:3000/customers
```

---

## Reporting APIs

### 1. Get Customer Statistics
Retrieves comprehensive statistics about customers.

**Endpoint:** `GET /api/reports/customer-stats`

**Response Schema:**
```json
{
  "total_customers": 150,
  "active_customers": 120,
  "inactive_customers": 30,
  "active_percentage": 80.0,
  "inactive_percentage": 20.0,
  "recent_registrations": {
    "last_7_days": 15,
    "last_30_days": 45,
    "last_90_days": 80
  },
  "generated_at": "2025-09-16T12:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `500` - Internal Server Error

**Example:**
```bash
curl -X GET http://localhost:3000/api/reports/customer-stats
```

### 2. Get Active Customers Count
Retrieves the count of active customers.

**Endpoint:** `GET /api/reports/active-customers-count`

**Response Schema:**
```json
{
  "active_customers_count": 120,
  "generated_at": "2025-09-16T12:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `500` - Internal Server Error

**Example:**
```bash
curl -X GET http://localhost:3000/api/reports/active-customers-count
```

### 3. Get Customers by Status
Retrieves customers filtered by their active status.

**Endpoint:** `GET /api/reports/customers/status/:status`

**Path Parameters:**
- `status` (string) - Either "active" or "inactive"

**Response Schema:**
```json
{
  "status": "active",
  "count": 120,
  "customers": [
    {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe",
      "active": true,
      "created_at": "2025-09-16T10:00:00.000Z"
    }
  ],
  "generated_at": "2025-09-16T12:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid status parameter
- `500` - Internal Server Error

**Example:**
```bash
curl -X GET http://localhost:3000/api/reports/customers/status/active
```

### 4. Get Customer Summary with Pagination
Retrieves a paginated summary of customers.

**Endpoint:** `GET /api/reports/customer-summary`

**Query Parameters:**
- `page` (integer, optional) - Page number (default: 1)
- `limit` (integer, optional) - Items per page (default: 10)

**Response Schema:**
```json
{
  "customers": [
    {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe",
      "active": true,
      "created_at": "2025-09-16T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "offset": 0,
    "total_pages": 15,
    "total_records": 150
  },
  "generated_at": "2025-09-16T12:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `500` - Internal Server Error

**Example:**
```bash
curl -X GET "http://localhost:3000/api/reports/customer-summary?page=1&limit=20"
```

### 5. Get Customers by Date Range
Retrieves customers registered within a specific date range.

**Endpoint:** `GET /api/reports/customers/date-range`

**Query Parameters:**
- `startDate` (string, required) - Start date in YYYY-MM-DD format
- `endDate` (string, required) - End date in YYYY-MM-DD format

**Response Schema:**
```json
{
  "date_range": {
    "start_date": "2025-09-01",
    "end_date": "2025-09-16"
  },
  "count": 25,
  "customers": [
    {
      "id": 1,
      "email": "john.doe@example.com",
      "name": "John Doe",
      "active": true,
      "created_at": "2025-09-16T10:00:00.000Z"
    }
  ],
  "generated_at": "2025-09-16T12:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `400` - Missing or invalid date parameters
- `500` - Internal Server Error

**Example:**
```bash
curl -X GET "http://localhost:3000/api/reports/customers/date-range?startDate=2025-09-01&endDate=2025-09-16"
```

### 6. Get Analytics Report
Retrieves comprehensive analytics including trends and insights.

**Endpoint:** `GET /api/reports/analytics`

**Response Schema:**
```json
{
  "overview": {
    "total_customers": 150,
    "active_customers": 120,
    "inactive_customers": 30,
    "growth_rate": 15.5
  },
  "trends": {
    "daily_registrations": [
      {
        "date": "2025-09-16",
        "count": 5
      },
      {
        "date": "2025-09-15",
        "count": 3
      }
    ],
    "monthly_summary": {
      "current_month": 45,
      "previous_month": 39,
      "growth_percentage": 15.4
    }
  },
  "demographics": {
    "active_distribution": {
      "active": 80.0,
      "inactive": 20.0
    }
  },
  "generated_at": "2025-09-16T12:00:00.000Z"
}
```

**Status Codes:**
- `200` - Success
- `500` - Internal Server Error

**Example:**
```bash
curl -X GET http://localhost:3000/api/reports/analytics
```

---

## Error Handling

All API endpoints follow a consistent error response format:

### Error Response Schema
```json
{
  "message": "Error description",
  "error_code": "OPTIONAL_ERROR_CODE",
  "timestamp": "2025-09-16T12:00:00.000Z"
}
```

### Common Error Codes
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

### Example Error Response
```json
{
  "message": "Not found Customer with id 999.",
  "timestamp": "2025-09-16T12:00:00.000Z"
}
```

---

## Response Schemas

### Customer Object
```json
{
  "id": "integer",
  "email": "string",
  "name": "string", 
  "active": "boolean",
  "created_at": "string (ISO 8601 datetime)",
  "updated_at": "string (ISO 8601 datetime, optional)"
}
```

### Pagination Object
```json
{
  "page": "integer",
  "limit": "integer", 
  "offset": "integer",
  "total_pages": "integer",
  "total_records": "integer"
}
```

### Statistics Object
```json
{
  "total_customers": "integer",
  "active_customers": "integer",
  "inactive_customers": "integer",
  "active_percentage": "number",
  "inactive_percentage": "number",
  "generated_at": "string (ISO 8601 datetime)"
}
```

---

## Implementation Notes

### Backward Compatibility
- All existing customer management endpoints remain unchanged
- Original response formats are preserved
- No breaking changes to existing API contracts
- New reporting endpoints use `/api/reports/` prefix to avoid conflicts

### Database Requirements
The reporting APIs require the following database schema considerations:

```sql
-- Ensure customers table has proper indexing for reporting queries
CREATE INDEX idx_customers_active ON customers(active);
CREATE INDEX idx_customers_created_at ON customers(created_at);
CREATE INDEX idx_customers_active_created ON customers(active, created_at);
```

### Performance Considerations
- Reporting endpoints may implement caching for frequently accessed data
- Large result sets should use pagination
- Date range queries are optimized with proper indexing

### Security
- All reporting endpoints require authentication
- Sensitive customer data should be handled according to privacy regulations
- Rate limiting should be implemented for reporting endpoints

---

## Testing Examples

### Complete Workflow Test
```bash
# 1. Create a customer
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User", "active": true}'

# 2. Get all customers
curl -X GET http://localhost:3000/customers

# 3. Get customer statistics
curl -X GET http://localhost:3000/api/reports/customer-stats

# 4. Get active customers
curl -X GET http://localhost:3000/api/reports/customers/status/active

# 5. Get paginated summary
curl -X GET "http://localhost:3000/api/reports/customer-summary?page=1&limit=5"
```

---

## Change Log

### Version 1.1.0 (Proposed)
- Added comprehensive reporting APIs
- Maintained full backward compatibility with existing customer APIs
- Added proper error handling and response schemas
- Implemented pagination for large data sets
- Added date range filtering capabilities

### Version 1.0.0 (Current)
- Basic CRUD operations for customers
- MySQL database integration
- Express.js REST API structure
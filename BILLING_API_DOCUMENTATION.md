# Billing System API Documentation

## Overview

This document provides comprehensive documentation for the Billing System's public APIs. The current implementation focuses on customer management, which forms the foundation of any billing system.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, no authentication is required for these endpoints. In a production billing system, proper authentication and authorization should be implemented.

## Error Handling

All endpoints follow consistent error response patterns:

### Error Response Schema

```json
{
  "message": "string"
}
```

### HTTP Status Codes

- `200` - Success
- `400` - Bad Request (validation errors)
- `404` - Resource Not Found
- `500` - Internal Server Error

---

## Customer Management APIs

### 1. Create Customer

Creates a new customer in the billing system.

**Endpoint:** `POST /customers`

**Request Schema:**
```json
{
  "email": "string (required)",
  "name": "string (required)", 
  "active": "boolean (optional, defaults to true)"
}
```

**Response Schema:**
```json
{
  "id": "number",
  "email": "string",
  "name": "string",
  "active": "boolean"
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe",
    "active": true
  }'
```

**Example Response:**
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "active": true
}
```

**Error Responses:**
- `400 Bad Request` - When request body is empty
- `500 Internal Server Error` - Database or server errors

---

### 2. Get All Customers

Retrieves all customers from the billing system.

**Endpoint:** `GET /customers`

**Request Parameters:** None

**Response Schema:**
```json
[
  {
    "id": "number",
    "email": "string",
    "name": "string", 
    "active": "boolean"
  }
]
```

**Example Request:**
```bash
curl -X GET http://localhost:3000/customers
```

**Example Response:**
```json
[
  {
    "id": 1,
    "email": "john.doe@example.com",
    "name": "John Doe",
    "active": true
  },
  {
    "id": 2,
    "email": "jane.smith@example.com",
    "name": "Jane Smith",
    "active": false
  }
]
```

**Error Responses:**
- `500 Internal Server Error` - Database or server errors

---

### 3. Get Customer by ID

Retrieves a specific customer by their ID.

**Endpoint:** `GET /customers/:customerId`

**Path Parameters:**
- `customerId` (number, required) - The unique identifier of the customer

**Response Schema:**
```json
{
  "id": "number",
  "email": "string",
  "name": "string",
  "active": "boolean"
}
```

**Example Request:**
```bash
curl -X GET http://localhost:3000/customers/1
```

**Example Response:**
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "active": true
}
```

**Error Responses:**
- `404 Not Found` - Customer with specified ID does not exist
- `500 Internal Server Error` - Database or server errors

---

### 4. Update Customer

Updates an existing customer's information.

**Endpoint:** `PUT /customers/:customerId`

**Path Parameters:**
- `customerId` (number, required) - The unique identifier of the customer

**Request Schema:**
```json
{
  "email": "string (optional)",
  "name": "string (optional)",
  "active": "boolean (optional)"
}
```

**Response Schema:**
```json
{
  "id": "number",
  "email": "string",
  "name": "string",
  "active": "boolean"
}
```

**Example Request:**
```bash
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.updated@example.com",
    "name": "John Updated",
    "active": false
  }'
```

**Example Response:**
```json
{
  "id": 1,
  "email": "john.updated@example.com",
  "name": "John Updated",
  "active": false
}
```

**Error Responses:**
- `400 Bad Request` - When request body is empty
- `404 Not Found` - Customer with specified ID does not exist
- `500 Internal Server Error` - Database or server errors

---

### 5. Delete Customer

Deletes a specific customer from the system.

**Endpoint:** `DELETE /customers/:customerId`

**Path Parameters:**
- `customerId` (number, required) - The unique identifier of the customer

**Response Schema:**
```json
{
  "message": "string"
}
```

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/customers/1
```

**Example Response:**
```json
{
  "message": "Customer was deleted successfully!"
}
```

**Error Responses:**
- `404 Not Found` - Customer with specified ID does not exist
- `500 Internal Server Error` - Database or server errors

---

### 6. Delete All Customers

Deletes all customers from the system. **Use with extreme caution in production.**

**Endpoint:** `DELETE /customers`

**Request Parameters:** None

**Response Schema:**
```json
{
  "message": "string"
}
```

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/customers
```

**Example Response:**
```json
{
  "message": "All Customers were deleted successfully!"
}
```

**Error Responses:**
- `500 Internal Server Error` - Database or server errors

---

## Data Models

### Customer Model

```json
{
  "id": {
    "type": "number",
    "description": "Unique identifier for the customer (auto-generated)"
  },
  "email": {
    "type": "string",
    "description": "Customer's email address",
    "required": true
  },
  "name": {
    "type": "string", 
    "description": "Customer's full name",
    "required": true
  },
  "active": {
    "type": "boolean",
    "description": "Whether the customer account is active",
    "default": true
  }
}
```

---

## Database Schema

The customer data is stored in a MySQL table with the following structure:

```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT TRUE
);
```

---

## Backward Compatibility

This API documentation maintains full backward compatibility with existing implementations:

1. **Endpoint URLs** - All existing endpoint paths remain unchanged
2. **Request/Response Formats** - All existing request and response schemas are preserved
3. **HTTP Methods** - All HTTP methods for each endpoint remain the same
4. **Status Codes** - All HTTP status codes and their meanings are maintained
5. **Error Messages** - Existing error message formats are preserved

---

## Future Enhancements

For a complete billing system, consider adding these additional APIs:

1. **Billing APIs**
   - Invoice management (`/invoices`)
   - Payment processing (`/payments`)
   - Subscription management (`/subscriptions`)
   - Billing plans (`/plans`)

2. **Security Enhancements**
   - Authentication endpoints (`/auth`)
   - API key management
   - Rate limiting

3. **Reporting APIs**
   - Revenue reports (`/reports/revenue`)
   - Customer analytics (`/reports/customers`)
   - Payment analytics (`/reports/payments`)

---

## Testing Examples

### Complete Customer Lifecycle Test

```bash
# 1. Create a customer
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User", "active": true}'

# Response: {"id": 1, "email": "test@example.com", "name": "Test User", "active": true}

# 2. Get the customer
curl -X GET http://localhost:3000/customers/1

# 3. Update the customer  
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{"email": "updated@example.com", "name": "Updated User", "active": false}'

# 4. Get all customers
curl -X GET http://localhost:3000/customers

# 5. Delete the customer
curl -X DELETE http://localhost:3000/customers/1
```

---

## Support

For questions or issues regarding these APIs, please refer to the source code in the repository or contact the development team.

**Repository:** https://github.com/veeraRaghavSanthosh/node-mysql-express  
**Branch:** master
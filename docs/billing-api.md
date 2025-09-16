# Billing System API Documentation

## Overview

This document describes the public APIs for the billing system's customer management functionality. The customer APIs form the foundation of the billing system, managing customer data that is essential for billing operations.

## Base URL

```
http://localhost:3000
```

## Authentication

Currently, no authentication is required for these endpoints.

## API Endpoints

### 1. Create Customer

Creates a new customer in the billing system.

**Endpoint:** `POST /customers`

**Request Body:**
```json
{
  "email": "string (required)",
  "name": "string (required)", 
  "active": "boolean (optional, default: true)"
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

**Response Schema:**
```json
{
  "id": "number",
  "email": "string",
  "name": "string", 
  "active": "boolean"
}
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

**Status Codes:**
- `200 OK` - Customer created successfully
- `400 Bad Request` - Invalid request body
- `500 Internal Server Error` - Database error

---

### 2. Get All Customers

Retrieves all customers from the billing system.

**Endpoint:** `GET /customers`

**Example Request:**
```bash
curl -X GET http://localhost:3000/customers
```

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

**Status Codes:**
- `200 OK` - Customers retrieved successfully
- `500 Internal Server Error` - Database error

---

### 3. Get Customer by ID

Retrieves a specific customer by their ID.

**Endpoint:** `GET /customers/:customerId`

**Path Parameters:**
- `customerId` (number, required) - The unique identifier of the customer

**Example Request:**
```bash
curl -X GET http://localhost:3000/customers/1
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

**Example Response:**
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "active": true
}
```

**Status Codes:**
- `200 OK` - Customer found and returned
- `404 Not Found` - Customer with specified ID not found
- `500 Internal Server Error` - Database error

**Error Response Example:**
```json
{
  "message": "Not found Customer with id 999."
}
```

---

### 4. Update Customer

Updates an existing customer's information.

**Endpoint:** `PUT /customers/:customerId`

**Path Parameters:**
- `customerId` (number, required) - The unique identifier of the customer

**Request Body:**
```json
{
  "email": "string (optional)",
  "name": "string (optional)",
  "active": "boolean (optional)"
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

**Response Schema:**
```json
{
  "id": "number",
  "email": "string",
  "name": "string",
  "active": "boolean"
}
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

**Status Codes:**
- `200 OK` - Customer updated successfully
- `400 Bad Request` - Invalid request body
- `404 Not Found` - Customer with specified ID not found
- `500 Internal Server Error` - Database error

---

### 5. Delete Customer

Deletes a specific customer from the billing system.

**Endpoint:** `DELETE /customers/:customerId`

**Path Parameters:**
- `customerId` (number, required) - The unique identifier of the customer

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/customers/1
```

**Response Schema:**
```json
{
  "message": "string"
}
```

**Example Response:**
```json
{
  "message": "Customer was deleted successfully!"
}
```

**Status Codes:**
- `200 OK` - Customer deleted successfully
- `404 Not Found` - Customer with specified ID not found
- `500 Internal Server Error` - Database error

---

### 6. Delete All Customers

Deletes all customers from the billing system.

**Endpoint:** `DELETE /customers`

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/customers
```

**Response Schema:**
```json
{
  "message": "string"
}
```

**Example Response:**
```json
{
  "message": "All Customers were deleted successfully!"
}
```

**Status Codes:**
- `200 OK` - All customers deleted successfully
- `500 Internal Server Error` - Database error

## Error Handling

All endpoints follow consistent error response patterns:

**Error Response Schema:**
```json
{
  "message": "string"
}
```

**Common Error Messages:**
- `"Content can not be empty!"` - Request body is missing or empty
- `"Not found Customer with id {id}."` - Customer not found
- `"Some error occurred while creating the Customer."` - Database error during creation
- `"Some error occurred while retrieving customers."` - Database error during retrieval
- `"Error retrieving Customer with id {id}"` - Database error during single customer retrieval
- `"Error updating Customer with id {id}"` - Database error during update
- `"Could not delete Customer with id {id}"` - Database error during deletion
- `"Some error occurred while removing all customers."` - Database error during bulk deletion

## Data Model

### Customer Schema

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

## Rate Limiting

Currently, no rate limiting is implemented on these endpoints.

## Versioning

This API is currently unversioned. Future versions will be indicated in the URL path.

## Support

For API support and questions, please contact the development team.
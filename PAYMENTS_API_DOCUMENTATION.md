# Payment APIs Documentation

This document provides comprehensive documentation for the Payment APIs in the Node.js/Express/MySQL application.

## Overview

The Payment API provides endpoints to manage payment transactions, including creating payments, updating payment status, and retrieving payment information.

## Base URL

```
http://localhost:3000
```

## Data Models

### Payment Object

```json
{
  "id": "integer",
  "customer_id": "integer (required)",
  "amount": "decimal (required)", 
  "currency": "string (required)",
  "payment_method": "string",
  "status": "string",
  "transaction_id": "string",
  "description": "string",
  "metadata": "JSON string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

## API Endpoints

### 1. Create Payment

**Endpoint:** `POST /payments`

**Request:**
```json
{
  "customer_id": 1,
  "amount": 99.99,
  "currency": "USD",
  "payment_method": "card",
  "description": "Product purchase"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "customer_id": 1,
  "amount": 99.99,
  "currency": "USD",
  "payment_method": "card",
  "status": "pending",
  "created_at": "2025-01-15T10:30:00.000Z"
}
```

### 2. Get All Payments

**Endpoint:** `GET /payments`

**Query Parameters:**
- `customer_id` - Filter by customer ID
- `status` - Filter by payment status  
- `payment_method` - Filter by payment method
- `limit` - Limit number of results

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "customer_id": 1,
    "amount": 99.99,
    "currency": "USD", 
    "status": "completed",
    "created_at": "2025-01-15T10:30:00.000Z"
  }
]
```

### 3. Get Payment by ID

**Endpoint:** `GET /payments/{paymentId}`

**Response:** `200 OK`
```json
{
  "id": 1,
  "customer_id": 1,
  "amount": 99.99,
  "currency": "USD",
  "status": "completed"
}
```

### 4. Get Customer Payments

**Endpoint:** `GET /customers/{customerId}/payments`

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "customer_id": 1,
    "amount": 99.99,
    "status": "completed"
  }
]
```

### 5. Update Payment Status

**Endpoint:** `PATCH /payments/{paymentId}/status`

**Request:**
```json
{
  "status": "completed"
}
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "status": "completed"
}
```

## Error Handling

### Error Response Format
```json
{
  "message": "Error description"
}
```

### Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found  
- `500` - Server Error

## Examples

### Create and Process Payment
```bash
# Create payment
curl -X POST http://localhost:3000/payments \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "amount": 99.99,
    "currency": "USD",
    "payment_method": "card"
  }'

# Update status
curl -X PATCH http://localhost:3000/payments/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

## Database Schema

```sql
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  payment_method VARCHAR(50) DEFAULT 'card',
  status VARCHAR(50) DEFAULT 'pending',
  transaction_id VARCHAR(255),
  description TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```
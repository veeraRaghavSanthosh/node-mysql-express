# Payment API Documentation

This documentation covers all the payment-related API endpoints available in the Node.js Express MySQL application.

## Table of Contents
1. [Overview](#overview)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Error Handling](#error-handling)
5. [Data Models](#data-models)
6. [Examples](#examples)

## Overview

The Payment API provides a comprehensive set of endpoints to handle payment processing, status tracking, refunds, and payment history management. All endpoints follow RESTful conventions and return JSON responses.

**Base URL:** `http://localhost:3000/api`

## Authentication

All payment endpoints use the authentication middleware defined in `server.js`. Currently, the middleware is a pass-through, but in production, it should validate API keys or JWT tokens.

## API Endpoints

### 1. Create Payment

Process a new payment for a customer.

**Endpoint:** `POST /api/payments`

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "customer_id": 1,
  "amount": 99.99,
  "currency": "USD",
  "payment_method": "credit_card",
  "description": "Premium subscription payment"
}
```

**Request Body Schema:**
- `customer_id` (integer, required): ID of the customer making the payment
- `amount` (decimal, required): Payment amount (must be > 0)
- `currency` (string, required): 3-letter currency code (e.g., USD, EUR, GBP)
- `payment_method` (string, required): Payment method used (credit_card, paypal, bank_transfer, apple_pay, google_pay)
- `description` (string, optional): Description of the payment

**Success Response (201 Created):**
```json
{
  "id": 1,
  "customer_id": 1,
  "amount": 99.99,
  "currency": "USD",
  "payment_method": "credit_card",
  "description": "Premium subscription payment",
  "status": "processing",
  "created_at": "2025-09-16T10:30:00.000Z",
  "updated_at": "2025-09-16T10:30:00.000Z",
  "message": "Payment is being processed"
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid amount
- `500 Internal Server Error`: Database or processing error

---

### 2. Get All Payments

Retrieve all payments in the system (admin function).

**Endpoint:** `GET /api/payments`

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "customer_id": 1,
    "amount": 99.99,
    "currency": "USD",
    "payment_method": "credit_card",
    "description": "Premium subscription payment",
    "status": "completed",
    "refund_amount": null,
    "created_at": "2025-09-16T10:30:00.000Z",
    "updated_at": "2025-09-16T10:30:01.000Z"
  },
  {
    "id": 2,
    "customer_id": 2,
    "amount": 149.50,
    "currency": "EUR",
    "payment_method": "bank_transfer",
    "description": "Product purchase",
    "status": "processing",
    "refund_amount": null,
    "created_at": "2025-09-16T09:15:00.000Z",
    "updated_at": "2025-09-16T09:15:00.000Z"
  }
]
```

**Error Response:**
- `500 Internal Server Error`: Database error

---

### 3. Get Payment by ID

Retrieve a specific payment by its ID.

**Endpoint:** `GET /api/payments/:paymentId`

**URL Parameters:**
- `paymentId` (integer): The ID of the payment to retrieve

**Success Response (200 OK):**
```json
{
  "id": 1,
  "customer_id": 1,
  "amount": 99.99,
  "currency": "USD",
  "payment_method": "credit_card",
  "description": "Premium subscription payment",
  "status": "completed",
  "refund_amount": null,
  "created_at": "2025-09-16T10:30:00.000Z",
  "updated_at": "2025-09-16T10:30:01.000Z"
}
```

**Error Responses:**
- `404 Not Found`: Payment with specified ID does not exist
- `500 Internal Server Error`: Database error

---

### 4. Get Customer Payments

Retrieve all payments for a specific customer.

**Endpoint:** `GET /api/customers/:customerId/payments`

**URL Parameters:**
- `customerId` (integer): The ID of the customer

**Success Response (200 OK):**
```json
[
  {
    "id": 1,
    "customer_id": 1,
    "amount": 99.99,
    "currency": "USD",
    "payment_method": "credit_card",
    "description": "Premium subscription payment",
    "status": "completed",
    "refund_amount": null,
    "created_at": "2025-09-16T10:30:00.000Z",
    "updated_at": "2025-09-16T10:30:01.000Z"
  },
  {
    "id": 5,
    "customer_id": 1,
    "amount": 29.99,
    "currency": "USD",
    "payment_method": "paypal",
    "description": "Monthly service fee",
    "status": "completed",
    "refund_amount": null,
    "created_at": "2025-09-15T14:20:00.000Z",
    "updated_at": "2025-09-15T14:20:05.000Z"
  }
]
```

**Error Response:**
- `500 Internal Server Error`: Database error

---

### 5. Update Payment Status

Update the status of an existing payment.

**Endpoint:** `PUT /api/payments/:paymentId/status`

**URL Parameters:**
- `paymentId` (integer): The ID of the payment to update

**Request Body:**
```json
{
  "status": "completed"
}
```

**Request Body Schema:**
- `status` (string, required): New payment status. Valid values: `pending`, `processing`, `completed`, `failed`, `cancelled`, `refunded`

**Success Response (200 OK):**
```json
{
  "message": "Payment status updated successfully!",
  "id": 1,
  "status": "completed"
}
```

**Error Responses:**
- `400 Bad Request`: Missing status or invalid status value
- `404 Not Found`: Payment with specified ID does not exist
- `500 Internal Server Error`: Database error

---

### 6. Process Refund

Process a refund for a completed payment.

**Endpoint:** `POST /api/payments/:paymentId/refund`

**URL Parameters:**
- `paymentId` (integer): The ID of the payment to refund

**Request Body:**
```json
{
  "refund_amount": 99.99
}
```

**Request Body Schema:**
- `refund_amount` (decimal, required): Amount to refund (must be > 0 and ≤ original payment amount)

**Success Response (200 OK):**
```json
{
  "message": "Refund processed successfully!",
  "id": 1,
  "refund_amount": 99.99,
  "status": "refunded"
}
```

**Error Responses:**
- `400 Bad Request`: Missing refund amount, invalid amount, or payment cannot be refunded
- `404 Not Found`: Payment with specified ID does not exist
- `500 Internal Server Error`: Database or processing error

---

### 7. Delete Payment

Delete a payment record (admin function - should be restricted in production).

**Endpoint:** `DELETE /api/payments/:paymentId`

**URL Parameters:**
- `paymentId` (integer): The ID of the payment to delete

**Success Response (200 OK):**
```json
{
  "message": "Payment was deleted successfully!"
}
```

**Error Responses:**
- `404 Not Found`: Payment with specified ID does not exist
- `500 Internal Server Error`: Database error

---

## Error Handling

All API endpoints return consistent error responses with appropriate HTTP status codes:

### Error Response Format
```json
{
  "message": "Error description"
}
```

### Common HTTP Status Codes
- `200 OK`: Request successful
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request data
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Data Models

### Payment Model
```json
{
  "id": "integer (auto-generated)",
  "customer_id": "integer (required)",
  "amount": "decimal(10,2) (required)",
  "currency": "string(3) (required, default: 'USD')",
  "payment_method": "string(50) (required)",
  "description": "text (optional)",
  "status": "enum (pending|processing|completed|failed|cancelled|refunded)",
  "refund_amount": "decimal(10,2) (optional)",
  "created_at": "timestamp (auto-generated)",
  "updated_at": "timestamp (auto-updated)"
}
```

### Payment Status Values
- `pending`: Payment has been created but not yet processed
- `processing`: Payment is currently being processed
- `completed`: Payment has been successfully processed
- `failed`: Payment processing failed
- `cancelled`: Payment was cancelled before processing
- `refunded`: Payment has been refunded (partially or fully)

### Supported Payment Methods
- `credit_card`: Credit or debit card payment
- `paypal`: PayPal payment
- `bank_transfer`: Direct bank transfer
- `apple_pay`: Apple Pay
- `google_pay`: Google Pay

### Supported Currencies
- `USD`: US Dollar
- `EUR`: Euro
- `GBP`: British Pound
- `CAD`: Canadian Dollar
- (Additional currencies can be added as needed)

---

## Examples

### Example 1: Complete Payment Flow

1. **Create a new payment:**
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "amount": 99.99,
    "currency": "USD",
    "payment_method": "credit_card",
    "description": "Premium subscription payment"
  }'
```

2. **Check payment status:**
```bash
curl -X GET http://localhost:3000/api/payments/1
```

3. **Update payment status to completed:**
```bash
curl -X PUT http://localhost:3000/api/payments/1/status \
  -H "Content-Type: application/json" \
  -d '{"status": "completed"}'
```

### Example 2: Process a Refund

1. **Process a full refund:**
```bash
curl -X POST http://localhost:3000/api/payments/1/refund \
  -H "Content-Type: application/json" \
  -d '{"refund_amount": 99.99}'
```

2. **Process a partial refund:**
```bash
curl -X POST http://localhost:3000/api/payments/1/refund \
  -H "Content-Type: application/json" \
  -d '{"refund_amount": 50.00}'
```

### Example 3: Get Customer Payment History

```bash
curl -X GET http://localhost:3000/api/customers/1/payments
```

---

## Database Setup

To set up the payments table, run the SQL script provided in `/database/payments.sql`:

```sql
-- Run this in your MySQL database
source /path/to/your/project/database/payments.sql;
```

This will create the `payments` table with the proper schema and insert some sample data for testing.

---

## Testing the API

You can test the API using tools like:
- **Postman**: Import the endpoints and test with a GUI
- **curl**: Use the command-line examples provided above
- **Insomnia**: REST API client for testing
- **Thunder Client**: VS Code extension for API testing

Make sure your MySQL database is running and the `payments` table is created before testing the endpoints.
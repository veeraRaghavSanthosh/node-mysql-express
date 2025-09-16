# API Documentation

## Orders API

### POST /v1/orders

Creates a new order with optional order items.

#### Request

**URL:** `POST /v1/orders`

**Headers:**
```
Content-Type: application/json
```

**Body Parameters:**

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| customer_id | integer | Yes | ID of the customer placing the order | Must be positive integer |
| total_amount | number | Yes | Total amount of the order | Must be positive number with max 2 decimal places |
| status | string | No | Order status (default: 'pending') | One of: pending, processing, shipped, delivered, cancelled |
| order_date | string | No | ISO date string (default: current timestamp) | Valid ISO date format |
| items | array | No | Array of order items | Optional array of item objects |

**Item Object Structure:**

| Parameter | Type | Required | Description | Validation |
|-----------|------|----------|-------------|------------|
| product_name | string | Yes | Name of the product | 1-255 characters |
| quantity | integer | Yes | Quantity ordered | Positive integer |
| price | number | Yes | Price per unit | Positive number with max 2 decimal places |

#### Example Requests

**Minimal Request:**
```json
{
  "customer_id": 1,
  "total_amount": 99.99
}
```

**Complete Request with Items:**
```json
{
  "customer_id": 1,
  "total_amount": 149.98,
  "status": "pending",
  "order_date": "2024-01-15T10:30:00.000Z",
  "items": [
    {
      "product_name": "Laptop",
      "quantity": 1,
      "price": 999.99
    },
    {
      "product_name": "Wireless Mouse",
      "quantity": 2,
      "price": 25.00
    }
  ]
}
```

#### Responses

**Success (201 Created):**
```json
{
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "customer_id": 1,
    "total_amount": 149.98,
    "status": "pending",
    "order_date": "2024-01-15T10:30:00.000Z",
    "items": [
      {
        "product_name": "Laptop",
        "quantity": 1,
        "price": 999.99
      },
      {
        "product_name": "Wireless Mouse",
        "quantity": 2,
        "price": 25.00
      }
    ]
  }
}
```

**Validation Error (400 Bad Request):**
```json
{
  "message": "Validation failed",
  "errors": [
    "Customer ID is required",
    "Total amount must be positive"
  ]
}
```

**Invalid Customer (400 Bad Request):**
```json
{
  "message": "Invalid customer_id. Customer does not exist."
}
```

**Server Error (500 Internal Server Error):**
```json
{
  "message": "Some error occurred while creating the Order."
}
```

#### Status Codes

| Code | Description |
|------|-------------|
| 201 | Order created successfully |
| 400 | Bad request - validation failed or invalid customer |
| 500 | Internal server error |

#### Validation Rules

1. **customer_id**: Must be a positive integer and must reference an existing customer
2. **total_amount**: Must be a positive number with maximum 2 decimal places
3. **status**: Must be one of the allowed values (pending, processing, shipped, delivered, cancelled)
4. **order_date**: Must be a valid ISO date string
5. **items**: If provided, must be a non-empty array with valid item objects
6. **product_name**: Must be a non-empty string with maximum 255 characters
7. **quantity**: Must be a positive integer
8. **price**: Must be a positive number with maximum 2 decimal places

#### Database Tables

This endpoint interacts with the following database tables:

1. **orders** - Stores order information
2. **order_items** - Stores individual items for each order
3. **customers** - Referenced by customer_id (must exist)

#### Error Handling

The endpoint provides comprehensive error handling:

- **Validation Errors**: Detailed messages for each validation failure
- **Database Errors**: Proper handling of foreign key constraints and connection issues
- **Transaction Safety**: Uses database transactions to ensure data consistency

#### Testing

Run the test suite with:
```bash
npm test
```

Test files:
- `__tests__/order.controller.test.js` - Controller unit tests
- `__tests__/order.model.test.js` - Model unit tests  
- `__tests__/order.integration.test.js` - Integration tests
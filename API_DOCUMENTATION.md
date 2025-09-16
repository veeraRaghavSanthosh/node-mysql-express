# Orders API Documentation

## Overview
The Orders API provides endpoints for managing customer orders in the system.

## Base URL
```
http://localhost:3000
```

## Endpoints

### Create Order
**POST** `/v1/orders`

Creates a new order with the provided details.

#### Request Body
```json
{
  "customer_id": 1,
  "product_name": "iPhone 15 Pro",
  "quantity": 2,
  "unit_price": 999.99,
  "total_amount": 1999.98,
  "order_date": "2025-09-16T10:30:00Z",
  "status": "pending"
}
```

#### Required Fields
- `customer_id` (integer): Must be a positive integer
- `product_name` (string): Non-empty string, max 255 characters
- `quantity` (integer): Must be a positive integer
- `unit_price` (number): Must be a positive number

#### Optional Fields
- `total_amount` (number): If not provided, calculated as quantity × unit_price
- `order_date` (string): ISO date string, defaults to current timestamp
- `status` (string): One of `pending`, `processing`, `shipped`, `delivered`, `cancelled`. Defaults to `pending`

#### Response
**Success (201 Created)**
```json
{
  "id": 1,
  "customer_id": 1,
  "product_name": "iPhone 15 Pro",
  "quantity": 2,
  "unit_price": 999.99,
  "total_amount": 1999.98,
  "order_date": "2025-09-16T10:30:00.000Z",
  "status": "pending"
}
```

**Validation Error (400 Bad Request)**
```json
{
  "message": "Validation failed",
  "errors": [
    "customer_id is required",
    "product_name must be a non-empty string"
  ]
}
```

### Get All Orders
**GET** `/v1/orders`

Retrieves all orders from the database, ordered by creation date (newest first).

#### Response
```json
[
  {
    "id": 1,
    "customer_id": 1,
    "product_name": "iPhone 15 Pro",
    "quantity": 2,
    "unit_price": 999.99,
    "total_amount": 1999.98,
    "order_date": "2025-09-16T10:30:00.000Z",
    "status": "pending",
    "created_at": "2025-09-16T10:30:00.000Z",
    "updated_at": "2025-09-16T10:30:00.000Z"
  }
]
```

### Get Order by ID
**GET** `/v1/orders/:orderId`

Retrieves a specific order by its ID.

#### Parameters
- `orderId` (path parameter): The ID of the order to retrieve

#### Response
**Success (200 OK)**
```json
{
  "id": 1,
  "customer_id": 1,
  "product_name": "iPhone 15 Pro",
  "quantity": 2,
  "unit_price": 999.99,
  "total_amount": 1999.98,
  "order_date": "2025-09-16T10:30:00.000Z",
  "status": "pending",
  "created_at": "2025-09-16T10:30:00.000Z",
  "updated_at": "2025-09-16T10:30:00.000Z"
}
```

**Not Found (404)**
```json
{
  "message": "Not found Order with id 999."
}
```

### Update Order
**PUT** `/v1/orders/:orderId`

Updates an existing order with new information.

#### Parameters
- `orderId` (path parameter): The ID of the order to update

#### Request Body
Same as Create Order endpoint - all required fields must be provided.

### Delete Order
**DELETE** `/v1/orders/:orderId`

Deletes a specific order by its ID.

#### Parameters
- `orderId` (path parameter): The ID of the order to delete

#### Response
**Success (200 OK)**
```json
{
  "message": "Order was deleted successfully!"
}
```

### Delete All Orders
**DELETE** `/v1/orders`

⚠️ **Warning**: This endpoint deletes ALL orders from the database.

#### Response
```json
{
  "message": "All Orders were deleted successfully!"
}
```

## Error Handling

The API uses standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `500` - Internal Server Error

All error responses include a descriptive message and, for validation errors, an array of specific error details.

## Testing

Run the test suite with:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

Watch mode for development:
```bash
npm run test:watch
```
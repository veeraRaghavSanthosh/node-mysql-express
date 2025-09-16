# API Documentation

## Orders API

### POST /v1/orders

Creates a new order in the system.

#### Request Body

```json
{
  "customer_id": 123,
  "product_name": "Product Name",
  "quantity": 2,
  "unit_price": 29.99,
  "status": "pending",
  "order_date": "2023-12-01T10:00:00Z"
}
```

#### Required Fields

- `customer_id` (integer): ID of the customer placing the order (must be positive)
- `product_name` (string): Name of the product (1-255 characters, non-empty)
- `quantity` (integer): Number of items ordered (must be positive)
- `unit_price` (number): Price per unit (must be non-negative)

#### Optional Fields

- `status` (string): Order status. Valid values: `pending`, `confirmed`, `shipped`, `delivered`, `cancelled`. Defaults to `pending`
- `order_date` (string): ISO date string. Defaults to current timestamp

#### Response

**Success (201 Created):**
```json
{
  "id": 1,
  "customer_id": 123,
  "product_name": "Product Name",
  "quantity": 2,
  "unit_price": 29.99,
  "total_amount": 59.98,
  "status": "pending",
  "order_date": "2023-12-01T10:00:00.000Z"
}
```

**Validation Error (400 Bad Request):**
```json
{
  "message": "Validation failed",
  "errors": [
    "customer_id is required",
    "quantity must be a positive integer"
  ]
}
```

**Server Error (500 Internal Server Error):**
```json
{
  "message": "Some error occurred while creating the Order."
}
```

#### Examples

**Basic Order Creation:**
```bash
curl -X POST http://localhost:3000/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 123,
    "product_name": "Wireless Headphones",
    "quantity": 1,
    "unit_price": 79.99
  }'
```

**Order with Custom Status:**
```bash
curl -X POST http://localhost:3000/v1/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 456,
    "product_name": "Bluetooth Speaker",
    "quantity": 2,
    "unit_price": 45.00,
    "status": "confirmed"
  }'
```

### GET /v1/orders

Retrieves all orders from the system.

#### Response

**Success (200 OK):**
```json
[
  {
    "id": 1,
    "customer_id": 123,
    "product_name": "Wireless Headphones",
    "quantity": 1,
    "unit_price": 79.99,
    "total_amount": 79.99,
    "status": "pending",
    "order_date": "2023-12-01T10:00:00.000Z",
    "created_at": "2023-12-01T10:00:00.000Z",
    "updated_at": "2023-12-01T10:00:00.000Z"
  }
]
```

### GET /v1/orders/:orderId

Retrieves a specific order by ID.

#### Parameters

- `orderId` (path parameter): The ID of the order to retrieve

#### Response

**Success (200 OK):**
```json
{
  "id": 1,
  "customer_id": 123,
  "product_name": "Wireless Headphones",
  "quantity": 1,
  "unit_price": 79.99,
  "total_amount": 79.99,
  "status": "pending",
  "order_date": "2023-12-01T10:00:00.000Z",
  "created_at": "2023-12-01T10:00:00.000Z",
  "updated_at": "2023-12-01T10:00:00.000Z"
}
```

**Not Found (404 Not Found):**
```json
{
  "message": "Not found Order with id 999."
}
```

## Database Setup

Before using the Orders API, you need to create the orders table:

```sql
-- Run this SQL script to create the orders table
-- File: database/create_orders_table.sql

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'confirmed', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer_id (customer_id),
  INDEX idx_status (status),
  INDEX idx_order_date (order_date)
);
```

## Testing

Run the test suite:

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

The test suite includes:
- Unit tests for controller validation logic
- Unit tests for model database operations
- Integration test structure (requires database setup)
- Error handling and edge case coverage
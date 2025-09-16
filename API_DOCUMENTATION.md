# API Documentation

## Orders API

### Create Order
**POST** `/v1/orders`

Creates a new order with validation and automatic total calculation.

#### Request Body
```json
{
  "customer_id": 1,
  "product_name": "Laptop Computer",
  "quantity": 2,
  "unit_price": 999.99,
  "status": "pending"
}
```

#### Required Fields
- `customer_id` (integer): Must be a positive integer
- `product_name` (string): Must be a non-empty string
- `quantity` (integer): Must be a positive integer  
- `unit_price` (number): Must be a positive number

#### Optional Fields
- `status` (string): One of `pending`, `processing`, `shipped`, `delivered`, `cancelled` (defaults to `pending`)

#### Response
**Success (201 Created)**
```json
{
  "id": 1,
  "customer_id": 1,
  "product_name": "Laptop Computer",
  "quantity": 2,
  "unit_price": 999.99,
  "total_amount": 1999.98,
  "order_date": "2023-12-07T10:30:00.000Z",
  "status": "pending"
}
```

**Validation Error (400 Bad Request)**
```json
{
  "message": "Validation failed",
  "errors": [
    "customer_id is required",
    "quantity must be a positive integer"
  ]
}
```

#### Features
- ✅ Comprehensive payload validation
- ✅ Automatic total amount calculation (`quantity * unit_price`)
- ✅ Input sanitization (trims whitespace from product names)
- ✅ Proper HTTP status codes
- ✅ Detailed error messages
- ✅ Database persistence with error handling

### Get All Orders
**GET** `/v1/orders`

Retrieves all orders from the database.

#### Response
```json
[
  {
    "id": 1,
    "customer_id": 1,
    "product_name": "Laptop Computer",
    "quantity": 2,
    "unit_price": 999.99,
    "total_amount": 1999.98,
    "order_date": "2023-12-07T10:30:00.000Z",
    "status": "pending"
  }
]
```

### Get Order by ID
**GET** `/v1/orders/:orderId`

Retrieves a specific order by its ID.

#### Response
**Success (200 OK)**
```json
{
  "id": 1,
  "customer_id": 1,
  "product_name": "Laptop Computer",
  "quantity": 2,
  "unit_price": 999.99,
  "total_amount": 1999.98,
  "order_date": "2023-12-07T10:30:00.000Z",
  "status": "pending"
}
```

**Not Found (404 Not Found)**
```json
{
  "message": "Not found Order with id 999."
}
```

### Update Order
**PUT** `/v1/orders/:orderId`

Updates an existing order with the same validation rules as creation.

### Delete Order
**DELETE** `/v1/orders/:orderId`

Deletes a specific order by its ID.

### Delete All Orders
**DELETE** `/v1/orders`

Deletes all orders from the database.

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
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
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

The test suite includes:
- Unit tests for the Order model
- Unit tests for the Order controller
- Integration tests for the API endpoints
- 100% code coverage
- Comprehensive validation testing
- Error handling verification
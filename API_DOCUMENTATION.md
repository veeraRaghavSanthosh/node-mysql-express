# User Service API Documentation

This documentation covers the public APIs for the Node.js Express MySQL user service. The service provides CRUD operations for customer management and basic user endpoints.

## Base URL
```
http://localhost:3000
```

## Authentication
The service includes basic authentication middleware for API routes (currently a placeholder that passes through all requests).

---

## API Endpoints

### 1. Get Users (Simple Endpoint)

**GET** `/user`

Returns a hardcoded list of users for testing purposes.

#### Response Schema
```json
{
  "user": [
    {
      "id": number,
      "name": string
    }
  ]
}
```

#### Example Response
```json
{
  "user": [
    {
      "id": 1,
      "name": "test3"
    },
    {
      "id": 2,
      "name": "test4"
    }
  ]
}
```

#### Status Codes
- `200 OK` - Successfully retrieved users

---

## Customer Management APIs

### 2. Create Customer

**POST** `/customers`

Creates a new customer in the database.

#### Request Schema
```json
{
  "email": string (required),
  "name": string (required),
  "active": boolean (optional, defaults to true)
}
```

#### Example Request
```json
{
  "email": "john.doe@example.com",
  "name": "John Doe",
  "active": true
}
```

#### Response Schema
```json
{
  "id": number,
  "email": string,
  "name": string,
  "active": boolean
}
```

#### Example Response
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "active": true
}
```

#### Status Codes
- `200 OK` - Customer created successfully
- `400 Bad Request` - Request body is empty or invalid
- `500 Internal Server Error` - Database error occurred

#### Error Response Example
```json
{
  "message": "Content can not be empty!"
}
```

---

### 3. Get All Customers

**GET** `/customers`

Retrieves all customers from the database.

#### Response Schema
```json
[
  {
    "id": number,
    "email": string,
    "name": string,
    "active": boolean
  }
]
```

#### Example Response
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

#### Status Codes
- `200 OK` - Successfully retrieved customers
- `500 Internal Server Error` - Database error occurred

#### Error Response Example
```json
{
  "message": "Some error occurred while retrieving customers."
}
```

---

### 4. Get Customer by ID

**GET** `/customers/:customerId`

Retrieves a specific customer by their ID.

#### Path Parameters
- `customerId` (number, required) - The unique identifier of the customer

#### Response Schema
```json
{
  "id": number,
  "email": string,
  "name": string,
  "active": boolean
}
```

#### Example Response
```json
{
  "id": 1,
  "email": "john.doe@example.com",
  "name": "John Doe",
  "active": true
}
```

#### Status Codes
- `200 OK` - Customer found and returned
- `404 Not Found` - Customer with specified ID not found
- `500 Internal Server Error` - Database error occurred

#### Error Response Examples
```json
{
  "message": "Not found Customer with id 1."
}
```

```json
{
  "message": "Error retrieving Customer with id 1"
}
```

---

### 5. Update Customer

**PUT** `/customers/:customerId`

Updates an existing customer's information.

#### Path Parameters
- `customerId` (number, required) - The unique identifier of the customer

#### Request Schema
```json
{
  "email": string (optional),
  "name": string (optional),
  "active": boolean (optional)
}
```

#### Example Request
```json
{
  "email": "john.updated@example.com",
  "name": "John Updated",
  "active": false
}
```

#### Response Schema
```json
{
  "id": number,
  "email": string,
  "name": string,
  "active": boolean
}
```

#### Example Response
```json
{
  "id": 1,
  "email": "john.updated@example.com",
  "name": "John Updated",
  "active": false
}
```

#### Status Codes
- `200 OK` - Customer updated successfully
- `400 Bad Request` - Request body is empty
- `404 Not Found` - Customer with specified ID not found
- `500 Internal Server Error` - Database error occurred

#### Error Response Examples
```json
{
  "message": "Content can not be empty!"
}
```

```json
{
  "message": "Not found Customer with id 1."
}
```

---

### 6. Delete Customer

**DELETE** `/customers/:customerId`

Deletes a specific customer by their ID.

#### Path Parameters
- `customerId` (number, required) - The unique identifier of the customer

#### Response Schema
```json
{
  "message": string
}
```

#### Example Response
```json
{
  "message": "Customer was deleted successfully!"
}
```

#### Status Codes
- `200 OK` - Customer deleted successfully
- `404 Not Found` - Customer with specified ID not found
- `500 Internal Server Error` - Database error occurred

#### Error Response Examples
```json
{
  "message": "Not found Customer with id 1."
}
```

```json
{
  "message": "Could not delete Customer with id 1"
}
```

---

### 7. Delete All Customers

**DELETE** `/customers`

Deletes all customers from the database.

#### Response Schema
```json
{
  "message": string
}
```

#### Example Response
```json
{
  "message": "All Customers were deleted successfully!"
}
```

#### Status Codes
- `200 OK` - All customers deleted successfully
- `500 Internal Server Error` - Database error occurred

#### Error Response Example
```json
{
  "message": "Some error occurred while removing all customers."
}
```

---

## Database Schema

### Customer Table
```sql
CREATE TABLE customers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT TRUE
);
```

---

## Common HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 OK | Request successful |
| 400 Bad Request | Invalid request data |
| 404 Not Found | Resource not found |
| 500 Internal Server Error | Server error |

---

## Example Usage with cURL

### Create a new customer
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "active": true
  }'
```

### Get all customers
```bash
curl -X GET http://localhost:3000/customers
```

### Get a specific customer
```bash
curl -X GET http://localhost:3000/customers/1
```

### Update a customer
```bash
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "updated@example.com",
    "name": "Updated User",
    "active": false
  }'
```

### Delete a customer
```bash
curl -X DELETE http://localhost:3000/customers/1
```

### Get users (simple endpoint)
```bash
curl -X GET http://localhost:3000/user
```

---

## Notes

1. The service uses MySQL as the database backend
2. All customer data is validated before database operations
3. The `/user` endpoint returns hardcoded data and is likely for testing purposes
4. Authentication middleware is present but currently passes through all requests
5. Database connection is configured via environment variables in `app/config/db.config.js`

---

## Error Handling

The API follows consistent error handling patterns:
- Validation errors return 400 status codes
- Not found errors return 404 status codes  
- Database errors return 500 status codes
- All errors include descriptive messages in the response body

# Node.js Express MySQL REST API

A RESTful CRUD API built with Node.js, Express.js, and MySQL for managing customer data.

## Features

- Full CRUD operations (Create, Read, Update, Delete) for customers
- RESTful API endpoints
- MySQL database integration
- Express.js middleware support
- Body parsing for JSON and URL-encoded data
- Error handling and validation

## Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 12 or higher)
- [MySQL](https://www.mysql.com/) database server
- npm (comes with Node.js)

## Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/veeraRaghavSanthosh/node-mysql-express.git
   cd node-mysql-express
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Database Setup:**
   
   Create a MySQL database and a customers table with the following structure:
   ```sql
   CREATE DATABASE your_database_name;
   USE your_database_name;
   
   CREATE TABLE customers (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) NOT NULL,
     name VARCHAR(255) NOT NULL,
     active BOOLEAN DEFAULT TRUE
   );
   ```

4. **Configure Database Connection:**
   
   Update the database configuration in `app/config/db.config.js`:
   ```javascript
   module.exports = {
     HOST: "localhost",           // Your MySQL host
     USER: "your_username",       // Your MySQL username
     PASSWORD: "your_password",   // Your MySQL password
     DB: "your_database_name"     // Your database name
   };
   ```

## Running the Application

1. **Start the server:**
   ```bash
   node server.js
   ```
   
   Or if you have nodemon installed globally:
   ```bash
   nodemon server.js
   ```

2. **Server will start on port 3000 (default) or the port specified in the PORT environment variable:**
   ```
   Server is running on port 3000.
   ```

3. **To run on a different port:**
   ```bash
   PORT=8080 node server.js
   ```

## API Endpoints

The API provides the following endpoints for customer management:

### Base URL
```
http://localhost:3000
```

### Customer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | Get all customers |
| GET | `/customers/:id` | Get customer by ID |
| POST | `/customers` | Create a new customer |
| PUT | `/customers/:id` | Update customer by ID |
| DELETE | `/customers/:id` | Delete customer by ID |
| DELETE | `/customers` | Delete all customers |

### Additional Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user` | Get sample user data (middleware example) |

### Request/Response Examples

#### Create a Customer (POST /customers)
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "active": true
  }'
```

#### Get All Customers (GET /customers)
```bash
curl -X GET http://localhost:3000/customers
```

#### Get Customer by ID (GET /customers/:id)
```bash
curl -X GET http://localhost:3000/customers/1
```

#### Update Customer (PUT /customers/:id)
```bash
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "active": false
  }'
```

#### Delete Customer (DELETE /customers/:id)
```bash
curl -X DELETE http://localhost:3000/customers/1
```

## Testing

Currently, the project doesn't include automated tests, but you can test the API endpoints manually using:

### Option 1: Using cURL (as shown in examples above)

### Option 2: Using Postman
1. Import the API endpoints into Postman
2. Set the base URL to `http://localhost:3000`
3. Test each endpoint with appropriate request bodies

### Option 3: Using a REST client extension in your code editor

### Manual Testing Steps:
1. Start the server: `node server.js`
2. Test the `/user` endpoint: `curl http://localhost:3000/user`
3. Create a customer using POST `/customers`
4. Retrieve customers using GET `/customers`
5. Update a customer using PUT `/customers/:id`
6. Delete a customer using DELETE `/customers/:id`

## Project Structure

```
├── app/
│   ├── config/
│   │   └── db.config.js          # Database configuration
│   ├── controllers/
│   │   └── customer.controller.js # Customer business logic
│   ├── models/
│   │   ├── customer.model.js      # Customer data model
│   │   └── db.js                  # Database connection
│   └── routes/
│       └── customer.routes.js     # API route definitions
├── middleware.js                  # Custom middleware (currently unused)
├── package.json                   # Project dependencies and scripts
├── server.js                      # Main application entry point
└── README.md                      # This file
```

## Dependencies

- **express**: Web framework for Node.js
- **mysql**: MySQL client for Node.js
- **body-parser**: Middleware for parsing request bodies

## Environment Variables

- `PORT`: Server port (default: 3000)

## Error Handling

The API includes comprehensive error handling for:
- Database connection errors
- Invalid request data
- Resource not found (404)
- Server errors (500)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Author

veera

## Notes

- The current database configuration in `app/config/db.config.js` contains placeholder/example credentials. Make sure to update these with your actual database credentials.
- For production deployment, consider using environment variables for sensitive configuration data.
- The project includes a basic middleware example in `server.js` for the `/user` endpoint.
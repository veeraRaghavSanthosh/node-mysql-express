# Node.js Express MySQL REST API

A RESTful CRUD API built with Node.js, Express.js, and MySQL for managing customer data.

## Features

- RESTful API endpoints for customer management
- CRUD operations (Create, Read, Update, Delete)
- MySQL database integration
- Express.js middleware support
- Body parsing for JSON and URL-encoded data
- Authentication middleware (basic setup)

## Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 12 or higher)
- [MySQL](https://www.mysql.com/) (version 5.7 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/veeraRaghavSanthosh/node-mysql-express.git
   cd node-mysql-express
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Database Setup**
   
   Create a MySQL database and update the database configuration in `app/config/db.config.js`:
   
   ```javascript
   module.exports = {
     HOST: "localhost",        // Your MySQL host
     USER: "your_username",    // Your MySQL username
     PASSWORD: "your_password", // Your MySQL password
     DB: "your_database_name"  // Your database name
   };
   ```

4. **Create the Customer Table**
   
   Execute the following SQL command in your MySQL database to create the required table:
   
   ```sql
   CREATE TABLE IF NOT EXISTS customers (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) NOT NULL,
     name VARCHAR(255) NOT NULL,
     active BOOLEAN DEFAULT TRUE,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   );
   ```

## Running the Application

### Development Mode

To start the server in development mode:

```bash
npm start
```

Or directly with Node.js:

```bash
node server.js
```

The server will start on port 3000 by default. You can access it at:
```
http://localhost:3000
```

### Using a Custom Port

You can specify a custom port using the PORT environment variable:

```bash
PORT=8080 node server.js
```

## API Endpoints

The API provides the following endpoints for customer management:

### Customer Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create a new customer |
| GET | `/customers` | Retrieve all customers |
| GET | `/customers/:customerId` | Retrieve a specific customer by ID |
| PUT | `/customers/:customerId` | Update a customer by ID |
| DELETE | `/customers/:customerId` | Delete a customer by ID |
| DELETE | `/customers` | Delete all customers |

### Additional Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user` | Get sample user data (middleware example) |

### Customer Data Structure

Each customer object contains the following fields:

```json
{
  "id": "number (auto-generated)",
  "email": "string (required)",
  "name": "string (required)",
  "active": "boolean (optional, default: true)"
}
```

### Example API Usage

#### Create a Customer
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe",
    "active": true
  }'
```

#### Get All Customers
```bash
curl -X GET http://localhost:3000/customers
```

#### Get Customer by ID
```bash
curl -X GET http://localhost:3000/customers/1
```

#### Update Customer
```bash
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.updated@example.com",
    "name": "John Updated",
    "active": false
  }'
```

#### Delete Customer
```bash
curl -X DELETE http://localhost:3000/customers/1
```

#### Delete All Customers
```bash
curl -X DELETE http://localhost:3000/customers
```

## Testing

Currently, the project doesn't have automated tests configured. The `package.json` shows:

```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1"
}
```

### Manual Testing

You can test the API endpoints manually using:

1. **curl commands** (as shown in the API usage examples above)
2. **Postman** or **Insomnia** - Import the endpoints and test them
3. **Browser** - For GET requests, you can test directly in the browser

### Setting up Tests (Recommended)

To add proper testing to this project, you can:

1. Install a testing framework like Jest or Mocha:
   ```bash
   npm install --save-dev jest supertest
   ```

2. Create test files in a `test` or `__tests__` directory

3. Update the `package.json` test script:
   ```json
   "scripts": {
     "test": "jest",
     "test:watch": "jest --watch"
   }
   ```

4. Example test structure:
   ```javascript
   const request = require('supertest');
   const app = require('../server');
   
   describe('Customer API', () => {
     test('GET /customers should return all customers', async () => {
       const response = await request(app)
         .get('/customers')
         .expect(200);
     });
   });
   ```

## Project Structure

```
├── app/
│   ├── config/
│   │   └── db.config.js          # Database configuration
│   ├── controllers/
│   │   └── customer.controller.js # Customer CRUD operations
│   ├── models/
│   │   ├── customer.model.js     # Customer model and database queries
│   │   └── db.js                 # Database connection pool
│   └── routes/
│       └── customer.routes.js    # API route definitions
├── middleware.js                 # Custom middleware functions
├── server.js                     # Main application entry point
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

## Dependencies

- **express**: Fast, unopinionated, minimalist web framework for Node.js
- **mysql**: MySQL client for Node.js
- **body-parser**: Parse incoming request bodies in a middleware

## Environment Variables

The application supports the following environment variables:

- `PORT`: Server port (default: 3000)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Author

**veera** - [veeraRaghavSanthosh](https://github.com/veeraRaghavSanthosh)

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `app/config/db.config.js`
   - Ensure the database exists
   - Test connection: `mysql -u your_username -p your_database_name`

2. **Port Already in Use**
   - Change the port using the PORT environment variable
   - Kill the process using the port: `lsof -ti:3000 | xargs kill -9`

3. **Module Not Found Error**
   - Run `npm install` to install all dependencies
   - Check if all required files exist in the project structure

4. **SQL Syntax Error**
   - Ensure the customers table is created with the correct schema
   - Check MySQL version compatibility

### Debug Mode

To run the application with debug information:

```bash
DEBUG=* node server.js
```

### Database Schema

The application expects a `customers` table with the following structure:

```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

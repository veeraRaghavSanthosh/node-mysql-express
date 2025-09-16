# Node.js Express MySQL REST API

A RESTful CRUD API built with Node.js, Express.js, and MySQL for customer management.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Changelog](#changelog)

## Features

- ✅ RESTful API for customer management
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ MySQL database integration
- ✅ Express.js middleware support
- ✅ JSON request/response handling
- ✅ Error handling and validation

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 12.x or higher)
- **npm** (Node Package Manager)
- **MySQL** (version 5.7 or higher)

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

## Database Setup

1. **Create a MySQL database:**
   ```sql
   CREATE DATABASE your_database_name;
   ```

2. **Create the customers table:**
   ```sql
   USE your_database_name;
   
   CREATE TABLE customers (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) NOT NULL,
     name VARCHAR(255) NOT NULL,
     active BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```

## Configuration

1. **Database Configuration:**
   Update the database configuration in `app/config/db.config.js`:
   ```javascript
   module.exports = {
     HOST: "localhost",
     USER: "your_mysql_username",
     PASSWORD: "your_mysql_password",
     DB: "your_database_name"
   };
   ```

2. **Environment Variables (Optional):**
   You can set the port using environment variables:
   ```bash
   export PORT=3000
   ```

## Running the Application

### Development Mode

1. **Start the server:**
   ```bash
   npm start
   # or
   node server.js
   ```

2. **The server will start on:**
   ```
   http://localhost:3000
   ```

3. **You should see the message:**
   ```
   Server is running on port 3000.
   ```

### Production Mode

For production deployment, consider using a process manager like PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application with PM2
pm2 start server.js --name "node-mysql-api"

# Monitor the application
pm2 monit
```

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Customer Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | Get all customers |
| GET | `/customers/:id` | Get customer by ID |
| POST | `/customers` | Create new customer |
| PUT | `/customers/:id` | Update customer by ID |
| DELETE | `/customers/:id` | Delete customer by ID |
| DELETE | `/customers` | Delete all customers |

### Additional Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/user` | Get sample user data (middleware example) |

### Example API Usage

**Create a customer:**
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "active": true
  }'
```

**Get all customers:**
```bash
curl -X GET http://localhost:3000/customers
```

**Get customer by ID:**
```bash
curl -X GET http://localhost:3000/customers/1
```

**Update customer:**
```bash
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "active": false
  }'
```

**Delete customer:**
```bash
curl -X DELETE http://localhost:3000/customers/1
```

## Testing

### Unit Tests Setup

Currently, the project has a basic test script placeholder. To set up proper testing:

1. **Install testing dependencies:**
   ```bash
   npm install --save-dev jest supertest
   ```

2. **Update package.json scripts:**
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch",
       "test:coverage": "jest --coverage"
     }
   }
   ```

3. **Create test files:**
   ```bash
   mkdir tests
   touch tests/customer.test.js
   ```

### Example Test Structure

Create `tests/customer.test.js`:
```javascript
const request = require('supertest');
const app = require('../server');

describe('Customer API', () => {
  test('GET /customers should return all customers', async () => {
    const response = await request(app)
      .get('/customers')
      .expect(200);
    
    expect(Array.isArray(response.body)).toBe(true);
  });

  test('POST /customers should create a new customer', async () => {
    const newCustomer = {
      name: 'Test Customer',
      email: 'test@example.com',
      active: true
    };

    const response = await request(app)
      .post('/customers')
      .send(newCustomer)
      .expect(200);
    
    expect(response.body.name).toBe(newCustomer.name);
    expect(response.body.email).toBe(newCustomer.email);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Manual Testing with Postman

1. Import the API endpoints into Postman
2. Set up environment variables for base URL
3. Test each endpoint with various payloads
4. Verify error handling with invalid data

## Project Structure

```
node-mysql-express/
├── app/
│   ├── config/
│   │   └── db.config.js          # Database configuration
│   ├── controllers/
│   │   └── customer.controller.js # Customer business logic
│   ├── models/
│   │   ├── customer.model.js     # Customer model
│   │   └── db.js                 # Database connection
│   └── routes/
│       └── customer.routes.js    # API routes
├── tests/                        # Test files (to be created)
├── middleware.js                 # Custom middleware
├── package.json                  # Project dependencies
├── server.js                     # Application entry point
└── README.md                     # Project documentation
```

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MySQL** - Relational database
- **body-parser** - Parse incoming request bodies

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Author

**Veera** - [GitHub Profile](https://github.com/veeraRaghavSanthosh)

---

## Changelog

### [1.0.1] - 2025-09-16

#### Added
- Comprehensive README.md with installation instructions
- API documentation with example usage
- Database setup instructions
- Testing guidelines and unit test structure
- Project structure documentation
- Configuration instructions for different environments

#### Improved
- Documentation clarity and completeness
- Setup process for new developers
- API endpoint documentation with examples

#### Technical Details
- Added curl examples for all API endpoints
- Included MySQL table schema
- Added PM2 production deployment instructions
- Provided Jest testing framework setup
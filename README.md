# Node.js Express MySQL REST API

A RESTful CRUD API built with Node.js, Express.js, and MySQL for managing customer data.

## Features

- Full CRUD operations for customers
- RESTful API endpoints
- MySQL database integration
- Express.js middleware support
- Body parsing for JSON and URL-encoded data

## Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 12 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MySQL](https://www.mysql.com/) database server

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
   
   Create a MySQL database and a customers table:
   ```sql
   CREATE DATABASE your_database_name;
   USE your_database_name;
   
   CREATE TABLE customers (
     id INT AUTO_INCREMENT PRIMARY KEY,
     email VARCHAR(255) NOT NULL,
     name VARCHAR(255) NOT NULL,
     active BOOLEAN DEFAULT true
   );
   ```

4. **Configure Database Connection**
   
   Update the database configuration in `app/config/db.config.js`:
   ```javascript
   module.exports = {
     HOST: "localhost",
     USER: "your_mysql_username",
     PASSWORD: "your_mysql_password",
     DB: "your_database_name"
   };
   ```

## Running the Application

### Development Mode

Start the server:
```bash
npm start
```
or
```bash
node server.js
```

The server will start on port 3000 by default. You can change the port by setting the `PORT` environment variable:
```bash
PORT=8080 node server.js
```

The API will be available at: `http://localhost:3000`

### Production Mode

For production deployment, you might want to use a process manager like PM2:
```bash
npm install -g pm2
pm2 start server.js --name "nodejs-express-mysql"
```

## API Endpoints

The following REST API endpoints are available:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | Get all customers |
| GET | `/customers/:id` | Get a specific customer by ID |
| POST | `/customers` | Create a new customer |
| PUT | `/customers/:id` | Update a customer by ID |
| DELETE | `/customers/:id` | Delete a customer by ID |
| DELETE | `/customers` | Delete all customers |
| GET | `/user` | Get sample user data (middleware demo) |

### API Usage Examples

#### Create a Customer
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "active": true
  }'
```

#### Get All Customers
```bash
curl -X GET http://localhost:3000/customers
```

#### Get a Customer by ID
```bash
curl -X GET http://localhost:3000/customers/1
```

#### Update a Customer
```bash
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "johnsmith@example.com",
    "active": true
  }'
```

#### Delete a Customer
```bash
curl -X DELETE http://localhost:3000/customers/1
```

## Testing

### Manual Testing

You can test the API endpoints using:

1. **cURL** (examples provided above)
2. **Postman** - Import the endpoints and test them
3. **Browser** - For GET requests, you can test directly in the browser

### Automated Testing

Currently, no automated tests are configured. To add tests, you can:

1. **Install a testing framework** (e.g., Jest, Mocha):
   ```bash
   npm install --save-dev jest supertest
   ```

2. **Create test files** in a `test` or `__tests__` directory

3. **Update package.json** scripts:
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch"
     }
   }
   ```

4. **Example test structure**:
   ```javascript
   // test/customers.test.js
   const request = require('supertest');
   const app = require('../server');
   
   describe('Customer API', () => {
     test('GET /customers', async () => {
       const response = await request(app).get('/customers');
       expect(response.status).toBe(200);
     });
   });
   ```

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
├── middleware.js                  # Custom middleware (unused)
├── package.json                   # Project dependencies and scripts
├── server.js                      # Application entry point
└── README.md                      # Project documentation
```

## Environment Variables

You can use environment variables to configure the application:

- `PORT` - Server port (default: 3000)
- `DB_HOST` - MySQL host
- `DB_USER` - MySQL username
- `DB_PASSWORD` - MySQL password
- `DB_NAME` - MySQL database name

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Create a new Pull Request

## License

This project is licensed under the ISC License.

## Author

**veera** - [veeraRaghavSanthosh](https://github.com/veeraRaghavSanthosh)

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `db.config.js`
   - Ensure the database exists

2. **Port Already in Use**
   - Change the port using: `PORT=8080 node server.js`
   - Or kill the process using the port

3. **Module Not Found**
   - Run `npm install` to install dependencies
   - Check if all required packages are in `package.json`

### Support

For issues and questions, please create an issue on the [GitHub repository](https://github.com/veeraRaghavSanthosh/node-mysql-express/issues).
# Node.js Express MySQL REST API

A RESTful CRUD API built with Node.js, Express.js, and MySQL that provides endpoints for customer management operations.

## Features

- RESTful API endpoints for customer operations (Create, Read, Update, Delete)
- MySQL database integration
- Express.js middleware support
- Body parser for JSON and URL-encoded data
- Modular architecture with separate controllers, models, and routes

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

3. **Set up MySQL database**
   - Create a new MySQL database for the application
   - Update the database configuration in `app/config/db.config.js` with your MySQL credentials:
     ```javascript
     module.exports = {
       HOST: "localhost",
       USER: "your_mysql_username",
       PASSWORD: "your_mysql_password",
       DB: "your_database_name"
     };
     ```

4. **Create the required database tables**
   - The application expects a `customers` table. Create it using:
     ```sql
     CREATE TABLE customers (
       id INT AUTO_INCREMENT PRIMARY KEY,
       email VARCHAR(255) NOT NULL,
       name VARCHAR(255) NOT NULL,
       active BOOLEAN DEFAULT TRUE
     );
     ```

## Configuration

### Environment Variables

You can set the following environment variable:

- `PORT`: Server port (default: 3000)

Example:
```bash
export PORT=8080
```

### Database Configuration

Update the database configuration in `app/config/db.config.js`:

```javascript
module.exports = {
  HOST: "localhost",      // Database host
  USER: "root",          // Database username
  PASSWORD: "password",   // Database password
  DB: "testdb"           // Database name
};
```

## Running the Application

### Development Mode

```bash
npm start
```

or

```bash
node server.js
```

The server will start on port 3000 (or the port specified in the PORT environment variable).

You should see the message:
```
Server is running on port 3000.
```

### Production Mode

For production deployment, you can use a process manager like PM2:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application with PM2
pm2 start server.js --name "node-mysql-express"

# View logs
pm2 logs node-mysql-express

# Stop the application
pm2 stop node-mysql-express
```

## API Endpoints

The application provides the following endpoints:

### Test Endpoint
- `GET /user` - Returns a list of test users (middleware demonstration)

### Customer Endpoints
- `GET /api/customers` - Get all customers
- `GET /api/customers/:id` - Get a specific customer by ID
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update a customer by ID
- `DELETE /api/customers/:id` - Delete a customer by ID

### Example API Usage

**Create a customer:**
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com"
  }'
```

**Get all customers:**
```bash
curl http://localhost:3000/api/customers
```

**Get a specific customer:**
```bash
curl http://localhost:3000/api/customers/1
```

**Update a customer:**
```bash
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@example.com"
  }'
```

**Delete a customer:**
```bash
curl -X DELETE http://localhost:3000/api/customers/1
```

## Testing

Currently, the project has a basic test script configuration in `package.json`. To run tests:

```bash
npm test
```

**Note:** The current test script is a placeholder. To add proper testing:

1. **Install a testing framework** (e.g., Jest, Mocha):
   ```bash
   npm install --save-dev jest supertest
   ```

2. **Create test files** in a `test/` or `__tests__/` directory

3. **Update the test script** in `package.json`:
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch"
     }
   }
   ```

### Example Test Setup

Create a `test/api.test.js` file for API testing:

```javascript
const request = require('supertest');
const app = require('../server');

describe('Customer API', () => {
  test('GET /api/customers should return customers', async () => {
    const response = await request(app)
      .get('/api/customers')
      .expect(200);
  });
});
```

## Project Structure

```
node-mysql-express/
├── app/
│   ├── config/
│   │   └── db.config.js      # Database configuration
│   ├── controllers/
│   │   └── customer.controller.js  # Customer business logic
│   ├── models/
│   │   ├── db.js             # Database connection
│   │   └── customer.model.js # Customer model
│   └── routes/
│       └── customer.routes.js # API routes
├── middleware.js             # Custom middleware
├── server.js                 # Application entry point
├── package.json             # Dependencies and scripts
└── README.md               # Project documentation
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `app/config/db.config.js`
   - Ensure the database exists

2. **Port Already in Use**
   - Change the port by setting the PORT environment variable
   - Kill the process using the port: `lsof -ti:3000 | xargs kill -9`

3. **Module Not Found Errors**
   - Run `npm install` to install all dependencies
   - Check if all required files exist in the project structure

### Logs

The application logs server startup information to the console. For production, consider implementing proper logging with libraries like:
- [Winston](https://www.npmjs.com/package/winston)
- [Morgan](https://www.npmjs.com/package/morgan) for HTTP request logging

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit them: `git commit -m 'Add feature'`
4. Submit a pull request

## License

This project is licensed under the ISC License - see the package.json file for details.

## Author

**veera** - [veeraRaghavSanthosh](https://github.com/veeraRaghavSanthosh)

## Keywords

- nodejs
- express
- mysql
- restapi
- crud
- api
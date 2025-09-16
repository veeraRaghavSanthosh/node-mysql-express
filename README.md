# Node.js Express MySQL REST API

A RESTful CRUD API built with Node.js, Express.js, and MySQL for managing customer data.

## Features

- RESTful API endpoints for customer management
- MySQL database integration
- Express.js web framework
- Body parser middleware for JSON requests
- CRUD operations (Create, Read, Update, Delete)

## Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 12 or higher)
- [MySQL](https://www.mysql.com/) database server
- npm (comes with Node.js)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/veeraRaghavSanthosh/node-mysql-express.git
cd node-mysql-express
```

2. Install dependencies:
```bash
npm install
```

3. Configure the database:
   - Update the database configuration in `app/config/db.config.js` with your MySQL credentials:
   ```javascript
   module.exports = {
     HOST: "your_mysql_host",
     USER: "your_mysql_username", 
     PASSWORD: "your_mysql_password",
     DB: "your_database_name"
   };
   ```

4. Create the customers table in your MySQL database:
```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT true
);
```

## Running the Application

1. Start the server:
```bash
npm start
```

2. The server will start on port 3000 (or the port specified in the PORT environment variable):
```
Server is running on port 3000.
```

3. The API will be available at `http://localhost:3000`

## API Endpoints

### Customer Management

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
| GET | `/user` | Get sample user data (demo endpoint) |

### Example API Usage

#### Create a customer:
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","active":true}'
```

#### Get all customers:
```bash
curl http://localhost:3000/customers
```

#### Get customer by ID:
```bash
curl http://localhost:3000/customers/1
```

#### Update a customer:
```bash
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","active":true}'
```

#### Delete a customer:
```bash
curl -X DELETE http://localhost:3000/customers/1
```

## Testing

Currently, this project does not have automated tests configured. The test script in `package.json` returns an error message.

### Setting up Tests (Recommended)

To add unit tests to this project, you can install a testing framework like Jest or Mocha:

#### Using Jest:
```bash
npm install --save-dev jest supertest
```

Then update the test script in `package.json`:
```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch"
  }
}
```

#### Using Mocha:
```bash
npm install --save-dev mocha chai supertest
```

Then update the test script in `package.json`:
```json
{
  "scripts": {
    "test": "mocha",
    "test:watch": "mocha --watch"
  }
}
```

### Manual Testing

You can manually test the API endpoints using:
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- curl commands (examples provided above)
- Browser for GET requests

## Project Structure

```
├── app/
│   ├── config/
│   │   └── db.config.js          # Database configuration
│   ├── controllers/
│   │   └── customer.controller.js # Customer business logic
│   ├── models/
│   │   ├── db.js                 # Database connection
│   │   └── customer.model.js     # Customer model
│   └── routes/
│       └── customer.routes.js    # API routes
├── middleware.js                 # Custom middleware (unused)
├── package.json                  # Project dependencies and scripts
└── server.js                     # Application entry point
```

## Dependencies

- **express**: Fast, unopinionated web framework for Node.js
- **mysql**: MySQL client for Node.js
- **body-parser**: Parse incoming request bodies in middleware

## Environment Variables

The application uses the following environment variables:

- `PORT`: Server port (default: 3000)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Changelog

### Version 1.0.0 (Current)
- Initial release with basic CRUD operations for customer management
- RESTful API endpoints for customer data
- MySQL database integration
- Express.js server setup with middleware support
- Basic authentication middleware structure (not implemented)
- Sample user endpoint for demonstration

---

**Author**: veera  
**Repository**: https://github.com/veeraRaghavSanthosh/node-mysql-express
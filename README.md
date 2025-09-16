# Node.js Express MySQL API

A RESTful API built with Node.js, Express, and MySQL for managing customer data.

## Features

- Complete CRUD operations for customers
- RESTful API endpoints
- MySQL database integration
- Express middleware support
- Error handling and validation

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure database:**
   Update the database configuration in `app/config/db.config.js` with your MySQL credentials.

3. **Start the server:**
   ```bash
   node server.js
   ```

   The server will run on `http://localhost:3000` by default.

## API Endpoints

- `POST /customers` - Create a new customer
- `GET /customers` - Get all customers  
- `GET /customers/:id` - Get a customer by ID
- `PUT /customers/:id` - Update a customer
- `DELETE /customers/:id` - Delete a customer
- `DELETE /customers` - Delete all customers

## Usage Examples

Check the `/examples` directory for comprehensive usage examples in both JavaScript and TypeScript:

- **JavaScript Example:** `examples/javascript-usage.js`
- **TypeScript Example:** `examples/typescript-usage.ts`
- **Documentation:** `examples/README.md`

### Quick Example

```javascript
const axios = require('axios');

// Create a customer
const response = await axios.post('http://localhost:3000/customers', {
  name: "John Doe",
  email: "john.doe@example.com", 
  active: true
});

console.log('Customer created:', response.data);
```

### Run Examples

```bash
cd examples
npm install

# Test connection
npm test

# Run JavaScript demo
npm run demo:js

# Run TypeScript demo  
npm run demo:ts
```

## Customer Data Structure

```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "active": true
}
```

## Dependencies

- **express** - Web framework
- **mysql** - MySQL database driver
- **body-parser** - Request body parsing middleware

## Project Structure

```
├── app/
│   ├── config/
│   │   └── db.config.js     # Database configuration
│   ├── controllers/
│   │   └── customer.controller.js  # Route handlers
│   ├── models/
│   │   ├── db.js           # Database connection
│   │   └── customer.model.js   # Customer model
│   └── routes/
│       └── customer.routes.js   # API routes
├── examples/               # Usage examples
│   ├── javascript-usage.js
│   ├── typescript-usage.ts
│   ├── package.json
│   └── README.md
├── middleware.js          # Custom middleware
├── server.js             # Main server file
└── package.json          # Project dependencies
```

## License

ISC
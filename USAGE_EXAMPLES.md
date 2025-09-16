# Node.js Express MySQL API - Usage Examples

This repository provides comprehensive usage examples for the `node-mysql-express` library in both **JavaScript** and **TypeScript**. The library provides a complete REST API framework with MySQL integration for CRUD operations.

## 🚀 Quick Start

### JavaScript Example

1. **Install dependencies:**
   ```bash
   npm install express mysql body-parser
   npm install --save-dev nodemon  # for development
   ```

2. **Run the JavaScript example:**
   ```bash
   node usage-examples.js
   # or for development with auto-reload:
   npm run dev
   ```

### TypeScript Example

1. **Install dependencies:**
   ```bash
   npm install express mysql body-parser
   npm install --save-dev typescript @types/node @types/express @types/mysql ts-node nodemon
   ```

2. **Run the TypeScript example:**
   ```bash
   # Development mode (recommended):
   npm run dev
   
   # Or compile and run:
   npm run build
   npm start
   ```

## 📁 File Structure

```
/
├── usage-examples.js          # JavaScript implementation
├── usage-typescript.ts        # TypeScript implementation  
├── package-js-example.json    # Package.json for JS example
├── package-ts-example.json    # Package.json for TS example
├── tsconfig.json             # TypeScript configuration
└── USAGE_EXAMPLES.md         # This file
```

## 🔧 API Endpoints

Both examples provide the same REST API endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/customers` | Create a new customer |
| `GET` | `/api/customers` | Get all customers |
| `GET` | `/api/customers/:id` | Get customer by ID |
| `PUT` | `/api/customers/:id` | Update customer by ID |
| `DELETE` | `/api/customers/:id` | Delete customer by ID |
| `DELETE` | `/api/customers` | Delete all customers |

## 📝 Usage Examples

### Creating a Customer

**JavaScript:**
```javascript
const customer = {
  name: "John Doe",
  email: "john@example.com", 
  active: true
};

// Using fetch API
fetch('http://localhost:3000/api/customers', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(customer)
})
.then(response => response.json())
.then(data => console.log(data));
```

**TypeScript:**
```typescript
interface Customer {
  id?: number;
  name: string;
  email: string;
  active: boolean;
}

const customer: Omit<Customer, 'id'> = {
  name: "John Doe",
  email: "john@example.com",
  active: true
};

// Using fetch with proper typing
const createCustomer = async (customer: Omit<Customer, 'id'>): Promise<Customer> => {
  const response = await fetch('http://localhost:3000/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(customer)
  });
  
  const result = await response.json();
  if (result.success) {
    return result.data;
  }
  throw new Error(result.message);
};
```

### Getting All Customers

**cURL:**
```bash
curl http://localhost:3000/api/customers
```

**JavaScript/TypeScript:**
```javascript
fetch('http://localhost:3000/api/customers')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Updating a Customer

**cURL:**
```bash
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","email":"jane@example.com","active":false}'
```

### Deleting a Customer

**cURL:**
```bash
curl -X DELETE http://localhost:3000/api/customers/1
```

## 🏗️ Architecture

### JavaScript Implementation Features:
- Express.js server setup
- Body-parser middleware for JSON/URL-encoded data
- Custom authentication middleware
- Comprehensive error handling
- Input validation
- Multiple middleware chain examples
- Backward compatibility with older Node.js versions

### TypeScript Implementation Features:
- Full type safety with interfaces
- Strongly typed API responses
- Type-safe middleware functions
- Generic response handlers
- Comprehensive error handling with types
- Modern async/await patterns
- Export support for testing

## 🔒 Database Configuration

The examples use mock data for demonstration. To connect to a real MySQL database, update the database configuration:

**JavaScript:**
```javascript
const dbConfig = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "",
  DB: process.env.DB_NAME || "testdb"
};
```

**TypeScript:**
```typescript
interface DatabaseConfig {
  HOST: string;
  USER: string; 
  PASSWORD: string;
  DB: string;
}

const dbConfig: DatabaseConfig = {
  HOST: process.env.DB_HOST || "localhost",
  USER: process.env.DB_USER || "root",
  PASSWORD: process.env.DB_PASSWORD || "",
  DB: process.env.DB_NAME || "testdb"
};
```

## 🛡️ Middleware Examples

### Authentication Middleware
```javascript
const authMiddleware = (req, res, next) => {
  // Add your authentication logic here
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  next();
};
```

### Validation Middleware
```javascript
const validateCustomer = (req, res, next) => {
  const { email, name } = req.body;
  
  if (!email || !email.includes('@')) {
    return res.status(400).json({ message: 'Valid email required' });
  }
  
  if (!name || name.length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters' });
  }
  
  next();
};
```

## 🧪 Testing the API

You can test the API using various tools:

### Using cURL:
```bash
# Test server is running
curl http://localhost:3000/api/customers

# Create a customer
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","active":true}'
```

### Using Postman:
1. Import the endpoints into Postman
2. Set the base URL to `http://localhost:3000`
3. Test each endpoint with sample data

### Using JavaScript/Node.js:
```javascript
const axios = require('axios');

const testAPI = async () => {
  try {
    // Create customer
    const customer = await axios.post('http://localhost:3000/api/customers', {
      name: 'Test User',
      email: 'test@example.com',
      active: true
    });
    console.log('Created:', customer.data);
    
    // Get all customers
    const customers = await axios.get('http://localhost:3000/api/customers');
    console.log('All customers:', customers.data);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
};

testAPI();
```

## 🔧 Environment Variables

Set these environment variables for production:

```bash
PORT=3000
NODE_ENV=production
DB_HOST=your-mysql-host
DB_USER=your-mysql-user
DB_PASSWORD=your-mysql-password
DB_NAME=your-database-name
```

## 🚀 Deployment

### Using PM2:
```bash
npm install -g pm2
pm2 start usage-examples.js --name "api-server"
```

### Using Docker:
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["node", "usage-examples.js"]
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the original repository for details.

## 🆘 Support

If you have any questions or issues:
1. Check the examples in this repository
2. Review the original repository documentation
3. Open an issue on GitHub

---

**Happy coding! 🎉**
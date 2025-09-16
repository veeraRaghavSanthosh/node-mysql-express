# Billing System API

A Node.js Express application with MySQL for customer management as part of a billing system.

## 📚 Documentation

### API Documentation
Complete API documentation is available in [`docs/billing-api.md`](docs/billing-api.md), including:
- All customer management endpoints
- Request/response schemas
- Example requests with cURL
- Error handling and status codes
- Database schema information

### Key Features
- **Customer Management**: Full CRUD operations for customer data
- **MySQL Integration**: Robust database operations with error handling
- **RESTful API**: Clean REST endpoints following best practices
- **Comprehensive Testing**: Unit tests with mocking and integration test structure
- **Error Handling**: Consistent error responses across all endpoints

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MySQL database
- npm or yarn

### Installation
```bash
# Install dependencies
npm install

# Start the server
npm start

# For development with auto-reload
npm run dev
```

### Database Setup
Create a MySQL database and update the connection configuration in `app/config/db.config.js`.

Required table:
```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL, 
  active BOOLEAN DEFAULT TRUE
);
```

## 📋 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/customers` | Create a new customer |
| GET | `/customers` | Get all customers |
| GET | `/customers/:id` | Get customer by ID |
| PUT | `/customers/:id` | Update customer |
| DELETE | `/customers/:id` | Delete customer |
| DELETE | `/customers` | Delete all customers |

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage
The test suite includes:
- **Unit Tests**: 18 test cases covering all endpoints
- **Mocking**: Database operations mocked for isolated testing
- **Error Scenarios**: Tests for validation, not found, and database errors
- **Integration Tests**: Structure for full lifecycle testing
- **Performance Tests**: Placeholder for load testing
- **Security Tests**: Placeholder for security validation

### Test Files
- `billing-api.test.js` - Main test suite with comprehensive coverage

## 📖 Example Usage

### Create a Customer
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "name": "John Doe",
    "active": true
  }'
```

### Get All Customers
```bash
curl -X GET http://localhost:3000/customers
```

### Get Customer by ID
```bash
curl -X GET http://localhost:3000/customers/1
```

### Update Customer
```bash
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.updated@example.com",
    "name": "John Updated",
    "active": false
  }'
```

### Delete Customer
```bash
curl -X DELETE http://localhost:3000/customers/1
```

## 🔧 Configuration

### Database Configuration
Update `app/config/db.config.js` with your MySQL connection details:
```javascript
module.exports = {
  HOST: "localhost",
  USER: "your_username",
  PASSWORD: "your_password", 
  DB: "your_database_name"
};
```

### Server Configuration
The server runs on port 3000 by default. Set the `PORT` environment variable to change it:
```bash
PORT=8080 npm start
```

## 📝 Response Formats

### Success Response
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "active": true
}
```

### Error Response
```json
{
  "message": "Error description"
}
```

## 🔒 Security Considerations

- **Input Validation**: Validate all input data
- **SQL Injection**: Use parameterized queries (implemented in model)
- **Authentication**: Currently not implemented (future enhancement)
- **Rate Limiting**: Not implemented (future enhancement)

## 🚧 Future Enhancements

- Authentication and authorization
- Input validation middleware
- Rate limiting
- API versioning
- Logging and monitoring
- Pagination for large datasets
- Email validation
- Customer status management

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a detailed history of changes and version information.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
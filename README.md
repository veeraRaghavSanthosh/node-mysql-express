# Node MySQL Express Application

A Node.js web application built with Express framework and MySQL database integration.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Changelog](#changelog)

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js** (version 14.x or higher)
- **npm** (comes with Node.js)
- **MySQL** (version 5.7 or higher)
- **Git**

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

3. **Install development dependencies:**
   ```bash
   npm install --save-dev
   ```

## Configuration

1. **Database Setup:**
   - Create a MySQL database for the application
   - Update the database configuration in your environment variables or config file

2. **Environment Variables:**
   Create a `.env` file in the root directory and add the following variables:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
   DB_PORT=3306
   NODE_ENV=development
   ```

3. **Database Migration/Setup:**
   ```bash
   # Run database migrations (if available)
   npm run migrate
   
   # Or seed the database (if available)
   npm run seed
   ```

## Running the Application

### Development Mode

Start the application in development mode with hot reload:

```bash
npm run dev
```

### Production Mode

1. **Build the application (if applicable):**
   ```bash
   npm run build
   ```

2. **Start the production server:**
   ```bash
   npm start
   ```

The application will be available at `http://localhost:3000` (or the port specified in your environment variables).

## Testing

This project includes comprehensive unit tests and integration tests.

### Running All Tests

```bash
npm test
```

### Running Tests in Watch Mode

```bash
npm run test:watch
```

### Running Tests with Coverage

```bash
npm run test:coverage
```

### Unit Tests

Unit tests are located in the `test/` or `__tests__/` directory and test individual components and functions.

```bash
# Run only unit tests
npm run test:unit
```

### Integration Tests

Integration tests verify the interaction between different parts of the application, including API endpoints and database operations.

```bash
# Run only integration tests
npm run test:integration
```

### Test Structure

```
test/
├── unit/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── utils/
├── integration/
│   ├── api/
│   └── database/
└── fixtures/
    └── testData.js
```

### Writing Tests

- Use **Jest** as the testing framework
- Use **Supertest** for API endpoint testing
- Mock external dependencies and database calls in unit tests
- Use test database for integration tests

Example test:

```javascript
const request = require('supertest');
const app = require('../app');

describe('GET /api/users', () => {
  it('should return all users', async () => {
    const response = await request(app)
      .get('/api/users')
      .expect(200);
    
    expect(response.body).toHaveProperty('users');
    expect(Array.isArray(response.body.users)).toBe(true);
  });
});
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Common Response Format
```json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "error": null
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error message",
  "data": null,
  "error": {
    "code": "ERROR_CODE",
    "details": "Detailed error information"
  }
}
```

## Project Structure

```
node-mysql-express/
├── config/
│   ├── database.js          # Database configuration
│   └── config.js           # Application configuration
├── controllers/
│   └── userController.js   # Route controllers
├── middleware/
│   ├── auth.js            # Authentication middleware
│   ├── validation.js      # Input validation
│   └── errorHandler.js    # Error handling middleware
├── models/
│   └── User.js            # Database models
├── routes/
│   ├── index.js           # Main routes
│   └── users.js           # User routes
├── test/
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── fixtures/          # Test data
├── utils/
│   ├── database.js        # Database utilities
│   └── helpers.js         # Helper functions
├── .env.example           # Environment variables template
├── .gitignore            # Git ignore rules
├── app.js                # Express application setup
├── server.js             # Server entry point
├── package.json          # Project dependencies and scripts
└── README.md             # This file
```

## Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run all tests
- `npm run test:unit` - Run unit tests only
- `npm run test:integration` - Run integration tests only
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run migrate` - Run database migrations
- `npm run seed` - Seed the database with sample data

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR

## Changelog

### [1.1.0] - 2025-09-16

#### Added
- Comprehensive README.md with installation and usage instructions
- Detailed testing documentation and examples
- Unit test and integration test structure guidelines
- API documentation with request/response formats
- Development and production setup instructions
- Environment configuration guide
- Project structure documentation

#### Improved
- Enhanced project documentation for better developer experience
- Added testing best practices and examples
- Included comprehensive script documentation

#### Technical Details
- Added support for comprehensive testing framework
- Improved project structure documentation
- Enhanced configuration management guidelines

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/veeraRaghavSanthosh/node-mysql-express/issues) on GitHub.
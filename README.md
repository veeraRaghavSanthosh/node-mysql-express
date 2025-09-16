# Node.js Express MySQL REST API

[![CI](https://github.com/veeraRaghavSanthosh/node-mysql-express/actions/workflows/ci.yml/badge.svg)](https://github.com/veeraRaghavSanthosh/node-mysql-express/actions/workflows/ci.yml)

A RESTful CRUD API built with Node.js, Express, and MySQL for customer management.

## Features

- Full CRUD operations for customer management
- MySQL database integration
- Express.js web framework
- Body parsing middleware
- **NEW**: Automated testing with Jest
- **NEW**: Code linting with ESLint
- **NEW**: Continuous Integration with GitHub Actions

## API Endpoints

### Customers
- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID
- `POST /customers` - Create new customer
- `PUT /customers/:id` - Update customer by ID
- `DELETE /customers/:id` - Delete customer by ID
- `DELETE /customers` - Delete all customers

### User (Test endpoint)
- `GET /user` - Get test user data

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your MySQL database in `app/config/db.config.js`
4. Start the server:
   ```bash
   npm start
   ```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

### Linting
```bash
# Check for linting errors
npm run lint

# Fix linting errors automatically
npm run lint:fix
```

## CI/CD Pipeline

This project now includes a comprehensive CI/CD pipeline using GitHub Actions that:

- **Automated Testing**: Runs on every pull request and push to master/main
- **Multi-Node.js Version Testing**: Tests against Node.js 14.x, 16.x, and 18.x
- **Database Testing**: Uses MySQL 5.7 service container for integration tests
- **Code Quality**: ESLint checks for code consistency and style
- **Coverage Reports**: Integrates with Codecov for test coverage tracking

### What happens on each PR:
1. Code is checked out
2. Dependencies are installed across multiple Node.js versions
3. MySQL database is set up with test data
4. ESLint runs to check code quality
5. Jest runs comprehensive unit and integration tests
6. Coverage reports are generated and uploaded

## Database Schema

### Customers Table
```sql
CREATE TABLE customers (
  id int(11) NOT NULL AUTO_INCREMENT,
  email varchar(255) DEFAULT NULL,
  name varchar(255) DEFAULT NULL,
  active boolean DEFAULT false,
  PRIMARY KEY (id)
);
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass: `npm test`
6. Run linting checks: `npm run lint`
7. Submit a pull request

The CI pipeline will automatically run tests and linting on your pull request.

## Recent Improvements

- ✅ Added comprehensive unit test suite with Jest
- ✅ Implemented ESLint for code quality and consistency
- ✅ Set up GitHub Actions CI/CD pipeline
- ✅ Added multi-Node.js version testing
- ✅ Integrated MySQL service for database testing
- ✅ Added test coverage reporting
- ✅ Enhanced package.json with proper scripts and dependencies

## License

ISC
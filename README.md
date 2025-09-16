# Node.js Express MySQL REST API

A RESTful CRUD API built with Node.js, Express.js, and MySQL for managing customer data.

## Features

- **CRUD Operations**: Create, Read, Update, Delete customers
- **Express.js**: Fast, unopinionated web framework for Node.js
- **MySQL Integration**: Reliable database storage
- **Middleware Support**: Custom authentication and data processing middleware
- **Automated Testing**: Comprehensive unit and integration tests
- **Continuous Integration**: GitHub Actions workflow for automated testing and linting

## API Endpoints

### Customer Management
- `GET /api/customers` - Retrieve all customers
- `GET /api/customers/:id` - Retrieve a specific customer
- `POST /api/customers` - Create a new customer
- `PUT /api/customers/:id` - Update a customer
- `DELETE /api/customers/:id` - Delete a customer
- `DELETE /api/customers` - Delete all customers

### Middleware Routes
- `GET /user` - Get sample user data (middleware demonstration)

## Installation

1. Clone the repository
```bash
git clone https://github.com/veeraRaghavSanthosh/node-mysql-express.git
cd node-mysql-express
```

2. Install dependencies
```bash
npm install
```

3. Configure your MySQL database connection in `app/config/db.config.js`

4. Create the customers table in your MySQL database:
```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  active BOOLEAN DEFAULT TRUE
);
```

## Development

### Running the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Code Quality
```bash
# Run linter
npm run lint

# Fix linting issues
npm run lint:fix
```

## CI/CD

This project uses GitHub Actions for continuous integration. The CI pipeline:

- **Triggers**: Runs on pull requests and pushes to master/main branch
- **Node.js Versions**: Tests against Node.js 16.x, 18.x, and 20.x
- **Database**: Uses MySQL 8.0 service for integration testing
- **Quality Checks**: Runs ESLint for code quality
- **Testing**: Executes Jest unit and integration tests
- **Coverage**: Generates and uploads coverage reports to Codecov

### Workflow Features
- Automated dependency installation with npm cache
- Multi-version Node.js testing matrix
- MySQL service container for database testing
- Code coverage reporting
- Linting with ESLint standard configuration

## Project Structure

```
├── app/
│   ├── config/
│   │   └── db.config.js      # Database configuration
│   ├── controllers/
│   │   └── customer.controller.js  # Customer API logic
│   ├── models/
│   │   ├── db.js             # Database connection
│   │   └── customer.model.js # Customer model
│   └── routes/
│       └── customer.routes.js # API routes
├── tests/
│   ├── customer.controller.test.js # Controller tests
│   ├── customer.model.test.js      # Model tests
│   └── server.test.js              # Integration tests
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI workflow
├── server.js                 # Main server file
├── package.json
├── .eslintrc                 # ESLint configuration
└── README.md
```

## Technologies Used

- **Node.js**: JavaScript runtime environment
- **Express.js**: Web application framework
- **MySQL**: Relational database
- **Jest**: Testing framework
- **ESLint**: Code linting and formatting
- **Supertest**: HTTP testing library
- **GitHub Actions**: CI/CD pipeline

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

The CI pipeline will automatically run tests and linting on your pull request.

## License

This project is licensed under the ISC License.
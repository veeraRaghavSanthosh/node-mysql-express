# Node.js Express MySQL API

A RESTful CRUD API built with Node.js, Express, and MySQL.

## Features

- RESTful API endpoints for customer management
- MySQL database integration
- Automated testing with Jest
- Code linting with ESLint
- Continuous Integration with GitHub Actions

## Getting Started

### Prerequisites

- Node.js (v16.x, v18.x, or v20.x)
- MySQL database

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your database connection in `app/config/db.config.js`

4. Start the server:
   ```bash
   npm start
   ```

## Development

### Available Scripts

- `npm start` - Start the production server
- `npm test` - Run tests with coverage
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Run ESLint to check code quality
- `npm run lint:fix` - Run ESLint and automatically fix issues

### Running Tests

The project uses Jest for unit testing. Tests are located in the root directory with `.test.js` extension.

```bash
npm test
```

### Code Quality

The project uses ESLint for code linting. The configuration is in `.eslintrc.js`.

```bash
npm run lint
```

## CI/CD

The project includes a GitHub Actions workflow that runs on every pull request and push to the main branches:

- **Linting**: Ensures code quality and consistency
- **Testing**: Runs unit tests with coverage reporting
- **Multi-version testing**: Tests against Node.js versions 16.x, 18.x, and 20.x
- **MySQL integration**: Uses MySQL 5.7 service for database testing

The workflow is defined in `.github/workflows/ci.yml`.

## API Endpoints

- `POST /customers` - Create a new customer
- `GET /customers` - Get all customers
- `GET /customers/:id` - Get a customer by ID
- `PUT /customers/:id` - Update a customer
- `DELETE /customers/:id` - Delete a customer

## Project Structure

```
├── app/
│   ├── config/
│   │   └── db.config.js      # Database configuration
│   ├── controllers/
│   │   └── customer.controller.js
│   ├── models/
│   │   ├── db.js
│   │   └── customer.model.js
│   └── routes/
│       └── customer.routes.js
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI workflow
├── .eslintrc.js              # ESLint configuration
├── .gitignore
├── customer.test.js          # Unit tests
├── package.json
├── server.js                 # Application entry point
└── README.md
```
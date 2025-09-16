# Node.js Express MySQL REST API

A RESTful CRUD API built with Node.js, Express, and MySQL.

## Features

- RESTful API endpoints for customer management
- MySQL database integration
- Express.js middleware support
- Automated testing and linting

## Setup

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

### Testing
Run tests:
```bash
npm test
```

Watch mode for development:
```bash
npm run test:watch
```

### Linting
Check code style:
```bash
npm run lint
```

Auto-fix linting issues:
```bash
npm run lint:fix
```

## CI/CD

This project uses GitHub Actions for continuous integration. On every pull request and push to the master branch:

- Code is linted using ESLint
- Unit tests are run using Jest
- Tests are run against multiple Node.js versions (16.x, 18.x, 20.x)
- MySQL service is available for integration tests

The CI pipeline will fail if:
- Linting errors are found
- Any tests fail
- Code coverage is below threshold

## API Endpoints

- `GET /user` - Get user data (middleware example)
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create a new customer
- `GET /api/customers/:id` - Get customer by ID
- `PUT /api/customers/:id` - Update customer by ID
- `DELETE /api/customers/:id` - Delete customer by ID

## Project Structure

```
├── app/
│   ├── config/          # Database configuration
│   ├── controllers/     # Route controllers
│   ├── models/          # Database models
│   └── routes/          # API routes
├── __tests__/           # Test files
├── .github/workflows/   # GitHub Actions CI
├── server.js            # Application entry point
└── package.json         # Dependencies and scripts
```
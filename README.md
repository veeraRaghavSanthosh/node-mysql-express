# Node MySQL Express

A Node.js web application built with Express.js and MySQL for database operations.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Testing](#testing)
- [API Endpoints](#api-endpoints)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Changelog](#changelog)

## Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 14.x or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MySQL](https://www.mysql.com/) (version 8.0 or higher)

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

3. **Set up environment variables**
   
   Create a `.env` file in the root directory and add the following variables:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=your_database_name
   DB_PORT=3306
   
   # Server Configuration
   PORT=3000
   NODE_ENV=development
   
   # JWT Secret (if using authentication)
   JWT_SECRET=your_jwt_secret_key
   ```

4. **Set up the database**
   
   Create a MySQL database:
   ```sql
   CREATE DATABASE your_database_name;
   ```
   
   If there are SQL migration files in the project, run them:
   ```bash
   # Example - adjust based on your project structure
   mysql -u your_username -p your_database_name < database/schema.sql
   ```

## Configuration

### Database Configuration

The application uses MySQL as the database. Make sure to:

1. Create a MySQL database
2. Update the `.env` file with your database credentials
3. Run any necessary database migrations or seed files

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DB_HOST` | MySQL host address | `localhost` |
| `DB_USER` | MySQL username | - |
| `DB_PASSWORD` | MySQL password | - |
| `DB_NAME` | Database name | - |
| `DB_PORT` | MySQL port | `3306` |
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `JWT_SECRET` | JWT secret key | - |

## Running the Application

### Development Mode

To run the application in development mode with auto-restart:

```bash
npm run dev
```

### Production Mode

To run the application in production mode:

```bash
npm start
```

### Using Docker (if available)

If the project includes Docker configuration:

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run individual containers
docker build -t node-mysql-express .
docker run -p 3000:3000 node-mysql-express
```

The application will be available at `http://localhost:3000`

## Testing

### Running Unit Tests

To run all unit tests:

```bash
npm test
```

### Running Tests with Coverage

To run tests with coverage report:

```bash
npm run test:coverage
```

### Running Specific Test Files

To run specific test files:

```bash
# Run tests for a specific module
npm test -- --grep "user"

# Run tests in a specific file
npm test tests/user.test.js
```

### Test Structure

Tests are typically organized as follows:
```
tests/
├── unit/           # Unit tests
├── integration/    # Integration tests
├── fixtures/       # Test data
└── helpers/        # Test utilities
```

### Writing Tests

This project uses testing frameworks like:
- **Mocha** or **Jest** for test runner
- **Chai** or built-in assertions for assertions
- **Supertest** for HTTP endpoint testing
- **Sinon** for mocking and stubbing

Example test structure:
```javascript
const request = require('supertest');
const app = require('../app');

describe('API Endpoints', () => {
  describe('GET /api/users', () => {
    it('should return all users', async () => {
      const response = await request(app)
        .get('/api/users')
        .expect(200);
      
      expect(response.body).to.be.an('array');
    });
  });
});
```

## API Endpoints

### Base URL
```
http://localhost:3000/api
```

### Common Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/users` | Get all users |
| `GET` | `/api/users/:id` | Get user by ID |
| `POST` | `/api/users` | Create new user |
| `PUT` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Delete user |

### Response Format

Successful responses:
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Project Structure

```
node-mysql-express/
├── config/                 # Configuration files
│   ├── database.js         # Database configuration
│   └── config.js          # App configuration
├── controllers/           # Route controllers
├── middleware/           # Custom middleware
├── models/               # Database models
├── routes/               # API routes
├── services/             # Business logic services
├── tests/                # Test files
│   ├── unit/             # Unit tests
│   └── integration/      # Integration tests
├── utils/                # Utility functions
├── database/             # Database migrations/seeds
├── public/               # Static files
├── .env.example          # Environment variables example
├── .gitignore           # Git ignore rules
├── app.js               # Express app setup
├── server.js            # Server entry point
├── package.json         # Dependencies and scripts
└── README.md            # Project documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow ESLint configuration for code style
- Write tests for new features
- Update documentation for API changes
- Use conventional commit messages

## Changelog

### [1.1.0] - 2025-09-16

#### Added
- Comprehensive README.md with installation instructions
- Detailed testing documentation and examples
- API endpoint documentation with request/response formats
- Environment configuration guide
- Docker support documentation
- Contributing guidelines

#### Improved
- Project structure documentation
- Development workflow instructions
- Error handling documentation

#### Fixed
- Missing installation prerequisites
- Incomplete environment variable documentation

### [1.0.0] - Initial Release
- Basic Node.js Express application
- MySQL database integration
- RESTful API endpoints
- Basic authentication (if implemented)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

If you encounter any issues or have questions, please:
1. Check the [Issues](https://github.com/veeraRaghavSanthosh/node-mysql-express/issues) page
2. Create a new issue with detailed information
3. Contact the maintainers

---

**Made with ❤️ using Node.js, Express, and MySQL**
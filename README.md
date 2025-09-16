# Node.js Express MySQL REST API

A RESTful CRUD API built with Node.js, Express.js, and MySQL for customer management.

## Project Structure

```
├── app/
│   ├── config/
│   │   └── db.config.js          # Database configuration
│   ├── controllers/
│   │   └── customer.controller.js # Customer business logic
│   ├── models/
│   │   ├── db.js                 # Database connection
│   │   └── customer.model.js     # Customer data model
│   └── routes/
│       └── customer.routes.js    # API routes definition
├── middleware.js                 # Custom middleware
├── package.json                  # Project dependencies and scripts
└── server.js                     # Main application entry point
```

## Prerequisites

Before running this application, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (version 12.x or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MySQL](https://www.mysql.com/) (version 5.7 or higher)

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

3. **Set up MySQL database:**
   - Start your MySQL server
   - Create a new database for the application:
     ```sql
     CREATE DATABASE nodejs_express_mysql;
     ```
   - Create a customers table:
     ```sql
     USE nodejs_express_mysql;
     CREATE TABLE customers (
       id INT AUTO_INCREMENT PRIMARY KEY,
       name VARCHAR(255) NOT NULL,
       email VARCHAR(255) UNIQUE NOT NULL,
       phone VARCHAR(20),
       address TEXT,
       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
     );
     ```

4. **Configure database connection:**
   - Update the database configuration in `app/config/db.config.js` with your MySQL credentials:
     ```javascript
     module.exports = {
       HOST: "localhost",
       USER: "your_mysql_username",
       PASSWORD: "your_mysql_password",
       DB: "nodejs_express_mysql",
       dialect: "mysql",
       pool: {
         max: 5,
         min: 0,
         acquire: 30000,
         idle: 10000
       }
     };
     ```

## Running the Application

### Development Mode

1. **Start the server:**
   ```bash
   node server.js
   ```

2. **The server will start on port 3000 (default). You should see:**
   ```
   Server is running on port 3000.
   ```

3. **Test the API:**
   Open your browser and navigate to `http://localhost:3000` or use a tool like Postman to test the endpoints.

### Production Mode

For production deployment, consider using a process manager like PM2:

1. **Install PM2 globally:**
   ```bash
   npm install -g pm2
   ```

2. **Start the application with PM2:**
   ```bash
   pm2 start server.js --name "nodejs-express-mysql"
   ```

3. **Save PM2 configuration:**
   ```bash
   pm2 save
   pm2 startup
   ```

## API Endpoints

The application provides the following REST API endpoints for customer management:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/:id` | Get customer by ID |
| POST | `/api/customers` | Create new customer |
| PUT | `/api/customers/:id` | Update customer by ID |
| DELETE | `/api/customers/:id` | Delete customer by ID |

### Example API Usage

**Create a new customer:**
```bash
curl -X POST http://localhost:3000/api/customers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+1234567890",
    "address": "123 Main St, City, State"
  }'
```

**Get all customers:**
```bash
curl http://localhost:3000/api/customers
```

**Get customer by ID:**
```bash
curl http://localhost:3000/api/customers/1
```

**Update customer:**
```bash
curl -X PUT http://localhost:3000/api/customers/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Smith",
    "email": "john.smith@example.com"
  }'
```

**Delete customer:**
```bash
curl -X DELETE http://localhost:3000/api/customers/1
```

## Testing

Currently, this project uses a basic test setup. To run tests:

```bash
npm test
```

**Note:** The current test script will show an error message as no tests are implemented yet. To add proper testing:

1. **Install testing dependencies:**
   ```bash
   npm install --save-dev jest supertest
   ```

2. **Update package.json test script:**
   ```json
   {
     "scripts": {
       "test": "jest",
       "test:watch": "jest --watch"
     }
   }
   ```

3. **Create test files in a `tests/` directory and write your test cases.**

### Manual Testing

You can manually test the API using:

- **Postman**: Import the API endpoints and test each CRUD operation
- **curl**: Use the command-line examples provided above
- **Browser**: For GET requests, you can test directly in the browser

## Environment Configuration

For different environments, consider creating environment-specific configuration files:

1. **Create a `.env` file in the root directory:**
   ```env
   NODE_ENV=development
   PORT=3000
   DB_HOST=localhost
   DB_USER=your_mysql_username
   DB_PASSWORD=your_mysql_password
   DB_NAME=nodejs_express_mysql
   ```

2. **Install dotenv package:**
   ```bash
   npm install dotenv
   ```

3. **Update your configuration files to use environment variables.**

## Troubleshooting

### Common Issues

1. **Database Connection Error:**
   - Verify MySQL is running
   - Check database credentials in `db.config.js`
   - Ensure the database exists

2. **Port Already in Use:**
   - Change the port in `server.js` or kill the process using the port:
     ```bash
     lsof -ti:3000 | xargs kill -9
     ```

3. **Module Not Found:**
   - Run `npm install` to ensure all dependencies are installed
   - Check for any missing packages in `package.json`

### Logs

Check the console output for detailed error messages and debugging information.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Dependencies

- **express**: Web application framework
- **mysql**: MySQL database driver
- **body-parser**: Parse incoming request bodies

## Author

**veera** - [veeraRaghavSanthosh](https://github.com/veeraRaghavSanthosh)

---

For more information or support, please open an issue on the GitHub repository.
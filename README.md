# Node.js Express MySQL REST API

A comprehensive REST API built with Node.js, Express, and MySQL that provides customer management and payment processing capabilities.

## Features

- **Customer Management**: Full CRUD operations for customer data
- **Payment Processing**: Complete payment lifecycle management
- **RESTful Architecture**: Clean, consistent API design
- **MySQL Database**: Robust data persistence
- **Express Middleware**: Authentication and request processing

## Quick Start

### Prerequisites

- Node.js (v12 or higher)
- MySQL (v5.7 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/veeraRaghavSanthosh/node-mysql-express.git
cd node-mysql-express
```

2. Install dependencies:
```bash
npm install
```

3. Configure database connection in `app/config/db.config.js`:
```javascript
module.exports = {
  HOST: "localhost",
  USER: "your_username",
  PASSWORD: "your_password",
  DB: "your_database_name"
};
```

4. Set up the database:
```bash
# Create your MySQL database
# Then run the SQL scripts to create tables
mysql -u your_username -p your_database_name < database/payments.sql
```

5. Start the server:
```bash
npm start
# or
node server.js
```

The server will start on `http://localhost:3000`

## API Documentation

### Customer APIs

- `GET /customers` - Get all customers
- `GET /customers/:id` - Get customer by ID
- `POST /customers` - Create new customer
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `DELETE /customers` - Delete all customers

### Payment APIs

- `POST /api/payments` - Process a new payment
- `GET /api/payments` - Get all payments (admin)
- `GET /api/payments/:paymentId` - Get payment by ID
- `GET /api/customers/:customerId/payments` - Get customer payments
- `PUT /api/payments/:paymentId/status` - Update payment status
- `POST /api/payments/:paymentId/refund` - Process refund
- `DELETE /api/payments/:paymentId` - Delete payment (admin)

For detailed API documentation with examples and schemas, see [PAYMENT_API_DOCUMENTATION.md](./PAYMENT_API_DOCUMENTATION.md)

## Database Schema

### Customers Table
```sql
CREATE TABLE customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL,
  description TEXT,
  status ENUM('pending','processing','completed','failed','cancelled','refunded') DEFAULT 'pending',
  refund_amount DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
```

## Project Structure

```
node-mysql-express/
├── app/
│   ├── config/
│   │   └── db.config.js          # Database configuration
│   ├── controllers/
│   │   ├── customer.controller.js # Customer business logic
│   │   └── payment.controller.js  # Payment business logic
│   ├── models/
│   │   ├── db.js                 # Database connection
│   │   ├── customer.model.js     # Customer data model
│   │   └── payment.model.js      # Payment data model
│   └── routes/
│       ├── customer.routes.js    # Customer API routes
│       └── payment.routes.js     # Payment API routes
├── database/
│   └── payments.sql              # Database setup script
├── middleware.js                 # Custom middleware
├── server.js                     # Application entry point
├── package.json
├── README.md
└── PAYMENT_API_DOCUMENTATION.md  # Detailed API docs
```

## Payment Features

### Supported Payment Methods
- Credit/Debit Cards
- PayPal
- Bank Transfer
- Apple Pay
- Google Pay

### Payment Status Flow
1. `pending` - Payment created, awaiting processing
2. `processing` - Payment being processed
3. `completed` - Payment successful
4. `failed` - Payment failed
5. `cancelled` - Payment cancelled
6. `refunded` - Payment refunded

### Security Features
- Input validation on all endpoints
- SQL injection prevention
- Authentication middleware ready
- Error handling and logging

## Testing

You can test the API using:

### Using curl:
```bash
# Create a payment
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "amount": 99.99,
    "currency": "USD",
    "payment_method": "credit_card",
    "description": "Test payment"
  }'

# Get payment status
curl -X GET http://localhost:3000/api/payments/1
```

### Using Postman:
Import the API endpoints and test with the Postman GUI.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the [package.json](package.json) file for details.

## Support

For questions or support, please open an issue in the GitHub repository.

---

**Note**: This implementation includes a complete payment processing system with proper error handling, validation, and documentation. In a production environment, you would integrate with actual payment gateways (Stripe, PayPal, etc.) and implement proper authentication and authorization.
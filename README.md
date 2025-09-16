# Node.js Express MySQL Reporting API

A RESTful API built with Node.js, Express, and MySQL that provides comprehensive reporting functionality with customer management capabilities.

## Features

- **Customer Management**: Full CRUD operations for customer data
- **Reporting System**: Generate, manage, and download various types of reports
- **Report Types**: Customer summary, customer activity, and system analytics reports
- **Real-time Status**: Track report generation progress
- **File Downloads**: Download generated reports in multiple formats (PDF, Excel, CSV)
- **Analytics**: Get insights into report usage and performance
- **Backward Compatibility**: Maintains compatibility across API versions

## Quick Start

### Prerequisites

- Node.js (v12 or higher)
- MySQL database
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

3. Configure database:
   - Update `app/config/db.config.js` with your MySQL credentials
   - Create the database and tables using the SQL script in `database/create_reports_table.sql`

4. Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000`.

### Database Setup

Run the following SQL script to create the reports table:

```sql
-- See database/create_reports_table.sql for the complete schema
CREATE TABLE IF NOT EXISTS `reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  -- ... other fields
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

## API Documentation

For complete API documentation with examples and schemas, see:
- **[Reporting API Documentation](./REPORTING_API_DOCUMENTATION.md)** - Comprehensive guide to all reporting endpoints

## API Endpoints

### Customer Management
- `GET /customers` - Get all customers
- `POST /customers` - Create new customer
- `GET /customers/:id` - Get customer by ID
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer

### Reporting APIs
- `POST /api/reports` - Generate new report
- `GET /api/reports` - Get all reports (with pagination)
- `GET /api/reports/:id` - Get report by ID
- `PUT /api/reports/:id` - Update report
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/:id/status` - Get report status
- `GET /api/reports/:id/download` - Download report file
- `POST /api/reports/:id/regenerate` - Regenerate report
- `GET /api/reports/types` - Get available report types
- `GET /api/reports/analytics` - Get reporting analytics

## Example Usage

### Generate a Customer Summary Report

```bash
curl -X POST "http://localhost:3000/api/reports" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Monthly Customer Report",
    "type": "customer_summary",
    "description": "Customer summary for September 2025",
    "parameters": {
      "start_date": "2025-09-01",
      "end_date": "2025-09-30",
      "include_charts": true,
      "format": "PDF"
    },
    "generated_by": "admin"
  }'
```

### Check Report Status

```bash
curl -X GET "http://localhost:3000/api/reports/1/status"
```

### Download Report

```bash
curl -X GET "http://localhost:3000/api/reports/1/download" --output "report.pdf"
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "message": "Success message",
  "data": {},
  "timestamp": "2025-09-16T10:30:00.000Z",
  "version": "1.0.0"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description"
  },
  "timestamp": "2025-09-16T10:30:00.000Z",
  "version": "1.0.0"
}
```

## Report Types

1. **Customer Summary** (`customer_summary`)
   - Comprehensive customer analytics and summaries
   - Required: start_date, end_date
   - Optional: include_charts, format, status_filter

2. **Customer Activity** (`customer_activity`)
   - Customer activity and engagement analytics
   - Required: date_range
   - Optional: customer_ids, activity_type, format

3. **System Analytics** (`system_analytics`)
   - System usage and performance analytics
   - Required: period
   - Optional: metrics, format

## Development

### Project Structure

```
├── app/
│   ├── config/
│   │   └── db.config.js          # Database configuration
│   ├── controllers/
│   │   ├── customer.controller.js # Customer CRUD operations
│   │   └── reporting.controller.js # Reporting operations
│   ├── models/
│   │   ├── db.js                 # Database connection
│   │   ├── customer.model.js     # Customer model
│   │   └── reporting.model.js    # Reporting model
│   └── routes/
│       ├── customer.routes.js    # Customer routes
│       └── reporting.routes.js   # Reporting routes
├── database/
│   └── create_reports_table.sql  # Database schema
├── server.js                     # Main server file
├── package.json
└── README.md
```

### Adding New Report Types

1. Update the `Report.getTypes()` method in `app/models/reporting.model.js`
2. Add handling logic in the report generation process
3. Update the documentation

### Testing

```bash
# Install testing dependencies
npm install --save-dev jest supertest

# Run tests
npm test
```

## Deployment

### Environment Variables

Set the following environment variables in production:

```bash
PORT=3000
DB_HOST=your-database-host
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
```

### Production Considerations

1. **Security**: Implement proper authentication and authorization
2. **Rate Limiting**: Configure rate limiting for production use
3. **File Storage**: Use cloud storage for report files in production
4. **Monitoring**: Add logging and monitoring for report generation
5. **Scaling**: Consider using job queues for long-running report generation

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

ISC License

## Support

For questions or issues:
- Create an issue in the GitHub repository
- Check the API documentation for usage examples
- Review the code comments for implementation details

---

**Version**: 1.0.0  
**Node.js**: v12+  
**Database**: MySQL 5.7+
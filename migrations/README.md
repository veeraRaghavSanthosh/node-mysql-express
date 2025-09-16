# Database Migrations

This directory contains database migrations for the Node.js MySQL Express application.

## Overview

The migration system provides a structured way to manage database schema changes while maintaining backward compatibility. It includes:

1. **Migration Runner**: Automated system to execute migrations in order
2. **Migration Tracking**: Database table to track executed migrations
3. **Rollback Support**: Each migration includes rollback functionality

## Migration Files

### 001_create_orders_table.js
Creates the initial `orders` table with the following structure:
- `id` (Primary Key)
- `customer_id` (Foreign Key reference)
- `order_number` (Unique identifier)
- `total_amount` (Decimal for currency)
- `status` (Enum: pending, processing, shipped, delivered, cancelled)
- `order_date` (Timestamp)
- `updated_at` (Auto-updating timestamp)

### 002_add_legacy_id_to_orders.js
Adds `legacy_id` column to the orders table with:
- **Column Addition**: Adds nullable `legacy_id` VARCHAR(100) column
- **Indexing**: Creates performance index on `legacy_id`
- **Backfill Logic**: Automatically populates existing rows with pattern `LEGACY_<order_number>_<id>`
- **Unique Constraint**: Ensures `legacy_id` uniqueness after backfill
- **Backward Compatibility**: Column is nullable to support existing code

## Running Migrations

### Command Line
```bash
npm run migrate
```

### Programmatically
```javascript
const MigrationRunner = require('./migrations/migration-runner');
const runner = new MigrationRunner();

runner.runMigrations()
  .then(() => console.log('Migrations completed'))
  .catch(err => console.error('Migration failed:', err))
  .finally(() => runner.close());
```

## Backward Compatibility Features

### 1. Nullable Column Design
- The `legacy_id` column is initially nullable
- Existing code continues to work without modification
- New code can optionally use the `legacy_id` field

### 2. Automatic Legacy ID Generation
- Existing orders get auto-generated `legacy_id` values
- Pattern: `LEGACY_<order_number>_<id>` ensures uniqueness
- New orders can provide custom `legacy_id` or get auto-generated ones

### 3. Dual Access Methods
The Order model supports finding records by:
- Primary key: `Order.findById(id)`
- Legacy ID: `Order.findByLegacyId(legacyId)`
- Order number: `Order.findByOrderNumber(orderNumber)`

### 4. API Endpoints
```
GET /api/orders/:orderId          # Find by primary key
GET /api/orders/legacy/:legacyId  # Find by legacy_id (backward compatibility)
```

## Migration Safety Features

### 1. Transaction Safety
Each migration runs as a single unit with proper error handling

### 2. Rollback Support
Every migration includes a `down` function for rollback:
```bash
# To rollback (manual process)
# Implement rollback runner if needed
```

### 3. Idempotent Operations
- Uses `IF NOT EXISTS` and `IF EXISTS` clauses
- Safe to re-run migrations
- Handles partial execution scenarios

### 4. Performance Considerations
- Adds indexes for query performance
- Uses appropriate data types and constraints
- Minimizes table locks during migration

## Migration Process Flow

1. **Initialize**: Creates `migrations` tracking table if not exists
2. **Check Status**: Queries executed migrations from database
3. **Find Pending**: Compares file system with executed migrations
4. **Execute**: Runs pending migrations in alphabetical order
5. **Track**: Records successful migrations in tracking table

## Error Handling

- **Connection Errors**: Proper database connection error handling
- **Migration Errors**: Detailed error logging with migration context
- **Partial Failures**: Failed migrations don't get marked as executed
- **Rollback on Error**: Individual migration failures don't affect others

## Best Practices

1. **Naming Convention**: Use `XXX_descriptive_name.js` format
2. **Incremental Changes**: Keep migrations small and focused
3. **Test Migrations**: Test both `up` and `down` functions
4. **Backup Data**: Always backup before running migrations in production
5. **Version Control**: Commit migrations with related code changes

## Production Deployment

1. **Backup Database**: Always backup before migrations
2. **Run Migrations**: Execute `npm run migrate` during deployment
3. **Verify Results**: Check migration tracking table and data integrity
4. **Monitor Performance**: Watch for any performance impacts

## Troubleshooting

### Common Issues

1. **Connection Timeout**: Increase MySQL timeout settings
2. **Duplicate Key Errors**: Check for existing data conflicts
3. **Permission Errors**: Ensure database user has ALTER privileges
4. **Large Table Migrations**: Consider batching for very large tables

### Recovery Steps

1. Check `migrations` table for execution status
2. Review error logs for specific failure points
3. Manual cleanup may be required for partial failures
4. Re-run migrations after fixing issues

## Future Enhancements

- Migration rollback runner
- Migration status reporting
- Batch processing for large datasets
- Migration performance monitoring
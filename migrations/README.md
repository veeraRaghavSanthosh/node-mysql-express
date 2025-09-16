# Database Migrations

This directory contains database migration files for the Node.js Express MySQL application.

## Migration System Overview

The migration system automatically tracks which migrations have been executed and runs only new migrations. It creates a `migrations` table in your database to keep track of executed migrations.

## Files Structure

- `migration-runner.js` - The main migration runner script
- `*.sql` - Migration files (executed in alphabetical order)
- `*.rollback.sql` - Rollback scripts for corresponding migrations

## Running Migrations

### Execute all pending migrations:
```bash
npm run migrate
```

### Rollback the last migration:
```bash
npm run migrate:rollback
```

### Manual execution:
```bash
node migrations/migration-runner.js
node migrations/migration-runner.js rollback
```

## Migration Files

### 001_create_orders_table_with_legacy_id.sql
Creates the `orders` table with the `legacy_id` column included from the start. This migration:
- Creates the orders table with all necessary columns including `legacy_id`
- Adds appropriate indexes for performance
- Creates a trigger to auto-generate `legacy_id` values when not provided
- Includes sample data for testing
- Maintains backward compatibility

### 002_add_legacy_id_to_existing_orders.sql
Handles the scenario where an `orders` table already exists without the `legacy_id` column. This migration:
- Checks if the orders table exists and if `legacy_id` column is missing
- Adds the `legacy_id` column if needed
- Backfills existing orders with generated `legacy_id` values
- Creates/updates the auto-generation trigger
- Is safe to run even if the column already exists

## Backward Compatibility Features

1. **Auto-generation**: When inserting new orders without specifying `legacy_id`, the system automatically generates one
2. **Dual access**: Orders can be accessed by both `id` and `legacy_id`
3. **Safe migrations**: Migrations check for existing tables/columns before making changes
4. **Rollback support**: Each migration has a corresponding rollback script

## Legacy ID Format

- Auto-generated format: `ORD_YYYYMMDD_XXXXXX` (e.g., `ORD_20231215_000123`)
- Backfilled format: `LEGACY_XXXXXX` (e.g., `LEGACY_000001`)
- Custom format: Any string up to 255 characters

## Order Model Methods

The Order model includes methods for both new and legacy access patterns:

- `Order.findById(id)` - Find by primary key
- `Order.findByLegacyId(legacyId)` - Find by legacy identifier
- `Order.updateById(id, order)` - Update by primary key  
- `Order.updateByLegacyId(legacyId, order)` - Update by legacy identifier
- `Order.removeByLegacyId(legacyId)` - Delete by legacy identifier

## Database Schema

```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  legacy_id VARCHAR(255) NULL COMMENT 'Legacy system order identifier for backward compatibility',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_customer_id (customer_id),
  INDEX idx_order_date (order_date),
  INDEX idx_status (status),
  INDEX idx_legacy_id (legacy_id),
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);
```

## Error Handling

The migration system includes comprehensive error handling:
- Database connection errors
- SQL execution errors  
- File system errors
- Transaction rollback on failures

## Best Practices

1. Always test migrations on a copy of production data first
2. Backup your database before running migrations
3. Keep migration files small and focused
4. Include both up and down migration scripts
5. Use descriptive names for migration files with timestamps/sequence numbers
6. Test rollback scripts as thoroughly as forward migrations

## Troubleshooting

If a migration fails:
1. Check the error message in the console
2. Verify database connectivity and permissions
3. Ensure the migration SQL is valid
4. Check for conflicting schema changes
5. Use the rollback feature if needed to return to a known good state
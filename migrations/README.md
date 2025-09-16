# Database Migrations

This directory contains database migrations for the Node.js Express MySQL application.

## Overview

The migration system provides a structured way to manage database schema changes with the following features:

- **Version Control**: Track which migrations have been executed
- **Rollback Support**: Ability to rollback migrations if needed
- **Atomic Operations**: Each migration runs in a transaction
- **Backward Compatibility**: Migrations are designed to maintain compatibility

## Migration Files

### 001_add_legacy_id_to_orders.js

This migration adds a `legacy_id` column to the `orders` table with the following features:

- **Purpose**: Adds backward compatibility support for existing order references
- **Column Type**: `VARCHAR(50)` (nullable for backward compatibility)
- **Backfill**: Automatically generates legacy IDs for existing orders using format `LEGACY_XXXXXX`
- **Index**: Adds performance index on the `legacy_id` column
- **Rollback**: Can be safely rolled back, removing the column and index

## Usage

### Running Migrations

```bash
# Run all pending migrations
npm run migrate

# Or use the migration runner directly
node migrations/migrate.js up
```

### Rolling Back Migrations

```bash
# Rollback the last migration
npm run migrate:rollback

# Or use the migration runner directly
node migrations/migrate.js down
```

### Checking Migration Status

```bash
# Check which migrations have been run
npm run migrate:status

# Or use the migration runner directly
node migrations/migrate.js status
```

### Running Specific Migration

```bash
# Run only the legacy_id migration
npm run migrate:legacy-id

# Or run directly
node migrations/001_add_legacy_id_to_orders.js up
```

## Migration Structure

Each migration file should export:

```javascript
module.exports = {
  up: async () => {
    // Migration logic here
  },
  down: async () => {
    // Rollback logic here
  },
  description: "Brief description of what this migration does"
};
```

## Backward Compatibility

The `legacy_id` column is designed with backward compatibility in mind:

1. **Nullable Column**: The column is nullable, so existing code continues to work
2. **Automatic Generation**: New orders automatically get a legacy_id
3. **Flexible Lookup**: The Order model supports finding orders by either regular ID or legacy_id
4. **API Compatibility**: All existing API endpoints continue to work unchanged

## Order Model Usage

The Order model now supports both regular IDs and legacy IDs:

```javascript
// Find by regular ID
Order.findById(123, callback);

// Find by legacy ID (automatically detected)
Order.findById("LEGACY_000123", callback);

// Find by legacy ID explicitly
Order.findByLegacyId("LEGACY_000123", callback);
```

## API Endpoints

All order endpoints support both ID formats:

```bash
# Using regular ID
GET /api/orders/123
PUT /api/orders/123
DELETE /api/orders/123

# Using legacy ID (automatically detected)
GET /api/orders/LEGACY_000123
PUT /api/orders/LEGACY_000123
DELETE /api/orders/LEGACY_000123

# Explicit legacy ID endpoint
GET /api/orders/legacy/LEGACY_000123
```

## Safety Features

1. **Transaction Support**: All migrations run in database transactions
2. **Idempotent**: Migrations can be run multiple times safely
3. **Validation**: Checks for existing columns/indexes before making changes
4. **Error Handling**: Proper error handling with rollback on failure
5. **Logging**: Detailed logging of migration progress

## Troubleshooting

### Migration Fails

If a migration fails:

1. Check the error message in the console
2. Verify database connection settings in `app/config/db.config.js`
3. Ensure the database user has sufficient privileges
4. Check if the migration was partially applied and needs manual cleanup

### Rollback Issues

If rollback fails:

1. Check if dependent data exists that prevents column removal
2. Manually remove data if safe to do so
3. Consider creating a new migration instead of rolling back

### Performance Considerations

The migration includes an index on `legacy_id` for performance. If you have a large number of orders, the migration might take some time to complete due to:

1. Column addition
2. Backfill of existing records
3. Index creation

Monitor the migration progress and ensure sufficient database resources during execution.
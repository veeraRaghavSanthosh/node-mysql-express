# Database Migration System

This project now includes a simple database migration system for managing schema changes.

## Files Added

1. **`migrations/20250916000001_add_legacy_id_to_orders.js`** - Migration to add `legacy_id` column to orders table
2. **`migrate.js`** - Migration runner script
3. **`README_MIGRATION.md`** - This documentation

## Migration: Add legacy_id to orders

### What it does:
1. **Adds a new column**: `legacy_id VARCHAR(50)` to the `orders` table
2. **Backfills existing data**: Updates all existing rows with a computed `legacy_id` using the pattern `LEGACY_` + zero-padded ID (e.g., `LEGACY_00000001`)
3. **Creates an index**: Adds `idx_orders_legacy_id` for better query performance
4. **Provides rollback**: Can be reversed to remove the column and index

### Why these changes:
- **legacy_id column**: Provides a way to reference orders using legacy identifiers, useful for data migration or integration with legacy systems
- **Backfill logic**: Ensures existing orders have legacy IDs without manual intervention
- **Index creation**: Optimizes queries that filter or join on the legacy_id field
- **Rollback capability**: Allows safe reversal of the migration if needed

## Usage

### Run the migration:
```bash
# Run all pending migrations
node migrate.js up

# Or run the specific migration directly
node migrations/20250916000001_add_legacy_id_to_orders.js up
```

### Rollback the migration:
```bash
# Rollback the last migration
node migrate.js down

# Or rollback the specific migration directly
node migrations/20250916000001_add_legacy_id_to_orders.js down
```

### List migration status:
```bash
node migrate.js list
```

## Database Configuration

The migration uses these environment variables (with fallbacks):
- `DB_HOST` (default: 'localhost')
- `DB_USER` (default: 'root')
- `DB_PASSWORD` (default: '')
- `DB_NAME` (default: 'testdb')

Set these environment variables before running migrations:
```bash
export DB_HOST=your-db-host
export DB_USER=your-db-user
export DB_PASSWORD=your-db-password
export DB_NAME=your-db-name
```

## Migration Naming Convention

Migration files follow the pattern: `YYYYMMDDHHMMSS_description.js`
- `20250916000001` - Timestamp (2025-09-16 00:00:01)
- `add_legacy_id_to_orders` - Descriptive name

## Safety Features

1. **Transactional**: Each migration runs in sequence
2. **Tracking**: Executed migrations are tracked in `schema_migrations` table
3. **Rollback**: Each migration includes a `down` function for reversal
4. **Error handling**: Detailed error messages and graceful failure handling
5. **Idempotent**: Safe to run multiple times (won't duplicate changes)

## Example Result

After running the migration, your `orders` table will have:
```sql
-- New column added
ALTER TABLE orders ADD COLUMN legacy_id VARCHAR(50) NULL;

-- Existing data backfilled
UPDATE orders SET legacy_id = 'LEGACY_00000001' WHERE id = 1;
UPDATE orders SET legacy_id = 'LEGACY_00000002' WHERE id = 2;
-- ... etc for all existing rows

-- Index created for performance
CREATE INDEX idx_orders_legacy_id ON orders(legacy_id);
```
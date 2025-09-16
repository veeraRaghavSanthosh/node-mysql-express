# Database Migrations

This directory contains database migrations for the Node.js Express MySQL application.

## Overview

The migration system provides a structured way to manage database schema changes, ensuring consistency across different environments and enabling easy rollbacks when needed.

## Migration Files

- `migration-runner.js` - Core migration runner that executes and tracks migrations
- `001_create_orders_table.js` - Creates the initial orders table with sample data
- `002_add_legacy_id_to_orders.js` - Adds legacy_id column to orders table with backfill

## Usage

### Running Migrations

```bash
# Run all pending migrations
npm run migrate:up

# Or directly with node
node migrations/migration-runner.js up
```

### Rolling Back Migrations

```bash
# Rollback the last migration
npm run migrate:down

# Rollback multiple migrations (e.g., last 2)
npm run migrate:down 2

# Or directly with node
node migrations/migration-runner.js down 2
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only migration tests
npm test -- --testPathPattern=migrations
```

## Migration Structure

Each migration file should export an object with `up` and `down` methods:

```javascript
module.exports = {
  async up(migrationRunner) {
    // Forward migration logic
    await migrationRunner.query('ALTER TABLE...');
  },

  async down(migrationRunner) {
    // Rollback migration logic (optional)
    await migrationRunner.query('ALTER TABLE...');
  }
};
```

## Migration Naming Convention

Migration files should follow the naming pattern:
`{sequence_number}_{descriptive_name}.js`

Example: `002_add_legacy_id_to_orders.js`

## Legacy ID Format

The `legacy_id` column uses the following format:
`LEGACY_YYYYMMDD_XXXXXX`

Where:
- `LEGACY_` - Fixed prefix
- `YYYYMMDD` - Order date in ISO format (e.g., 20250916)
- `XXXXXX` - Order ID zero-padded to 6 digits (e.g., 000001)

Example: `LEGACY_20250916_000123`

## Database Schema Tracking

The migration system automatically creates a `migrations` table to track executed migrations:

```sql
CREATE TABLE migrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL UNIQUE,
  executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Best Practices

1. **Always test migrations** - Run tests before applying to production
2. **Backup before migrations** - Always backup your database before running migrations
3. **Write rollback logic** - Include `down` methods for easy rollbacks
4. **Incremental changes** - Keep migrations small and focused on single changes
5. **Verify backfills** - Test data migration logic thoroughly
6. **Use transactions** - For complex migrations, consider wrapping in transactions

## Troubleshooting

### Migration Fails
1. Check database connection settings in `app/config/db.config.js`
2. Ensure database user has necessary permissions
3. Review migration logs for specific error messages
4. Consider rolling back and fixing the migration

### Backfill Issues
1. Verify existing data integrity before running migrations
2. Test backfill logic with sample data
3. Monitor migration progress for large datasets
4. Consider running backfills in batches for performance

## Development

When adding new migrations:

1. Create a new migration file with incremented sequence number
2. Implement both `up` and `down` methods
3. Add comprehensive unit tests
4. Update the changelog
5. Test locally before deploying
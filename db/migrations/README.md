# Database Migrations

This directory contains database migration files for the Node.js MySQL Express application.

## Recent Migrations

### 20250916_add_legacy_id_to_orders.js
**Purpose**: Adds `legacy_id` column to orders table for backward compatibility

**Changes**:
- Adds `legacy_id VARCHAR(50) NULL` column to `orders` table
- Backfills existing orders with generated legacy IDs (format: `ORD-{id}-{timestamp}`)
- Includes rollback functionality

**Usage**:
```bash
# Run the migration
node scripts/run-migration.js up 20250916_add_legacy_id_to_orders

# Rollback the migration
node scripts/run-migration.js down 20250916_add_legacy_id_to_orders
```

**Testing**:
```bash
# Run unit tests for this migration
npm test test/migrations/20250916_add_legacy_id_to_orders.test.js
```

## Migration Guidelines

1. **File Naming**: Use format `YYYYMMDD_description.js`
2. **Structure**: Each migration must export `up` and `down` functions
3. **Logging**: Include console.log statements for progress tracking
4. **Error Handling**: Wrap operations in try-catch blocks
5. **Testing**: Create corresponding test files in `test/migrations/`

## Environment Variables

- `DB_HOST`: Database host (default: localhost)
- `DB_USER`: Database username (default: root)
- `DB_PASSWORD`: Database password (default: empty)
- `DB_NAME`: Database name (default: myapp)
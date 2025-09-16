# Database Migrations - Add Legacy ID to Orders

This directory contains the migration to add a `legacy_id` column to the `orders` table with backward compatibility support.

## Overview

The migration adds a `legacy_id` column to the existing `orders` table and backfills all existing rows with generated legacy IDs while maintaining full backward compatibility.

## Files

- `add_legacy_id_to_orders.js` - Main migration file
- `migration-runner.js` - Migration execution utility
- `db-config.js` - Database configuration
- `test-migration.js` - Migration testing script
- `.env.example` - Environment configuration template

## Features

### Migration Features
- ✅ Adds `legacy_id` VARCHAR(50) column as nullable
- ✅ Creates index on `legacy_id` for performance
- ✅ Backfills existing orders with generated legacy IDs
- ✅ Adds unique constraint to prevent duplicates
- ✅ Full rollback support
- ✅ Batch processing for large datasets
- ✅ Transaction safety

### Backward Compatibility
- ✅ Column is nullable - existing code continues to work
- ✅ No breaking changes to existing queries
- ✅ New records can be inserted without `legacy_id`
- ✅ Gradual adoption possible

## Setup

1. **Install Dependencies**
   ```bash
   npm install mysql2 dotenv
   ```

2. **Configure Database**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Verify Database Connection**
   ```bash
   node -e "require('./migrations/db-config').validateConfig(); console.log('✓ Configuration valid')"
   ```

## Usage

### Running the Migration

```bash
# Run all pending migrations
node migrations/migration-runner.js up

# Run specific migration
node migrations/migration-runner.js run add_legacy_id_to_orders.js

# Check migration status
node migrations/migration-runner.js status
```

### Rolling Back

```bash
# Rollback last migration
node migrations/migration-runner.js down

# Rollback specific migration
node migrations/migration-runner.js rollback add_legacy_id_to_orders.js
```

### Testing

```bash
# Run migration tests
node migrations/test-migration.js
```

## Migration Details

### What the Migration Does

1. **Adds Column**: Creates `legacy_id VARCHAR(50) NULL` column
2. **Creates Index**: Adds `idx_orders_legacy_id` for query performance
3. **Backfills Data**: Generates legacy IDs for existing orders using format `LEGACY_XXXXXXXX`
4. **Adds Constraint**: Creates unique constraint `uk_orders_legacy_id`

### Legacy ID Format

Generated legacy IDs follow the pattern: `LEGACY_XXXXXXXX`
- Prefix: `LEGACY_`
- Suffix: Original order ID padded to 8 digits with leading zeros
- Example: Order ID 123 becomes `LEGACY_00000123`

### Batch Processing

The migration processes existing orders in batches of 1000 to:
- Avoid memory issues with large datasets
- Provide progress feedback
- Allow for interruption and resumption

## Database Schema Changes

### Before Migration
```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### After Migration
```sql
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  legacy_id VARCHAR(50) NULL COMMENT 'Legacy identifier for backward compatibility',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  UNIQUE KEY uk_orders_legacy_id (legacy_id),
  KEY idx_orders_legacy_id (legacy_id)
);
```

## Error Handling

The migration includes comprehensive error handling:

- **Transaction Safety**: All operations wrapped in transactions
- **Rollback Support**: Automatic rollback on failure
- **Batch Processing**: Handles large datasets efficiently
- **Detailed Logging**: Progress and error reporting
- **Constraint Validation**: Ensures data integrity

## Performance Considerations

- **Indexing**: Adds index on `legacy_id` for fast lookups
- **Batch Processing**: Processes 1000 records at a time
- **Memory Efficient**: Avoids loading all data into memory
- **Transaction Batching**: Commits in batches for better performance

## Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify database credentials in `.env`
   - Ensure MySQL server is running
   - Check network connectivity

2. **Permission Errors**
   - Ensure database user has ALTER, CREATE, INSERT, UPDATE privileges
   - Verify user can create indexes and constraints

3. **Large Dataset Issues**
   - Monitor migration progress logs
   - Increase batch size if needed (modify `batchSize` variable)
   - Consider running during low-traffic periods

### Recovery

If migration fails midway:
1. Check the error logs
2. Fix the underlying issue
3. Re-run the migration (it will skip already processed records)
4. Or rollback and start fresh

## Integration with Application

### Using Legacy IDs in Code

```javascript
// Find order by legacy ID
const order = await connection.execute(
  'SELECT * FROM orders WHERE legacy_id = ?',
  [legacyId]
);

// Create new order with legacy ID
await connection.execute(`
  INSERT INTO orders (customer_id, total_amount, status, legacy_id) 
  VALUES (?, ?, ?, ?)
`, [customerId, amount, status, legacyId]);

// Update existing order's legacy ID
await connection.execute(`
  UPDATE orders SET legacy_id = ? WHERE id = ?
`, [legacyId, orderId]);
```

### Gradual Migration Strategy

1. **Phase 1**: Run migration to add column and backfill
2. **Phase 2**: Update application code to use legacy IDs where needed
3. **Phase 3**: Gradually migrate external systems to use new IDs
4. **Phase 4**: Eventually phase out legacy ID usage (optional)

## Monitoring

Monitor the migration with these queries:

```sql
-- Check migration progress
SELECT COUNT(*) as total_orders, 
       COUNT(legacy_id) as orders_with_legacy_id,
       COUNT(*) - COUNT(legacy_id) as orders_without_legacy_id
FROM orders;

-- Verify unique constraint
SELECT legacy_id, COUNT(*) as count 
FROM orders 
WHERE legacy_id IS NOT NULL 
GROUP BY legacy_id 
HAVING COUNT(*) > 1;

-- Check index usage
EXPLAIN SELECT * FROM orders WHERE legacy_id = 'LEGACY_00000123';
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review migration logs for detailed error information
3. Run the test script to verify migration integrity
4. Consult the MySQL documentation for database-specific issues
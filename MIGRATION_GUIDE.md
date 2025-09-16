# Migration Guide: Adding legacy_id to Orders Table

This guide explains how to use the migration system to add a `legacy_id` column to the `orders` table while maintaining backward compatibility.

## Overview

The migration adds a `legacy_id` column to the `orders` table with the following features:

- **Backward Compatibility**: Existing code continues to work without changes
- **Automatic Backfill**: Existing orders get a legacy_id automatically
- **Flexible Lookup**: Orders can be found by either regular ID or legacy_id
- **Performance Optimized**: Includes database index for fast lookups
- **Rollback Support**: Can be safely rolled back if needed

## Quick Start

### 1. Run the Migration

```bash
# Option 1: Run all pending migrations (recommended)
npm run migrate

# Option 2: Run specific legacy_id migration only
npm run migrate:legacy-id

# Option 3: Run migration directly
node migrations/001_add_legacy_id_to_orders.js up
```

### 2. Verify Migration

```bash
# Check migration status
npm run migrate:status

# Run test script to verify everything works
node test_migration.js
```

### 3. Start Using the New Features

The migration is designed to be transparent. Your existing code will continue to work, and you can optionally use the new legacy_id features.

## Migration Details

### What the Migration Does

1. **Creates orders table** if it doesn't exist (for new installations)
2. **Adds legacy_id column** (`VARCHAR(50)`, nullable)
3. **Backfills existing orders** with legacy_id format: `LEGACY_XXXXXX`
4. **Creates performance index** on the legacy_id column
5. **Records migration** in the migrations tracking table

### Database Schema Changes

```sql
-- Column added
ALTER TABLE orders 
ADD COLUMN legacy_id VARCHAR(50) NULL 
COMMENT 'Legacy identifier for backward compatibility';

-- Index added for performance
CREATE INDEX idx_orders_legacy_id ON orders(legacy_id);
```

### Backfill Logic

Existing orders receive a legacy_id in the format:
- `LEGACY_000001` for order ID 1
- `LEGACY_000123` for order ID 123
- etc.

## API Usage

### Backward Compatible Endpoints

All existing endpoints continue to work exactly as before:

```bash
# Create order (legacy_id generated automatically)
POST /api/orders
{
  "customer_id": 1,
  "total_amount": 99.99,
  "status": "pending"
}

# Get order by regular ID (still works)
GET /api/orders/123

# Update order by regular ID (still works)
PUT /api/orders/123

# Delete order by regular ID (still works)
DELETE /api/orders/123
```

### New Legacy ID Support

The same endpoints now also accept legacy IDs:

```bash
# Get order by legacy_id (automatically detected)
GET /api/orders/LEGACY_000123

# Update order by legacy_id (automatically detected)
PUT /api/orders/LEGACY_000123

# Delete order by legacy_id (automatically detected)
DELETE /api/orders/LEGACY_000123

# Explicit legacy_id endpoint
GET /api/orders/legacy/LEGACY_000123
```

### Creating Orders with Custom Legacy IDs

```bash
POST /api/orders
{
  "customer_id": 1,
  "total_amount": 99.99,
  "status": "pending",
  "legacy_id": "CUSTOM_ORDER_001"  # Optional
}
```

## Code Examples

### Using the Order Model

```javascript
const Order = require("./app/models/order.model.js");

// Create order (legacy_id generated automatically)
Order.create({
  customer_id: 1,
  total_amount: 99.99,
  status: 'pending'
}, (err, order) => {
  console.log("Created order:", order);
  // order.legacy_id will be automatically generated
});

// Find by regular ID
Order.findById(123, (err, order) => {
  console.log("Found by ID:", order);
});

// Find by legacy ID (same method, automatically detected)
Order.findById("LEGACY_000123", (err, order) => {
  console.log("Found by legacy ID:", order);
});

// Find by legacy ID explicitly
Order.findByLegacyId("LEGACY_000123", (err, order) => {
  console.log("Found by legacy ID:", order);
});
```

### Integration with Existing Code

Your existing code requires **no changes**:

```javascript
// This code continues to work exactly as before
Order.findById(orderId, (err, order) => {
  if (err) {
    // Handle error
  } else {
    // Process order - now includes legacy_id field
    console.log("Order:", order);
    console.log("Legacy ID:", order.legacy_id); // New field available
  }
});
```

## Rollback Instructions

If you need to rollback the migration:

```bash
# Rollback the last migration
npm run migrate:rollback

# Or rollback specific migration
node migrations/001_add_legacy_id_to_orders.js down
```

**Warning**: Rolling back will permanently delete the `legacy_id` column and all its data.

## Testing

### Automated Testing

```bash
# Run the test script
node test_migration.js
```

This will verify:
- Column and index creation
- Backfill functionality
- Lookup by both ID types
- Update operations
- Backward compatibility

### Manual Testing

1. **Check database structure**:
   ```sql
   DESCRIBE orders;
   SHOW INDEX FROM orders;
   ```

2. **Verify backfill**:
   ```sql
   SELECT id, legacy_id FROM orders WHERE legacy_id IS NOT NULL;
   ```

3. **Test API endpoints**:
   ```bash
   # Test regular ID
   curl http://localhost:3000/api/orders/1
   
   # Test legacy ID
   curl http://localhost:3000/api/orders/LEGACY_000001
   ```

## Performance Considerations

- **Index**: The migration creates an index on `legacy_id` for optimal performance
- **Storage**: Each legacy_id adds ~50 bytes per order
- **Migration Time**: For large tables, the migration may take several minutes due to:
  - Column addition
  - Backfill operations
  - Index creation

## Troubleshooting

### Common Issues

1. **Migration fails with "Column already exists"**
   - The migration is idempotent and checks for existing columns
   - If this error occurs, check the migration logs

2. **Performance issues after migration**
   - Ensure the index was created: `SHOW INDEX FROM orders;`
   - Consider running `ANALYZE TABLE orders;` to update statistics

3. **Legacy IDs not generated**
   - Check if the backfill completed successfully
   - Verify orders exist before running migration

### Getting Help

1. Check migration logs for detailed error messages
2. Verify database connection and permissions
3. Run `npm run migrate:status` to check current state
4. Use the test script to isolate issues

## Best Practices

1. **Backup First**: Always backup your database before running migrations
2. **Test in Development**: Run migrations in a development environment first
3. **Monitor Performance**: Watch database performance during and after migration
4. **Gradual Adoption**: You can gradually adopt legacy_id features without breaking existing code
5. **Documentation**: Update your API documentation to mention legacy_id support

## Migration System Features

This project now includes a complete migration system:

- **Version Control**: Tracks which migrations have been executed
- **Atomic Operations**: Each migration runs in a transaction
- **Rollback Support**: Safe rollback of migrations
- **Idempotent**: Migrations can be run multiple times safely
- **Logging**: Detailed progress and error logging

For more details, see `migrations/README.md`.
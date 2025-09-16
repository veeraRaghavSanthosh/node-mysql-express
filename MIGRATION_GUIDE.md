# Migration Guide: Adding legacy_id to Orders Table

This guide explains the database migration system implemented to add a `legacy_id` column to the `orders` table while maintaining backward compatibility.

## Overview

The migration adds a `legacy_id` column to the orders table and automatically backfills existing rows with generated legacy IDs. The implementation ensures:

- **Zero Downtime**: Existing code continues to work without modification
- **Backward Compatibility**: Column is nullable and optional
- **Data Integrity**: Unique constraints and proper indexing
- **Performance**: Optimized queries with appropriate indexes

## Quick Start

### 1. Run Migrations
```bash
npm run migrate
```

### 2. (Optional) Seed Sample Data
```bash
npm run seed
```

### 3. Test the API
```bash
# Start the server
node server.js

# Test endpoints
curl http://localhost:3000/api/orders
curl http://localhost:3000/api/orders/legacy/LEGACY_ORD-2024-001_1
```

## Migration Details

### What Gets Created

1. **Orders Table** (if not exists):
   - `id` - Primary key
   - `customer_id` - Foreign key reference
   - `order_number` - Unique order identifier
   - `total_amount` - Order total (decimal)
   - `status` - Order status (enum)
   - `order_date` - Creation timestamp
   - `updated_at` - Last update timestamp

2. **Legacy ID Column**:
   - `legacy_id` - VARCHAR(100), nullable
   - Unique constraint for data integrity
   - Indexed for query performance
   - Auto-generated for existing rows

### Backfill Strategy

Existing orders automatically receive legacy IDs using the pattern:
```
LEGACY_<order_number>_<id>
```

Examples:
- Order #1 with order_number "ORD-2024-001" → `LEGACY_ORD-2024-001_1`
- Order #2 with order_number "ORD-2024-002" → `LEGACY_ORD-2024-002_2`

## API Endpoints

### Standard Endpoints
```
GET    /api/orders              # List all orders
POST   /api/orders              # Create new order
GET    /api/orders/:id          # Get order by ID
PUT    /api/orders/:id          # Update order
DELETE /api/orders/:id          # Delete order
```

### Backward Compatibility Endpoints
```
GET    /api/orders/legacy/:legacyId     # Find by legacy_id
GET    /api/orders/customer/:customerId # Orders by customer
PATCH  /api/orders/:id/status           # Update status only
```

## Usage Examples

### Creating Orders

**With Legacy ID** (recommended for new integrations):
```javascript
POST /api/orders
{
  "customer_id": 1,
  "order_number": "ORD-2024-006",
  "total_amount": 199.99,
  "status": "pending",
  "legacy_id": "CUSTOM_LEGACY_ID_123"
}
```

**Without Legacy ID** (backward compatible):
```javascript
POST /api/orders
{
  "customer_id": 1,
  "order_number": "ORD-2024-007",
  "total_amount": 299.99,
  "status": "pending"
}
// legacy_id will be auto-generated
```

### Finding Orders

**By Primary Key**:
```javascript
GET /api/orders/1
```

**By Legacy ID** (for backward compatibility):
```javascript
GET /api/orders/legacy/LEGACY_ORD-2024-001_1
```

## Model Usage

The Order model supports both access methods:

```javascript
const Order = require('./app/models/order.model.js');

// Find by primary key
Order.findById(1, (err, order) => {
  // Handle result
});

// Find by legacy_id (backward compatibility)
Order.findByLegacyId('LEGACY_ORD-2024-001_1', (err, order) => {
  // Handle result
});

// Create with auto-generated legacy_id
const newOrder = new Order({
  customer_id: 1,
  order_number: 'ORD-2024-008',
  total_amount: 150.00
});
// legacy_id will be auto-generated during creation
```

## Migration Safety Features

### 1. Idempotent Operations
- Safe to run multiple times
- Uses `IF NOT EXISTS` and `IF EXISTS` clauses
- Handles partial execution scenarios

### 2. Error Handling
- Comprehensive error logging
- Transaction-like behavior per migration
- Failed migrations don't get marked as executed

### 3. Rollback Support
Each migration includes rollback functionality:
```javascript
// Rollback removes:
// - Unique constraint
// - Index
// - Column
```

### 4. Performance Optimization
- Indexes created for query performance
- Appropriate data types and constraints
- Minimizes table locks during migration

## Backward Compatibility Guarantees

### Existing Code Compatibility
- All existing queries continue to work
- No breaking changes to API contracts
- Optional `legacy_id` field in requests/responses

### Data Integrity
- Existing data remains unchanged (except for new column)
- All relationships and constraints preserved
- No data loss during migration

### Performance
- Query performance maintained or improved
- New indexes support legacy_id lookups
- Minimal impact on existing operations

## Production Deployment

### Pre-Deployment Checklist
- [ ] Database backup completed
- [ ] Migration tested in staging environment
- [ ] Application servers ready for restart
- [ ] Rollback plan prepared

### Deployment Steps
1. **Backup Database**:
   ```bash
   mysqldump -u user -p database_name > backup_$(date +%Y%m%d_%H%M%S).sql
   ```

2. **Run Migrations**:
   ```bash
   npm run migrate
   ```

3. **Verify Migration**:
   ```bash
   # Check migrations table
   SELECT * FROM migrations;
   
   # Verify orders table structure
   DESCRIBE orders;
   
   # Check backfilled data
   SELECT id, order_number, legacy_id FROM orders LIMIT 5;
   ```

4. **Deploy Application**:
   ```bash
   # Restart application servers
   pm2 restart all  # or your deployment method
   ```

### Post-Deployment Verification
- [ ] API endpoints responding correctly
- [ ] Legacy ID lookups working
- [ ] No performance degradation
- [ ] Error logs clean

## Troubleshooting

### Common Issues

**Migration Timeout**:
```sql
-- Increase MySQL timeout
SET SESSION wait_timeout = 3600;
SET SESSION interactive_timeout = 3600;
```

**Duplicate Key Errors**:
- Check for existing `legacy_id` values
- Verify order_number uniqueness
- Review backfill logic for conflicts

**Permission Errors**:
```sql
-- Ensure user has necessary privileges
GRANT ALTER, CREATE, INDEX ON database_name.* TO 'username'@'host';
```

### Recovery Steps

1. **Check Migration Status**:
   ```sql
   SELECT * FROM migrations ORDER BY executed_at DESC;
   ```

2. **Manual Rollback** (if needed):
   ```sql
   -- Remove legacy_id column manually
   ALTER TABLE orders DROP CONSTRAINT IF EXISTS uk_orders_legacy_id;
   ALTER TABLE orders DROP INDEX IF EXISTS idx_orders_legacy_id;
   ALTER TABLE orders DROP COLUMN IF EXISTS legacy_id;
   DELETE FROM migrations WHERE filename = '002_add_legacy_id_to_orders.js';
   ```

3. **Re-run Migration**:
   ```bash
   npm run migrate
   ```

## Monitoring and Maintenance

### Performance Monitoring
- Monitor query performance after deployment
- Check index usage statistics
- Watch for any slow queries involving legacy_id

### Data Validation
```sql
-- Verify all orders have legacy_id
SELECT COUNT(*) FROM orders WHERE legacy_id IS NULL;

-- Check for duplicate legacy_ids
SELECT legacy_id, COUNT(*) FROM orders 
GROUP BY legacy_id HAVING COUNT(*) > 1;

-- Validate legacy_id format
SELECT * FROM orders 
WHERE legacy_id NOT LIKE 'LEGACY_%' 
AND legacy_id IS NOT NULL;
```

## Future Considerations

### Migration Enhancements
- Automated rollback system
- Migration status dashboard
- Performance impact reporting
- Batch processing for large tables

### API Evolution
- Consider deprecating old endpoints gradually
- Add API versioning for major changes
- Implement feature flags for new functionality

## Support

For issues or questions regarding this migration:
1. Check the migration logs in the console output
2. Verify database connection and permissions
3. Review the troubleshooting section above
4. Check the detailed migration README in `/migrations/README.md`
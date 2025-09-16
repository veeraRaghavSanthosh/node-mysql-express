# Quick Start - Legacy ID Migration

## 🚀 Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure database:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Run the migration:**
   ```bash
   npm run migrate:up
   ```

## ✅ What This Migration Does

- ✅ Adds `legacy_id` column to `orders` table
- ✅ Backfills existing orders with generated legacy IDs
- ✅ Maintains full backward compatibility
- ✅ Creates indexes for performance
- ✅ Adds unique constraints for data integrity

## 🔧 Available Commands

```bash
# Run all pending migrations
npm run migrate:up

# Check migration status  
npm run migrate:status

# Test the migration
npm run migrate:test

# Rollback last migration
npm run migrate:down

# Run specific migration
npm run migrate:run add_legacy_id_to_orders.js

# Rollback specific migration
npm run migrate:rollback add_legacy_id_to_orders.js
```

## 📊 Legacy ID Format

Generated IDs follow the pattern: `LEGACY_XXXXXXXX`
- Example: Order ID 123 → `LEGACY_00000123`

## 🔒 Backward Compatibility

- Existing code continues to work unchanged
- `legacy_id` column is nullable
- No breaking changes to existing queries
- New orders can be inserted without `legacy_id`

## 🧪 Testing

Run the test suite to verify everything works:
```bash
npm run migrate:test
```

## 📖 Full Documentation

See `migrations/README.md` for complete documentation.

## ⚠️ Important Notes

- Run during low-traffic periods for large datasets
- The migration processes records in batches of 1000
- All operations are wrapped in transactions for safety
- Full rollback support is available if needed
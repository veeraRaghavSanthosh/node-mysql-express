# Database Migration System

This project now includes a simple database migration system to manage database schema changes.

## Files Created

1. **`migrate.js`** - Main migration runner script
2. **`migrations/001_create_orders_table.js`** - Creates the orders table
3. **`migrations/002_add_legacy_id_to_orders.js`** - Adds legacy_id column and backfills existing data
4. **`test_migration.js`** - Test script to verify migrations work correctly

## How to Use

### Running Migrations

```bash
# Run all pending migrations
npm run migrate

# Or directly with node
node migrate.js up
```

### Rolling Back Migrations

```bash
# Roll back the last migration
npm run migrate:rollback

# Or directly with node
node migrate.js down
```

### Testing the Migration

```bash
# Test the current state of the database
node test_migration.js

# Add sample data for testing (run this after first migration)
node test_migration.js add-sample-data
```

## Migration Process

### Step 1: Create Orders Table
The first migration (`001_create_orders_table.js`) creates the orders table with:
- `id` (Primary Key, Auto Increment)
- `customer_id` (INT, with index)
- `order_date` (TIMESTAMP, with index)
- `total_amount` (DECIMAL)
- `status` (VARCHAR, with index)
- `created_at` and `updated_at` timestamps

### Step 2: Add Legacy ID Column
The second migration (`002_add_legacy_id_to_orders.js`):
1. Adds a `legacy_id` column (VARCHAR(100), UNIQUE)
2. Backfills existing rows with format: `ORDER_00000001`, `ORDER_00000002`, etc.
3. Adds an index on the `legacy_id` column for performance

## Testing Workflow

1. **Run the first migration** to create the orders table:
   ```bash
   npm run migrate
   ```

2. **Add sample data** to test backfill functionality:
   ```bash
   node test_migration.js add-sample-data
   ```

3. **Run the second migration** to add legacy_id and backfill:
   ```bash
   npm run migrate
   ```

4. **Verify the results**:
   ```bash
   node test_migration.js
   ```

## Migration Features

- **Atomic Operations**: Each migration runs in a transaction-like manner
- **Tracking**: Uses a `migrations` table to track which migrations have been executed
- **Rollback Support**: Each migration includes both `up` and `down` functions
- **Error Handling**: Proper error handling with detailed logging
- **Backfill Logic**: Automatically generates legacy_id values for existing orders
- **Performance**: Adds appropriate indexes for optimal query performance

## Expected Results

After running both migrations and adding sample data, you should see:
- Orders table with legacy_id column
- Existing orders backfilled with legacy_id values like `ORDER_00000001`
- Proper indexes for performance
- All changes tracked in the migrations table

## Rollback Behavior

Rolling back the legacy_id migration will:
- Remove the legacy_id column entirely
- Remove the associated index
- Preserve all other order data

Rolling back the orders table migration will:
- Drop the entire orders table
- Remove all order data (use with caution!)
-- Rollback migration: Remove legacy_id column from orders table

-- Drop the trigger
DROP TRIGGER IF EXISTS orders_before_insert;

-- Check if orders table and legacy_id column exist
SET @table_exists = (
  SELECT COUNT(*) 
  FROM information_schema.tables 
  WHERE table_schema = DATABASE() 
  AND table_name = 'orders'
);

SET @column_exists = (
  SELECT COUNT(*) 
  FROM information_schema.columns 
  WHERE table_schema = DATABASE() 
  AND table_name = 'orders' 
  AND column_name = 'legacy_id'
);

-- Only proceed if both table and column exist
SET @sql = IF(
  @table_exists > 0 AND @column_exists > 0,
  'ALTER TABLE orders DROP COLUMN legacy_id',
  'SELECT "orders table or legacy_id column does not exist" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
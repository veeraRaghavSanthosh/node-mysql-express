-- Migration: Add legacy_id column to existing orders table and backfill data
-- This migration handles the case where orders table already exists without legacy_id column

-- Check if orders table exists and legacy_id column doesn't exist
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

-- Only proceed if table exists but column doesn't exist
SET @sql = IF(
  @table_exists > 0 AND @column_exists = 0,
  'ALTER TABLE orders ADD COLUMN legacy_id VARCHAR(255) NULL COMMENT "Legacy system order identifier for backward compatibility", ADD INDEX idx_legacy_id (legacy_id)',
  'SELECT "orders table does not exist or legacy_id column already exists" as message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Backfill legacy_id for existing orders (only if column was just added)
SET @backfill_sql = IF(
  @table_exists > 0 AND @column_exists = 0,
  'UPDATE orders SET legacy_id = CONCAT("LEGACY_", LPAD(id, 6, "0")) WHERE legacy_id IS NULL',
  'SELECT "No backfill needed" as message'
);

PREPARE stmt FROM @backfill_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create or replace trigger for auto-generating legacy_id
-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS orders_before_insert;

-- Create the trigger (only if orders table exists)
SET @trigger_sql = IF(
  @table_exists > 0,
  'CREATE TRIGGER orders_before_insert 
   BEFORE INSERT ON orders
   FOR EACH ROW
   BEGIN
     IF NEW.legacy_id IS NULL THEN
       SET NEW.legacy_id = CONCAT("ORD_", DATE_FORMAT(NOW(), "%Y%m%d"), "_", LPAD(CONNECTION_ID(), 6, "0"));
     END IF;
   END',
  'SELECT "orders table does not exist, skipping trigger creation" as message'
);

PREPARE stmt FROM @trigger_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
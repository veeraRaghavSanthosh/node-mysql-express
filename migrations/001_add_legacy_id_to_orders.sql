-- Migration: Add legacy_id column to orders table
-- Created: 2025-09-16
-- Description: Add legacy_id column for backward compatibility and backfill existing rows

-- Add the legacy_id column as nullable for backward compatibility
ALTER TABLE orders 
ADD COLUMN legacy_id VARCHAR(255) NULL 
COMMENT 'Legacy identifier for backward compatibility';

-- Create index on legacy_id for performance
CREATE INDEX idx_orders_legacy_id ON orders(legacy_id);

-- Backfill existing rows with legacy_id based on their primary key
-- Using a format like 'LEGACY_' + id to ensure uniqueness
UPDATE orders 
SET legacy_id = CONCAT('LEGACY_', id) 
WHERE legacy_id IS NULL;
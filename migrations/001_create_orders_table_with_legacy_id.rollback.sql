-- Rollback migration: Drop orders table and related triggers
-- This rollback script removes the orders table and associated triggers

-- Drop the trigger first
DROP TRIGGER IF EXISTS orders_before_insert;

-- Drop the orders table (this will also drop all foreign key constraints and indexes)
DROP TABLE IF EXISTS orders;
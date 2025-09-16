-- Migration: Create orders table with legacy_id column
-- This migration creates the orders table with the legacy_id column included from the start
-- to maintain backward compatibility and support future data migration scenarios

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  legacy_id VARCHAR(255) NULL COMMENT 'Legacy system order identifier for backward compatibility',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_customer_id (customer_id),
  INDEX idx_order_date (order_date),
  INDEX idx_status (status),
  INDEX idx_legacy_id (legacy_id),
  
  -- Foreign key constraint (assuming customers table exists)
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Create a trigger to automatically generate legacy_id for new orders if not provided
-- This ensures backward compatibility for existing application code
DELIMITER $$

CREATE TRIGGER orders_before_insert 
BEFORE INSERT ON orders
FOR EACH ROW
BEGIN
  -- If legacy_id is not provided, generate one based on the order pattern
  IF NEW.legacy_id IS NULL THEN
    SET NEW.legacy_id = CONCAT('ORD_', DATE_FORMAT(NOW(), '%Y%m%d'), '_', LPAD(CONNECTION_ID(), 6, '0'));
  END IF;
END$$

DELIMITER ;

-- Insert some sample data for testing (optional - can be removed in production)
-- This simulates existing orders that would need legacy_id backfilling
INSERT INTO orders (customer_id, total_amount, status, legacy_id) VALUES
(1, 99.99, 'delivered', 'LEGACY_001'),
(1, 149.50, 'shipped', 'LEGACY_002'),
(2, 75.25, 'pending', NULL); -- This will get auto-generated legacy_id

-- Add a comment to the table for documentation
ALTER TABLE orders COMMENT = 'Orders table with legacy_id support for backward compatibility';
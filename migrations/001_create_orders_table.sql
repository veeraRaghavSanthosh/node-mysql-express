-- Create orders table for the order processing system
-- This migration adds support for order management and processing

CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customerId INT NOT NULL,
    items JSON,
    status VARCHAR(50) DEFAULT 'pending',
    totalAmount DECIMAL(10,2) DEFAULT 0.00,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customerId),
    INDEX idx_status (status),
    INDEX idx_created_at (createdAt)
);

-- Add foreign key constraint if customers table exists
-- ALTER TABLE orders ADD CONSTRAINT fk_orders_customer 
-- FOREIGN KEY (customerId) REFERENCES customers(id) ON DELETE CASCADE;
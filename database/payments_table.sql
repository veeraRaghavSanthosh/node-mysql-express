-- Payments table schema
-- This table stores payment information with comprehensive logging support

CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL,
  status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
  description TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_customer_id (customer_id),
  INDEX idx_status (status),
  INDEX idx_currency (currency),
  INDEX idx_created_at (created_at),
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Insert some sample data for testing
INSERT INTO payments (customer_id, amount, currency, payment_method, status, description, metadata) VALUES
(1, 99.99, 'USD', 'credit_card', 'pending', 'Monthly subscription payment', '{"subscription_id": "sub_123", "plan": "premium"}'),
(1, 49.99, 'USD', 'paypal', 'completed', 'One-time purchase', '{"product_id": "prod_456", "category": "software"}'),
(2, 199.99, 'EUR', 'bank_transfer', 'pending', 'Annual subscription', '{"subscription_id": "sub_789", "plan": "enterprise"}')
ON DUPLICATE KEY UPDATE id=id;
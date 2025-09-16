-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customer_id (customer_id),
  INDEX idx_status (status),
  INDEX idx_order_date (order_date)
);

-- Sample data for testing (optional)
-- INSERT INTO orders (customer_id, product_name, quantity, unit_price, total_amount, status) VALUES
-- (1, 'Laptop Computer', 1, 999.99, 999.99, 'pending'),
-- (2, 'Wireless Mouse', 2, 29.99, 59.98, 'processing'),
-- (1, 'USB Cable', 3, 15.99, 47.97, 'shipped');
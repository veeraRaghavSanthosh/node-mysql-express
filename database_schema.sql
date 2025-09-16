-- Database schema for orders functionality
-- This file contains the SQL commands to create the required tables

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customer_id),
    INDEX idx_status (status),
    INDEX idx_order_date (order_date),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Create order_items table
CREATE TABLE IF NOT EXISTS order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Sample data for testing (optional)
-- INSERT INTO customers (name, email, active) VALUES 
-- ('John Doe', 'john@example.com', true),
-- ('Jane Smith', 'jane@example.com', true);

-- INSERT INTO orders (customer_id, total_amount, status) VALUES 
-- (1, 149.98, 'pending'),
-- (2, 79.99, 'processing');

-- INSERT INTO order_items (order_id, product_name, quantity, price) VALUES 
-- (1, 'Laptop', 1, 999.99),
-- (1, 'Mouse', 2, 25.00),
-- (2, 'Keyboard', 1, 79.99);
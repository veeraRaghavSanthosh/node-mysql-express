-- Database setup for Node.js Express MySQL Authentication API
-- This script creates the necessary tables for the authentication system

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_active (active),
  INDEX idx_created_at (created_at)
);

-- Create customers table (existing table from original project)
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_email (email),
  INDEX idx_active (active)
);

-- Insert sample admin user (password: admin123)
-- Note: In production, create admin users through the API with proper password hashing
INSERT INTO users (email, name, password, role) VALUES 
('admin@example.com', 'System Administrator', '$2b$10$YQdAn.3bZCGUKU7Zg7XBHOGjnEaQcwgJqNnzCF7vYYGPtC5pzgmSm', 'admin')
ON DUPLICATE KEY UPDATE
name = 'System Administrator',
role = 'admin';

-- Insert sample regular user (password: user123)
INSERT INTO users (email, name, password, role) VALUES 
('user@example.com', 'Regular User', '$2b$10$YQdAn.3bZCGUKU7Zg7XBHOGjnEaQcwgJqNnzCF7vYYGPtC5pzgmSm', 'user')
ON DUPLICATE KEY UPDATE
name = 'Regular User',
role = 'user';

-- Insert sample customers
INSERT INTO customers (name, email, active) VALUES 
('John Doe', 'john.doe@example.com', TRUE),
('Jane Smith', 'jane.smith@example.com', TRUE),
('Bob Johnson', 'bob.johnson@example.com', FALSE)
ON DUPLICATE KEY UPDATE
name = VALUES(name),
email = VALUES(email),
active = VALUES(active);
-- Notification System Database Schema
-- This schema maintains backward compatibility with existing customer table

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  recipient_id INT NULL,
  recipient_email VARCHAR(255) NULL,
  type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
  status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
  priority ENUM('low', 'normal', 'high', 'urgent') DEFAULT 'normal',
  scheduled_at DATETIME NULL,
  sent_at DATETIME NULL,
  metadata JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes for performance
  INDEX idx_recipient_id (recipient_id),
  INDEX idx_recipient_email (recipient_email),
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_priority (priority),
  INDEX idx_created_at (created_at),
  INDEX idx_scheduled_at (scheduled_at),
  
  -- Constraints
  CONSTRAINT chk_recipient CHECK (recipient_id IS NOT NULL OR recipient_email IS NOT NULL)
);

-- Optional: Add foreign key constraint if you want to link to customers table
-- ALTER TABLE notifications 
-- ADD CONSTRAINT fk_notifications_customer 
-- FOREIGN KEY (recipient_id) REFERENCES customers(id) 
-- ON DELETE CASCADE ON UPDATE CASCADE;

-- Insert some sample data for testing
INSERT INTO notifications (title, message, recipient_id, type, status, priority) VALUES
('Welcome!', 'Welcome to our platform. We are excited to have you on board!', 1, 'info', 'sent', 'normal'),
('Account Verification', 'Please verify your account by clicking the link in your email.', 1, 'warning', 'pending', 'high'),
('Payment Successful', 'Your payment has been processed successfully.', 1, 'success', 'sent', 'normal'),
('System Maintenance', 'Scheduled maintenance will occur tonight from 2-4 AM.', NULL, 'info', 'pending', 'low'),
('Security Alert', 'Unusual login activity detected on your account.', 1, 'error', 'failed', 'urgent');

-- Create a view for notification statistics
CREATE OR REPLACE VIEW notification_stats AS
SELECT 
  status,
  COUNT(*) as count,
  type,
  priority
FROM notifications 
GROUP BY status, type, priority
ORDER BY status, type, priority;

-- Create a view for recent notifications
CREATE OR REPLACE VIEW recent_notifications AS
SELECT 
  id,
  title,
  message,
  recipient_id,
  recipient_email,
  type,
  status,
  priority,
  created_at
FROM notifications 
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY created_at DESC;
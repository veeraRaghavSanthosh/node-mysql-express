-- Create payments table
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `customer_id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) NOT NULL DEFAULT 'USD',
  `payment_method` varchar(50) NOT NULL,
  `description` text,
  `status` enum('pending','processing','completed','failed','cancelled','refunded') DEFAULT 'pending',
  `refund_amount` decimal(10,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_customer_id` (`customer_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add some sample data for testing
INSERT INTO `payments` (`customer_id`, `amount`, `currency`, `payment_method`, `description`, `status`) VALUES
(1, 99.99, 'USD', 'credit_card', 'Premium subscription payment', 'completed'),
(1, 29.99, 'USD', 'paypal', 'Monthly service fee', 'completed'),
(2, 149.50, 'EUR', 'bank_transfer', 'Product purchase', 'processing'),
(2, 75.00, 'USD', 'credit_card', 'Service upgrade', 'failed'),
(1, 199.99, 'USD', 'apple_pay', 'Annual subscription', 'pending');
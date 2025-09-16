-- Create reports table for the reporting API
CREATE TABLE IF NOT EXISTS `reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) NOT NULL,
  `description` text,
  `status` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `parameters` json,
  `generated_by` varchar(100) NOT NULL,
  `file_url` varchar(500),
  `file_size` bigint,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_status` (`status`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_generated_by` (`generated_by`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Insert sample data for testing
INSERT INTO `reports` (`name`, `type`, `description`, `status`, `parameters`, `generated_by`, `file_url`, `file_size`) VALUES
('Monthly Customer Report', 'customer_summary', 'Monthly customer summary for September 2025', 'completed', '{"start_date": "2025-09-01", "end_date": "2025-09-30", "include_charts": true, "format": "PDF"}', 'admin', '/reports/files/monthly-customer-202509.pdf', 2048576),
('Customer Activity Analysis', 'customer_activity', 'Customer activity report for Q3 2025', 'completed', '{"date_range": "Q3-2025", "activity_type": "all", "format": "Excel"}', 'user123', '/reports/files/customer-activity-q3-2025.xlsx', 1536000),
('System Performance Report', 'system_analytics', 'System performance analytics for September', 'processing', '{"period": "month", "metrics": ["performance", "usage"], "format": "PDF"}', 'system', NULL, NULL),
('Weekly Customer Summary', 'customer_summary', 'Weekly customer summary report', 'pending', '{"start_date": "2025-09-09", "end_date": "2025-09-15", "format": "CSV"}', 'admin', NULL, NULL);
-- Test database setup for CI/CD pipeline
CREATE TABLE IF NOT EXISTS customers (
  id int(11) NOT NULL AUTO_INCREMENT,
  email varchar(255) DEFAULT NULL,
  name varchar(255) DEFAULT NULL,
  active boolean DEFAULT false,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Insert test data for integration tests
INSERT INTO customers (email, name, active) VALUES 
('test1@example.com', 'Test User 1', true),
('test2@example.com', 'Test User 2', false),
('test3@example.com', 'Test User 3', true);
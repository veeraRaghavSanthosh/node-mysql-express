# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Database migration system with migration runner for managing schema changes
- Orders table with basic schema including customer relationships
- `legacy_id` column to orders table for legacy system integration
- Automated backfill functionality for existing orders with `legacy_id` values
- Unit tests for database migrations with comprehensive test coverage
- Migration scripts for easy database schema management (`npm run migrate:up`, `npm run migrate:down`)

### Changed
- Updated package.json with testing dependencies (Jest) and migration scripts
- Enhanced project structure with dedicated migrations directory

### Technical Details
- **Migration 001**: Creates orders table with customer foreign key relationship
- **Migration 002**: Adds `legacy_id` VARCHAR(50) column to orders table with unique constraint and index
- **Backfill Logic**: Generates legacy IDs in format `LEGACY_YYYYMMDD_XXXXXX` where:
  - `YYYYMMDD` is the order date in ISO format
  - `XXXXXX` is the order ID zero-padded to 6 digits
- **Testing**: Comprehensive unit tests covering migration execution, backfill logic, and error handling scenarios

### Database Schema Changes
```sql
-- Orders table structure
CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT,
  order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  legacy_id VARCHAR(50) NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  INDEX idx_orders_legacy_id (legacy_id)
);
```

## [1.0.0] - 2025-09-16

### Added
- Initial Node.js Express MySQL REST API
- Customer CRUD operations
- Basic project structure with Express routing
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Migration system for database schema changes
- Migration `001_add_legacy_id_to_orders.js` to add `legacy_id` column to `orders` table
- Automatic backfill of existing orders with legacy IDs in format `LEGACY_XXXXXXXX`
- Database index on `legacy_id` column for improved query performance
- Unit tests for migration with comprehensive coverage including edge cases
- Migration runner utility with CLI interface
- Jest testing framework configuration for migration tests

### Changed
- Updated `package.json` with migration and testing scripts
- Added Jest as development dependency for unit testing

### Database Schema Changes
- `orders` table: Added `legacy_id VARCHAR(50) NULL` column with index
- Existing rows backfilled with `legacy_id` values based on primary key ID

### Migration Details
- **Migration File**: `migrations/001_add_legacy_id_to_orders.js`
- **Purpose**: Add backward compatibility support for legacy order identifiers
- **Backfill Strategy**: `CONCAT('LEGACY_', LPAD(id, 8, '0'))` generates format like `LEGACY_00000001`
- **Rollback Support**: Full rollback capability to remove column and index
- **Performance**: Indexed column for efficient legacy ID lookups

### Usage
```bash
# Run migration
npm run migrate:up 001_add_legacy_id_to_orders

# Rollback migration
npm run migrate:down 001_add_legacy_id_to_orders

# List available migrations
npm run migrate:list

# Run migration tests
npm run test:migrations
```
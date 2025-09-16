# Changelog

All notable changes to this project will be documented in this file.

## [1.1.0] - 2025-09-16

### Added
- **Security Enhancements**
  - Added comprehensive input validation using `express-validator`
  - Implemented rate limiting with different tiers:
    - General API rate limit: 100 requests per 15 minutes per IP
    - Create operations: 5 requests per 15 minutes per IP  
    - Delete operations: 10 requests per 15 minutes per IP
  - Added XSS protection with input sanitization using `xss` library
  - Implemented security headers using `helmet` middleware
  - Added comprehensive unit tests for security features

### Security
- **CRITICAL**: Fixed SQL injection vulnerability in `customer.model.js` `findById` method
  - Changed from string interpolation to parameterized queries
  - Affects: `/customers/:customerId` GET endpoint
- Added input validation for all customer endpoints:
  - Email format validation and normalization
  - Name length and character validation (1-100 chars, alphanumeric + safe chars)
  - Customer ID validation (positive integers only)
  - Active field boolean validation
- Implemented XSS protection across all input fields
- Added proper error handling to prevent information disclosure

### Changed
- Updated `package.json` with new security dependencies:
  - `express-rate-limit`: ^6.7.0
  - `express-validator`: ^6.15.0
  - `helmet`: ^6.1.5
  - `xss`: ^1.0.14
- Enhanced error responses with proper HTTP status codes
- Improved validation error messages for better developer experience

### Technical Details
- Created new security middleware in `app/middleware/security.middleware.js`
- Updated customer routes to include validation and rate limiting
- Enhanced customer controller with better error handling
- All changes are backward compatible with existing API consumers

### Testing
- Added comprehensive security test suite covering:
  - Rate limiting functionality
  - Input validation scenarios
  - XSS protection verification
  - SQL injection prevention
  - Security headers validation
  - Error handling security
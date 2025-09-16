# Security Improvements Applied

This document outlines the security enhancements implemented to prevent abuse and protect the Node.js Express MySQL API.

## 1. Rate Limiting

### Implementation
- **General Rate Limit**: 100 requests per 15 minutes for read operations
- **Strict Rate Limit**: 20 requests per 15 minutes for write operations (POST, PUT, DELETE)

### Applied To
- GET `/customers` - General rate limiting
- GET `/customers/:id` - General rate limiting  
- POST `/customers` - Strict rate limiting
- PUT `/customers/:id` - Strict rate limiting
- DELETE `/customers/:id` - Strict rate limiting
- DELETE `/customers` - Strict rate limiting

## 2. Input Sanitization and Validation

### Email Validation
- Must be a valid email format
- Automatically normalized (lowercased, trimmed)

### Name Validation
- Required field, 1-100 characters
- Only letters and spaces allowed
- Trimmed of whitespace

### Customer ID Validation
- Must be a positive integer
- Applied to all routes with `:customerId` parameter

### Active Field Validation
- Optional boolean field
- Validates true/false values only

## 3. SQL Injection Prevention

### Fixed Vulnerabilities
- **Critical Fix**: Customer.findById() method now uses parameterized queries
- Changed from: SELECT * FROM customers WHERE id = ${customerId}
- Changed to: SELECT * FROM customers WHERE id = ? with parameter array

## 4. Security Headers

### Helmet.js Integration
- Content Security Policy (CSP) configured
- X-Frame-Options, X-Content-Type-Options, and other security headers
- Protection against common attacks (XSS, clickjacking, etc.)

## Files Modified

1. **package.json** - Added security dependencies
2. **security-middleware.js** - New security middleware file
3. **app/routes/customer.routes.js** - Updated with security middleware
4. **server.js** - Updated with security headers
5. **app/models/customer.model.js** - Fixed SQL injection vulnerability

## Installation

To install the new security dependencies:
npm install express-rate-limit express-validator helmet

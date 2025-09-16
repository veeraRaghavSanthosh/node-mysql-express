# Authentication API - Quick Reference

## Overview
This Node.js Express MySQL application provides authentication middleware and customer management APIs. The current implementation includes a basic authentication framework ready for enhancement.

## Quick Start

### Start the Server
```bash
npm install
node server.js
```
Server runs on: `http://localhost:3000`

## Current API Endpoints

### Public Endpoints
- `GET /user` - Get user information (no auth required)

### Customer Management (Protected via `/api/*` routes)
- `POST /customers` - Create customer
- `GET /customers` - Get all customers  
- `GET /customers/:id` - Get customer by ID
- `PUT /customers/:id` - Update customer
- `DELETE /customers/:id` - Delete customer
- `DELETE /customers` - Delete all customers

## Authentication Status
- **Current**: Basic middleware placeholder (passes all requests)
- **Pattern**: `/api/*` routes are protected by `authMiddleware`
- **Backward Compatible**: All existing functionality preserved

## Example Usage

### Create Customer
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","active":true}'
```

### Get All Customers
```bash
curl -X GET http://localhost:3000/customers
```

### Get User Info
```bash
curl -X GET http://localhost:3000/user
```

## Response Format
All APIs return JSON with consistent error handling:

**Success**: Data object or array
**Error**: `{"message": "Error description"}`

## For Complete Documentation
See [AUTH_API_DOCS.md](./AUTH_API_DOCS.md) for:
- Detailed API specifications
- Request/response schemas
- Authentication recommendations
- Security considerations
- Complete examples and testing

## Database Schema
Customer table structure:
- `id` (primary key)
- `email` (string)
- `name` (string) 
- `active` (boolean)

---

*Quick reference for the Node.js Express MySQL Authentication API*
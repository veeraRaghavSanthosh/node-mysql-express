# Billing System API - Quick Reference

## 🚀 Quick Start

Base URL: `http://localhost:3000`

## 📋 Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST   | `/customers` | Create new customer | No |
| GET    | `/customers` | Get all customers | No |
| GET    | `/customers/:id` | Get customer by ID | No |
| PUT    | `/customers/:id` | Update customer | No |
| DELETE | `/customers/:id` | Delete customer | No |
| DELETE | `/customers` | Delete all customers | No |

## 🔧 Quick Examples

### Create Customer
```bash
curl -X POST http://localhost:3000/customers \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe","active":true}'
```

### Get All Customers
```bash
curl -X GET http://localhost:3000/customers
```

### Get Customer by ID
```bash
curl -X GET http://localhost:3000/customers/1
```

### Update Customer
```bash
curl -X PUT http://localhost:3000/customers/1 \
  -H "Content-Type: application/json" \
  -d '{"email":"updated@example.com","name":"Updated Name","active":false}'
```

### Delete Customer
```bash
curl -X DELETE http://localhost:3000/customers/1
```

## 📊 Response Codes

- `200` - Success
- `400` - Bad Request (missing/invalid data)
- `404` - Customer not found
- `500` - Server error

## 📝 Customer Object

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "active": true
}
```

## ⚠️ Important Notes

1. **Email & Name Required**: Both fields are mandatory when creating customers
2. **Active Field**: Defaults to `true` if not specified
3. **Delete All**: Use `DELETE /customers` with extreme caution
4. **Backward Compatibility**: All existing endpoints remain unchanged

## 🧪 Testing

Import the Postman collection: `billing-api-postman-collection.json`

## 📚 Full Documentation

See `BILLING_API_DOCUMENTATION.md` for complete details and examples.
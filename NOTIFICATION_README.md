# Notification System

A comprehensive notification system for the Node.js Express MySQL application.

## Features

- Create, read, and send notifications
- Support for different notification types (info, warning, error, success)
- Priority levels (low, normal, high, urgent)
- Status tracking (pending, sent, failed)
- Flexible recipient support (user ID or email)
- Comprehensive unit testing
- Backward compatibility with existing code

## Installation

1. Run the database schema:
```sql
-- See database_schema.sql for complete schema
```

2. Install test dependencies:
```bash
npm install
```

3. Run tests:
```bash
npm test
```

## API Usage

### Create Notification
```javascript
POST /notifications
{
  "title": "Welcome!",
  "message": "Welcome message",
  "recipient_id": 1,
  "type": "info"
}
```

### Send Notification
```javascript
POST /notifications/1/send
```

### Get Notifications
```javascript
GET /notifications
GET /notifications/1
```

## Testing

The system includes comprehensive tests covering:
- Success cases: Valid operations
- Failure cases: Invalid inputs, database errors
- Boundary cases: Edge conditions, extreme values
- Backward compatibility: Existing API preservation

Run tests with: `npm test`

## Files Added

- `app/models/notification.model.js` - Notification data model
- `app/controllers/notification.controller.js` - API controller
- `notification.model.test.js` - Model unit tests
- `notification.integration.test.js` - Integration tests
- `database_schema.sql` - Database schema
- Updated `package.json` with test dependencies
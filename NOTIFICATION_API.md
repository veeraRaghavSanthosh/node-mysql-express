# Notification API Documentation

## Overview

The Notification API provides endpoints to manage notifications in the Node.js/MySQL/Express application. This API allows you to create, retrieve, and delete notifications.

## Base URL

```
http://localhost:3000/api
```

## Endpoints

### 1. Get All Notifications

**GET** `/notifications`

Retrieves all notifications from the database.

#### Request

No request body required.

#### Response

**Status Code:** `200 OK`

**Response Schema:**
```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "id": {
        "type": "integer",
        "description": "Unique notification ID"
      },
      "title": {
        "type": "string",
        "description": "Notification title"
      },
      "message": {
        "type": "string",
        "description": "Notification message content"
      },
      "type": {
        "type": "string",
        "enum": ["info", "warning", "error", "success"],
        "description": "Notification type"
      },
      "is_read": {
        "type": "boolean",
        "description": "Whether the notification has been read"
      },
      "user_id": {
        "type": "integer",
        "description": "ID of the user who should receive the notification"
      },
      "created_at": {
        "type": "string",
        "format": "date-time",
        "description": "Timestamp when the notification was created"
      },
      "updated_at": {
        "type": "string",
        "format": "date-time",
        "description": "Timestamp when the notification was last updated"
      }
    }
  }
}
```

**Example Response:**
```json
[
  {
    "id": 1,
    "title": "Welcome!",
    "message": "Welcome to our application. Thank you for signing up!",
    "type": "info",
    "is_read": false,
    "user_id": 123,
    "created_at": "2025-09-16T12:00:00.000Z",
    "updated_at": "2025-09-16T12:00:00.000Z"
  },
  {
    "id": 2,
    "title": "System Maintenance",
    "message": "System will undergo maintenance tonight from 11 PM to 1 AM.",
    "type": "warning",
    "is_read": true,
    "user_id": 123,
    "created_at": "2025-09-15T08:30:00.000Z",
    "updated_at": "2025-09-16T09:15:00.000Z"
  }
]
```

#### Error Responses

**Status Code:** `500 Internal Server Error`
```json
{
  "message": "Some error occurred while retrieving notifications."
}
```

---

### 2. Get Notification by ID

**GET** `/notifications/:id`

Retrieves a specific notification by its ID.

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Unique notification ID |

#### Response

**Status Code:** `200 OK`

**Example Response:**
```json
{
  "id": 1,
  "title": "Welcome!",
  "message": "Welcome to our application. Thank you for signing up!",
  "type": "info",
  "is_read": false,
  "user_id": 123,
  "created_at": "2025-09-16T12:00:00.000Z",
  "updated_at": "2025-09-16T12:00:00.000Z"
}
```

#### Error Responses

**Status Code:** `404 Not Found`
```json
{
  "message": "Cannot find Notification with id=1."
}
```

**Status Code:** `500 Internal Server Error`
```json
{
  "message": "Error retrieving Notification with id=1"
}
```

---

### 3. Create New Notification

**POST** `/notifications`

Creates a new notification.

#### Request Body

**Content-Type:** `application/json`

**Example Request:**
```json
{
  "title": "Password Expiry Warning",
  "message": "Your password will expire in 3 days. Please update it to maintain account security.",
  "type": "warning",
  "user_id": 123
}
```

#### Response

**Status Code:** `201 Created`

**Example Response:**
```json
{
  "id": 3,
  "title": "Password Expiry Warning",
  "message": "Your password will expire in 3 days. Please update it to maintain account security.",
  "type": "warning",
  "is_read": false,
  "user_id": 123,
  "created_at": "2025-09-16T16:45:00.000Z",
  "updated_at": "2025-09-16T16:45:00.000Z"
}
```

---

### 4. Update Notification

**PUT** `/notifications/:id`

Updates an existing notification by ID.

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Unique notification ID |

#### Request Body

**Content-Type:** `application/json`

**Example Request:**
```json
{
  "is_read": true
}
```

#### Response

**Status Code:** `200 OK`

**Example Response:**
```json
{
  "message": "Notification was updated successfully."
}
```

---

### 5. Delete Notification

**DELETE** `/notifications/:id`

Deletes a specific notification by ID.

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| id | integer | Yes | Unique notification ID |

#### Response

**Status Code:** `200 OK`

**Example Response:**
```json
{
  "message": "Notification was deleted successfully!"
}
```

---

### 6. Delete All Notifications

**DELETE** `/notifications`

Deletes all notifications from the database.

#### Response

**Status Code:** `200 OK`

**Example Response:**
```json
{
  "message": "2 Notifications were deleted successfully!"
}
```

---

## Usage Examples

### JavaScript/Node.js Examples

#### Get All Notifications
```javascript
const axios = require('axios');

async function getAllNotifications() {
  try {
    const response = await axios.get('http://localhost:3000/api/notifications');
    console.log('Notifications:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching notifications:', error.response.data);
    throw error;
  }
}
```

#### Create a New Notification
```javascript
const axios = require('axios');

async function createNotification(notificationData) {
  try {
    const response = await axios.post('http://localhost:3000/api/notifications', {
      title: notificationData.title,
      message: notificationData.message,
      type: notificationData.type || 'info',
      user_id: notificationData.user_id
    });
    console.log('Notification created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating notification:', error.response.data);
    throw error;
  }
}
```

### cURL Examples

#### Get All Notifications
```bash
curl -X GET "http://localhost:3000/api/notifications" \
  -H "Content-Type: application/json"
```

#### Create a New Notification
```bash
curl -X POST "http://localhost:3000/api/notifications" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Alert",
    "message": "Your account has been successfully verified.",
    "type": "success",
    "user_id": 123
  }'
```

#### Update Notification (Mark as Read)
```bash
curl -X PUT "http://localhost:3000/api/notifications/1" \
  -H "Content-Type: application/json" \
  -d '{"is_read": true}'
```

#### Delete Notification
```bash
curl -X DELETE "http://localhost:3000/api/notifications/1" \
  -H "Content-Type: application/json"
```

---

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "message": "Error description",
  "error": "Optional detailed error information"
}
```

Common HTTP status codes:
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Database Schema

The notifications are stored in a MySQL table with the following structure:

```sql
CREATE TABLE notifications (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('info', 'warning', 'error', 'success') DEFAULT 'info',
  is_read BOOLEAN DEFAULT FALSE,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
);
```

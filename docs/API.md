# Skilli API Documentation

Base URL: `http://localhost:3000/api` (development)

All authenticated endpoints require `Authorization: Bearer <accessToken>` header.

---

## Authentication

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "phone": "+212600000000"
}

Response: 201 Created
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+212600000000",
    "isClient": true,
    "isProvider": false
  },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: 200 OK
{
  "user": { ... },
  "accessToken": "jwt-token",
  "refreshToken": "refresh-token"
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "refresh-token"
}

Response: 200 OK
{
  "accessToken": "new-jwt-token",
  "refreshToken": "new-refresh-token"
}
```

### Logout
```http
POST /auth/logout
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "message": "Logged out successfully"
}
```

### Get Profile
```http
GET /auth/profile
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+212600000000",
  "isClient": true,
  "isProvider": false,
  "createdAt": "2025-01-15T10:00:00Z"
}
```

---

## Provider Profiles

### Create/Update Provider Profile
```http
POST /provider-profiles
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "bio": "Experienced React developer with 5 years...",
  "city": "Casablanca",
  "educationLevel": "Master",
  "languages": ["Français", "Anglais", "Arabe"],
  "skills": ["React", "Node.js", "TypeScript"],
  "hourlyRate": 150,
  "yearsOfExperience": 5,
  "certifications": "AWS Certified Developer",
  "availability": "Lundi-Vendredi 9h-18h"
}

Response: 201 Created
{
  "id": "uuid",
  "userId": "user-uuid",
  "bio": "...",
  "city": "Casablanca",
  "educationLevel": "Master",
  "languages": ["Français", "Anglais", "Arabe"],
  "skills": ["React", "Node.js", "TypeScript"],
  "hourlyRate": 150,
  "yearsOfExperience": 5,
  "rating": 0,
  "totalRatings": 0,
  "certifications": "AWS Certified Developer",
  "availability": "Lundi-Vendredi 9h-18h",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

### Get All Providers
```http
GET /provider-profiles?city=Casablanca&skills=React,Node.js&level=Master

Response: 200 OK
[
  {
    "id": "uuid",
    "userId": "user-uuid",
    "bio": "...",
    "city": "Casablanca",
    "educationLevel": "Master",
    "languages": ["Français", "Anglais"],
    "skills": ["React", "Node.js"],
    "hourlyRate": 150,
    "yearsOfExperience": 5,
    "rating": 4.5,
    "totalRatings": 12,
    "user": {
      "id": "user-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
]
```

### Get Provider by User ID
```http
GET /provider-profiles/:userId

Response: 200 OK
{
  "id": "uuid",
  "userId": "user-uuid",
  "bio": "...",
  "city": "Casablanca",
  "educationLevel": "Master",
  "languages": ["Français", "Anglais", "Arabe"],
  "skills": ["React", "Node.js", "TypeScript"],
  "hourlyRate": 150,
  "yearsOfExperience": 5,
  "rating": 4.5,
  "totalRatings": 12,
  "certifications": "AWS Certified Developer",
  "availability": "Lundi-Vendredi 9h-18h",
  "user": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+212600000000"
  }
}
```

### Update Provider Profile
```http
PUT /provider-profiles
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "bio": "Updated bio...",
  "hourlyRate": 200
}

Response: 200 OK
{ /* updated profile */ }
```

---

## Sessions

### Create Session
```http
POST /sessions
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Maîtriser React en 2 heures",
  "description": "Session intensive sur React...",
  "skills": ["React", "JavaScript"],
  "date": "2025-02-01T14:00:00Z",
  "duration": 120,
  "isOnline": true,
  "location": null,
  "price": 200,
  "maxParticipants": 5
}

Response: 201 Created
{
  "id": "uuid",
  "providerId": "user-uuid",
  "title": "Maîtriser React en 2 heures",
  "description": "Session intensive sur React...",
  "skills": ["React", "JavaScript"],
  "date": "2025-02-01T14:00:00Z",
  "duration": 120,
  "isOnline": true,
  "location": null,
  "price": 200,
  "maxParticipants": 5,
  "likes": 0,
  "interested": 0,
  "status": "upcoming",
  "createdAt": "2025-01-15T10:00:00Z"
}
```

### Get All Sessions
```http
GET /sessions?skills=React&city=Casablanca&isOnline=true&minPrice=50&maxPrice=300

Response: 200 OK
[
  {
    "id": "uuid",
    "providerId": "user-uuid",
    "title": "Maîtriser React en 2 heures",
    "description": "Session intensive sur React...",
    "skills": ["React", "JavaScript"],
    "date": "2025-02-01T14:00:00Z",
    "duration": 120,
    "isOnline": true,
    "price": 200,
    "maxParticipants": 5,
    "_count": {
      "bookings": 2
    },
    "provider": {
      "id": "user-uuid",
      "name": "John Doe",
      "profile": {
        "city": "Casablanca",
        "rating": 4.5,
        "totalRatings": 12
      }
    }
  }
]
```

### Get Session by ID
```http
GET /sessions/:id

Response: 200 OK
{
  "id": "uuid",
  "providerId": "user-uuid",
  "title": "Maîtriser React en 2 heures",
  "description": "Session intensive sur React...",
  "skills": ["React", "JavaScript"],
  "date": "2025-02-01T14:00:00Z",
  "duration": 120,
  "isOnline": true,
  "location": null,
  "price": 200,
  "maxParticipants": 5,
  "_count": {
    "bookings": 2
  },
  "provider": {
    "id": "user-uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "profile": {
      "city": "Casablanca",
      "rating": 4.5,
      "totalRatings": 12,
      "photo": null
    }
  }
}
```

### Get My Sessions (Provider)
```http
GET /sessions/my-sessions
Authorization: Bearer <accessToken>

Response: 200 OK
[
  {
    "id": "uuid",
    "title": "Maîtriser React en 2 heures",
    "date": "2025-02-01T14:00:00Z",
    "price": 200,
    "_count": {
      "bookings": 2
    }
  }
]
```

### Update Session
```http
PUT /sessions/:id
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "title": "Updated title",
  "price": 250
}

Response: 200 OK
{ /* updated session */ }
```

### Delete Session
```http
DELETE /sessions/:id
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "message": "Session deleted successfully"
}
```

---

## Bookings

### Book Session
```http
POST /bookings
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "sessionId": "session-uuid"
}

Response: 201 Created
{
  "id": "uuid",
  "sessionId": "session-uuid",
  "clientId": "user-uuid",
  "amount": 200,
  "status": "confirmed",
  "paymentStatus": "paid",
  "rating": null,
  "review": null,
  "createdAt": "2025-01-15T10:00:00Z",
  "session": {
    "id": "session-uuid",
    "title": "Maîtriser React en 2 heures",
    "date": "2025-02-01T14:00:00Z",
    "provider": {
      "id": "provider-uuid",
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### Get My Bookings (Client)
```http
GET /bookings/my-bookings
Authorization: Bearer <accessToken>

Response: 200 OK
[
  {
    "id": "uuid",
    "sessionId": "session-uuid",
    "amount": 200,
    "status": "confirmed",
    "paymentStatus": "paid",
    "rating": null,
    "review": null,
    "session": {
      "id": "session-uuid",
      "title": "Maîtriser React en 2 heures",
      "date": "2025-02-01T14:00:00Z",
      "provider": {
        "id": "provider-uuid",
        "name": "John Doe",
        "profile": {
          "city": "Casablanca",
          "photo": null
        }
      }
    }
  }
]
```

### Get Provider Bookings
```http
GET /bookings/provider-bookings
Authorization: Bearer <accessToken>

Response: 200 OK
[
  {
    "id": "uuid",
    "amount": 200,
    "status": "confirmed",
    "paymentStatus": "paid",
    "session": {
      "id": "session-uuid",
      "title": "Maîtriser React en 2 heures"
    },
    "client": {
      "id": "client-uuid",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+212600000000"
    }
  }
]
```

### Cancel Booking
```http
PUT /bookings/:id/cancel
Authorization: Bearer <accessToken>

Response: 200 OK
{
  "id": "uuid",
  "status": "cancelled",
  /* ... other fields */
}
```

### Rate Session
```http
PUT /bookings/:id/rate
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent session, very helpful!"
}

Response: 200 OK
{
  "id": "uuid",
  "rating": 5,
  "review": "Excellent session, very helpful!",
  /* ... other fields */
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You can only cancel your own bookings",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Session not found",
  "error": "Not Found"
}
```

---

## Query Parameters

### Provider Profiles
- `city`: String - Filter by city
- `skills`: String - Comma-separated skills (e.g., "React,Node.js")
- `level`: String - Education level
- `search`: String - Search in bio and user name

### Sessions
- `skills`: String - Comma-separated skills
- `city`: String - Filter by provider city
- `isOnline`: Boolean - true/false
- `minPrice`: Number - Minimum price
- `maxPrice`: Number - Maximum price

---

## Notifications

### Get All Notifications
```http
GET /api/notifications
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "uuid",
    "userId": "uuid",
    "type": "booking",
    "title": "Nouvelle réservation",
    "message": "Quelqu'un a réservé votre session \"Formation React\"",
    "read": false,
    "sessionId": "uuid",
    "bookingId": "uuid",
    "createdAt": "2025-11-28T10:30:00.000Z",
    "updatedAt": "2025-11-28T10:30:00.000Z"
  }
]
```

### Get Unread Count
```http
GET /api/notifications/unread-count
Authorization: Bearer {token}
```

**Response:**
```json
{
  "count": 3
}
```

### Mark as Read
```http
PUT /api/notifications/{id}/read
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "uuid",
  "read": true,
  "updatedAt": "2025-11-28T10:35:00.000Z"
}
```

### Mark All as Read
```http
PUT /api/notifications/mark-all-read
Authorization: Bearer {token}
```

**Response:**
```json
{
  "count": 3
}
```

### Delete Notification
```http
DELETE /api/notifications/{id}
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true
}
```

---

## Status Codes

- `200 OK`: Request successful
- `201 Created`: Resource created
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

# SoundSteps API Reference

## Overview

The SoundSteps API provides comprehensive endpoints for managing voice-based lessons, user authentication, session tracking, and Africa's Talking webhook integration. All endpoints return JSON responses and use standard HTTP status codes.

**Base URL**: `http://localhost:3000` (development)  
**Authentication**: JWT Bearer tokens for protected endpoints  
**Content-Type**: `application/json` for all requests

## Authentication

### POST /auth/login
Authenticate user and receive JWT token.

**Request Body:**
```json
{
  "email": "teacher@soundsteps.com",
  "password": "password"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "teacher@soundsteps.com", 
    "name": "Teacher Name",
    "role": "teacher",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

**Errors:**
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials

### POST /auth/register
Register new user account.

**Request Body:**
```json
{
  "email": "newteacher@example.com",
  "name": "New Teacher",
  "password": "securepassword",
  "role": "teacher"
}
```

**Response (201):**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 2,
    "email": "newteacher@example.com",
    "name": "New Teacher",
    "role": "teacher"
  }
}
```

### GET /auth/me
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "id": 1,
  "email": "teacher@soundsteps.com",
  "name": "Teacher Name", 
  "role": "teacher",
  "created_at": "2024-01-01T00:00:00.000Z"
}
```

## Lessons Management

### GET /lessons
Retrieve all lessons with optional filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by title or description
- `is_active` (boolean): Filter by active status

**Response (200):**
```json
{
  "lessons": [
    {
      "id": 1,
      "title": "Basic Addition",
      "description": "Learn basic addition with numbers 1-10",
      "audio_url": "https://example.com/audio1.mp3",
      "duration": 180,
      "is_active": true,
      "created_by": 1,
      "created_at": "2024-01-01T00:00:00.000Z",
      "quiz_questions": [
        {
          "id": 1,
          "question": "What is 2 + 3?",
          "options": ["4", "5", "6", "7"],
          "correct_answer": 1,
          "order_index": 0
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### POST /lessons
Create a new lesson (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "title": "Multiplication Basics",
  "description": "Introduction to multiplication tables",
  "audio_url": "https://example.com/audio2.mp3",
  "duration": 240,
  "quiz_questions": [
    {
      "question": "What is 3 × 4?",
      "options": ["10", "11", "12", "13"],
      "correct_answer": 2,
      "order_index": 0
    }
  ]
}
```

**Response (201):**
```json
{
  "message": "Lesson created successfully",
  "lesson": {
    "id": 2,
    "title": "Multiplication Basics",
    "description": "Introduction to multiplication tables",
    "audio_url": "https://example.com/audio2.mp3",
    "duration": 240,
    "is_active": true,
    "created_by": 1,
    "created_at": "2024-01-01T10:00:00.000Z"
  }
}
```

### GET /lessons/:id
Get specific lesson details.

**Response (200):**
```json
{
  "id": 1,
  "title": "Basic Addition",
  "description": "Learn basic addition with numbers 1-10",
  "audio_url": "https://example.com/audio1.mp3", 
  "duration": 180,
  "is_active": true,
  "created_by": 1,
  "created_at": "2024-01-01T00:00:00.000Z",
  "quiz_questions": [
    {
      "id": 1,
      "lesson_id": 1,
      "question": "What is 2 + 3?",
      "options": ["4", "5", "6", "7"],
      "correct_answer": 1,
      "order_index": 0
    }
  ]
}
```

### PUT /lessons/:id
Update existing lesson (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:** Same as POST /lessons

**Response (200):**
```json
{
  "message": "Lesson updated successfully",
  "lesson": { /* updated lesson object */ }
}
```

### DELETE /lessons/:id
Delete lesson (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200):**
```json
{
  "message": "Lesson deleted successfully"
}
```

## Sessions & Analytics

### GET /sessions
Retrieve call sessions with filtering options.

**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by session status (IN_PROGRESS, COMPLETED, FAILED)
- `date_from`, `date_to`: Date range filtering
- `caller_phone`: Filter by phone number

**Response (200):**
```json
{
  "sessions": [
    {
      "id": "session_1704067200_abc123",
      "call_id": "ATCallId_xyz789",
      "caller_phone": "+254712345678",
      "lesson_id": "basic-addition-001", 
      "answers": ["2", "2"],
      "score": 2,
      "status": "COMPLETED",
      "current_state": "end",
      "caregiver_phone": "+254787654321",
      "start_time": "2024-01-01T10:00:00.000Z",
      "end_time": "2024-01-01T10:03:30.000Z"
    }
  ],
  "pagination": { /* pagination info */ }
}
```

### GET /sessions/stats
Get dashboard statistics.

**Response (200):**
```json
{
  "active_calls": 3,
  "total_lessons": 12,
  "total_users": 156,
  "completed_sessions_today": 25,
  "average_quiz_score": 78.5,
  "total_sessions": 1250,
  "sms_sent_today": 18,
  "airtime_disbursed": "KES 1,200"
}
```

### POST /sessions
Create new session (typically called by IVR system).

**Request Body:**
```json
{
  "call_id": "ATCallId_xyz789",
  "caller_phone": "+254712345678",
  "lesson_id": "basic-addition-001"
}
```

**Response (201):**
```json
{
  "session_id": "session_1704067200_abc123",
  "status": "created"
}
```

## Voice Webhooks (Africa's Talking)

### POST /webhooks/voice/voice
Handle incoming voice call (called by Africa's Talking).

**Request Body (from Africa's Talking):**
```json
{
  "sessionId": "ATVoiceSessionId",
  "phoneNumber": "+254712345678",
  "direction": "inbound",
  "isActive": "1"
}
```

**Response (200) - Voice XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Hello! Welcome to SoundSteps. This is a short lesson on Basic Addition.</Say>
  <GetDigits timeout="6" numDigits="1" callbackUrl="https://yourserver.com/webhooks/voice/dtmf">
    <Say>Enter your choice now.</Say>
  </GetDigits>
</Response>
```

### POST /webhooks/voice/dtmf
Process DTMF (keypad) input during call.

**Request Body (from Africa's Talking):**
```json
{
  "sessionId": "ATVoiceSessionId",
  "phoneNumber": "+254712345678", 
  "dtmfDigits": "2"
}
```

**Response (200) - Voice XML:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Correct! Two plus three equals five.</Say>
  <Say>Q1: What is 1 plus 2? Press 1 for 2, press 2 for 3...</Say>
  <GetDigits timeout="6" numDigits="1" callbackUrl="https://yourserver.com/webhooks/voice/dtmf">
    <Say>Enter your choice now.</Say>
  </GetDigits>
</Response>
```

### POST /webhooks/voice/status
Receive call status updates.

**Request Body (from Africa's Talking):**
```json
{
  "sessionId": "ATVoiceSessionId",
  "phoneNumber": "+254712345678",
  "status": "Completed",
  "duration": "180"
}
```

**Response (200):**
```json
{
  "status": "received"
}
```

## SMS Webhooks

### POST /webhooks/sms/delivery  
SMS delivery status callbacks.

**Request Body (from Africa's Talking):**
```json
{
  "id": "ATMessageId",
  "phoneNumber": "+254787654321",
  "status": "Success",
  "failureReason": null
}
```

**Response (200):**
```json
{
  "status": "received"
}
```

### POST /webhooks/sms/inbound
Handle incoming SMS responses.

**Request Body (from Africa's Talking):**
```json
{
  "from": "+254787654321",
  "text": "HELP",
  "to": "shortcode",
  "id": "ATMessageId"
}
```

**Response (200):**
```json
{
  "status": "processed"
}
```

## File Upload (Ready for Implementation)

### POST /upload/audio
Upload audio file for lessons.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data
```

**Request Body:**
```
audio: <audio_file.mp3>
lesson_id: 123
```

**Response (200):**
```json
{
  "message": "Audio uploaded successfully",
  "audio_url": "https://cdn.example.com/lessons/audio123.mp3",
  "duration": 180
}
```

## Error Responses

### Standard Error Format
```json
{
  "error": true,
  "message": "Descriptive error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error context"
  }
}
```

### Common HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully  
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required/failed
- `403 Forbidden`: Access denied
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation errors
- `500 Internal Server Error`: Server error

## Rate Limiting

**Current Limits:**
- API endpoints: 100 requests/minute per IP
- Voice webhooks: No limit (Africa's Talking controlled)
- SMS webhooks: No limit (Africa's Talking controlled)

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704067260
```

## WebSocket Events (Socket.IO)

### Connection
```javascript
const socket = io('http://localhost:3000');
```

### Events Emitted by Server
```javascript
// New call started
socket.on('call_started', {
  sessionId: 'session_123',
  callerPhone: '+254712345678',
  timestamp: '2024-01-01T10:00:00.000Z'
});

// DTMF digit received
socket.on('dtmf_received', {
  sessionId: 'session_123',
  digit: '2',
  currentState: 'q1',
  timestamp: '2024-01-01T10:01:30.000Z'
});

// Call completed
socket.on('call_completed', {
  sessionId: 'session_123',
  score: 2,
  duration: 180,
  smsSent: true,
  timestamp: '2024-01-01T10:03:00.000Z'
});

// SMS sent
socket.on('sms_sent', {
  sessionId: 'session_123',
  recipient: '+254787654321',
  status: 'success',
  timestamp: '2024-01-01T10:03:30.000Z'
});
```

## SDK Usage Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const client = axios.create({
  baseURL: 'http://localhost:3000',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

// Get lessons
const lessons = await client.get('/lessons');

// Create lesson
const newLesson = await client.post('/lessons', {
  title: 'New Lesson',
  description: 'Learn something new',
  duration: 300
});
```

### React Native (with Axios)
```javascript
import api from './api';

// Login
const { data } = await api.post('/auth/login', {
  email: 'teacher@example.com',
  password: 'password'
});

// Store token and get lessons
const lessons = await api.get('/lessons');
```

## Testing

### Using cURL
```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@soundsteps.com","password":"password"}'

# Get lessons with auth
curl -X GET http://localhost:3000/lessons \
  -H "Authorization: Bearer <jwt_token>"

# Test voice webhook
curl -X POST http://localhost:3000/webhooks/voice/voice \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test123","phoneNumber":"+254712345678"}'
```

### Postman Collection
A Postman collection with all endpoints is available at: `docs/SoundSteps-API.postman_collection.json`

## Environment Configuration

### Development
```bash
PORT=3000
JWT_SECRET=dev_secret_key
DB_PATH=./soundsteps.db
AT_API_KEY=sandbox_api_key
AT_USERNAME=sandbox
BASE_URL=http://localhost:3000
```

### Production
```bash
PORT=3000
JWT_SECRET=secure_random_production_key
DATABASE_URL=postgresql://user:pass@host:port/db
AT_API_KEY=production_api_key
AT_USERNAME=production_username
BASE_URL=https://api.soundsteps.com
SSL=true
```

This API reference provides comprehensive documentation for integrating with the SoundSteps platform. All endpoints are production-ready and include proper error handling, validation, and security measures.
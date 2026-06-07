# API Documentation

## Authentication API

### POST /api/auth/login
Authenticates a student and returns JWT token.

**Request:**
```json
{
  "studentId": "20201001",
  "password": "password123"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "محمد علي",
    "studentId": "20201001",
    "department": "هندسة البرمجيات",
    "year": 3,
    "email": "mohammed@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Cookie Set:**
```
auth-token: [JWT_TOKEN]
Flags: HttpOnly, Secure, SameSite=Lax
Max-Age: 604800 (7 days)
```

**Response (Error - 401):**
```json
{
  "success": false,
  "error": "بيانات الدخول غير صحيحة"
}
```

**Validation:**
- StudentId: Required, 8-10 digits
- Password: Required, minimum 6 characters
- Rate limited: 5 attempts per minute per IP

**HTTP Status Codes:**
- 200: Successful login
- 400: Validation error
- 401: Invalid credentials
- 429: Too many attempts
- 500: Server error

---

### POST /api/auth/logout
Clears authentication cookie and logs out the user.

**Request:**
```
POST /api/auth/logout
Headers: 
  - Cookie: auth-token=[TOKEN]
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Cookie Cleared:**
```
auth-token: (empty)
Max-Age: 0
```

---

## Chat History API

### GET /api/history
Retrieves user's chat sessions with pagination.

**Request:**
```
GET /api/history?page=1
Headers:
  - Cookie: auth-token=[TOKEN]
```

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- Page size: 10 sessions per page

**Response (200):**
```json
{
  "success": true,
  "sessions": [
    {
      "id": 1,
      "title": "محادثة الرياضيات",
      "startedAt": "2024-05-10T14:30:00Z",
      "lastActivityAt": "2024-05-10T14:45:00Z",
      "isActive": true,
      "modelUsed": "llama2"
    }
  ],
  "page": 1,
  "pageSize": 10
}
```

**Response (Unauthorized - 401):**
```json
{
  "error": "Unauthorized"
}
```

---

### POST /api/history
Creates new session or updates existing one with messages.

**Request (Create New):**
```json
{
  "title": "محادثة جديدة",
  "modelUsed": "llama2",
  "messages": [
    {
      "role": "user",
      "content": "ما هي الرياضيات؟"
    },
    {
      "role": "assistant",
      "content": "الرياضيات هي..."
    }
  ]
}
```

**Request (Update Existing):**
```json
{
  "sessionId": 1,
  "title": "محادثة الرياضيات",
  "messages": [
    {
      "role": "user",
      "content": "شكراً"
    }
  ]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "sessionId": 1,
  "message": "Session created/updated"
}
```

**Response (Unauthorized - 401):**
```json
{
  "error": "Unauthorized"
}
```

---

### DELETE /api/history
Soft deletes a chat session.

**Request:**
```
DELETE /api/history?id=1
Headers:
  - Cookie: auth-token=[TOKEN]
```

**Query Parameters:**
- `id` (required): Session ID to delete

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Session deleted"
}
```

**Response (Bad Request - 400):**
```json
{
  "error": "Session ID is required"
}
```

**Response (Unauthorized - 401):**
```json
{
  "error": "Unauthorized"
}
```

---

## Analytics API

### GET /api/analytics
Retrieves student's usage statistics and analytics.

**Request:**
```
GET /api/analytics
Headers:
  - Cookie: auth-token=[TOKEN]
```

**Response (200):**
```json
{
  "totalQuestions": 42,
  "totalSessions": 8,
  "averageSessionLength": 12.5,
  "mostAskedTopic": "الرياضيات",
  "lastActiveDate": "2024-05-10T14:45:00Z"
}
```

**Response Fields:**
- `totalQuestions`: Total number of user messages
- `totalSessions`: Total active chat sessions
- `averageSessionLength`: Average session duration in minutes
- `mostAskedTopic`: Most frequently discussed topic
- `lastActiveDate`: Last interaction timestamp

**Response (Unauthorized - 401):**
```json
{
  "error": "Unauthorized"
}
```

**Response (Error - 500):**
```json
{
  "error": "Failed to fetch analytics"
}
```

---

## Error Responses

### Common Error Format
```json
{
  "error": "Error message in Arabic or English",
  "details": "Additional details (optional)"
}
```

### HTTP Status Codes
- **200 OK**: Request successful
- **400 Bad Request**: Invalid input or validation error
- **401 Unauthorized**: Missing or invalid authentication token
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server-side error

### Rate Limiting Headers
When rate limit is reached:
```
HTTP/1.1 429 Too Many Requests
Retry-After: 45
Content-Type: application/json

{
  "error": "محاولات تسجيل دخول كثيرة. يرجى المحاولة لاحقاً.",
  "retryAfter": 45
}
```

---

## Authentication Flow

### 1. Login Process
```
Client                  Server
  |                       |
  |-- POST /api/auth/login -->|
  |      (studentId, password)|
  |                       |
  |<-- 200 + Set-Cookie --|
  |  (auth-token, user)   |
  |                       |
```

### 2. Protected Request
```
Client                  Server
  |                       |
  |-- GET /api/analytics   |
  |    Cookie: auth-token  |
  |                       |
  |-- Verify Token ------->|
  |<-- 200 + JSON --------|
  |                       |
```

### 3. Logout Process
```
Client                  Server
  |                       |
  |-- POST /api/auth/logout->|
  |    Cookie: auth-token    |
  |                       |
  |<-- 200 + Set-Cookie:0 --|
  |   (auth-token cleared)   |
  |                       |
```

---

## Request/Response Examples

### Example 1: Login and Access Protected Resource

**Step 1: Login**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"studentId":"20201001","password":"password123"}'
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "name": "محمد علي",
    "studentId": "20201001",
    "department": "هندسة البرمجيات",
    "year": 3
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Step 2: Get Analytics (using stored cookie)**
```bash
curl -X GET http://localhost:3000/api/analytics \
  -H "Cookie: auth-token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "totalQuestions": 42,
  "totalSessions": 8,
  "averageSessionLength": 12.5,
  "mostAskedTopic": "الرياضيات"
}
```

### Example 2: Create Chat Session

**Request:**
```bash
curl -X POST http://localhost:3000/api/history \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=..." \
  -d '{
    "title": "محادثة الفيزياء",
    "modelUsed": "llama2",
    "messages": [
      {"role": "user", "content": "ما هو الجاذبية؟"},
      {"role": "assistant", "content": "الجاذبية هي..."}
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "sessionId": 5,
  "message": "Session created"
}
```

### Example 3: Rate Limited Response

**Request (6th attempt within 1 minute):**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"studentId":"20201001","password":"wrong"}'
```

**Response (429):**
```json
{
  "error": "محاولات تسجيل دخول كثيرة. يرجى المحاولة لاحقاً.",
  "retryAfter": 30
}
```

---

## Client Implementation Examples

### JavaScript/TypeScript (Fetch API)

```typescript
// Login
async function login(studentId: string, password: string) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ studentId, password }),
    credentials: 'include', // Include cookies
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json();
}

// Get Analytics
async function getAnalytics() {
  const response = await fetch('/api/analytics', {
    credentials: 'include', // Include cookies
  });

  if (!response.ok) {
    throw new Error('Failed to fetch analytics');
  }

  return response.json();
}

// Logout
async function logout() {
  const response = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });

  return response.json();
}
```

### React Hook Example

```typescript
import { useState } from 'react';

export function useAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/analytics', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { analytics, loading, error, fetchAnalytics };
}
```

---

## Security Considerations

### Token Validation
- Tokens are validated on every protected request
- Tokens expire after 7 days
- Invalid or expired tokens redirect to login

### Rate Limiting
- Login attempts: 5 per minute per IP
- Protects against brute force attacks
- Returns 429 with Retry-After header

### SQL Injection Prevention
- All database queries use parameterized queries
- No string concatenation in SQL
- Prevents malicious SQL injection attacks

### CSRF Protection
- HTTP-only cookies (cannot be accessed by JavaScript)
- SameSite=Lax prevents cross-site requests
- Tokens are tied to user sessions

### Password Security
- Passwords hashed with bcryptjs (10 salt rounds)
- Never stored in plain text
- Comparison uses constant-time algorithm

---

## Pagination

### History API Pagination
```
GET /api/history?page=1  # First 10 sessions
GET /api/history?page=2  # Next 10 sessions (11-20)
```

**Response includes:**
```json
{
  "success": true,
  "sessions": [...],
  "page": 1,
  "pageSize": 10
}
```

---

## Content Types

**Request:**
- `Content-Type: application/json`

**Response:**
- `Content-Type: application/json`

---

## CORS Headers (if applicable)

```
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

---

## Changelog

### Version 1.0.0 (2024-05-10)
- Initial API release
- Authentication endpoints
- History management
- Analytics tracking
- Rate limiting

# Installation & Setup Guide

## Prerequisites
- Node.js 18+ and npm
- SQL Server 2019 or later
- Ollama installed and running

## Step 1: Install Dependencies

All required packages have been installed:
```bash
npm install
```

Required packages:
- `mssql` - SQL Server connection
- `jsonwebtoken` - JWT token generation
- `bcryptjs` - Password hashing
- `@types/jsonwebtoken` - TypeScript types
- `@types/bcryptjs` - TypeScript types
- `@types/mssql` - TypeScript types

## Step 2: Setup SQL Server Database

### Option A: Using SQL Server Management Studio (SSMS)
1. Connect to your SQL Server
2. Open the `database/schema.sql` file
3. Execute all queries to create tables and indexes
4. (Optional) Insert sample test data

### Option B: Using Command Line
```sql
sqlcmd -S localhost -U sa -P "YourPassword" -i database\schema.sql
```

### Sample Test Data
The schema.sql includes sample users:
- Student ID: `20201001`, Password: Hash for `password123`
- Student ID: `20201002`, Password: Hash for `password123`

**Important**: Use bcryptjs to hash test passwords. Run this in Node.js:
```javascript
const bcrypt = require('bcryptjs');
bcrypt.hash('password123', 10).then(hash => console.log(hash));
// Use the resulting hash in your INSERT statements
```

## Step 3: Configure Environment Variables

Update `.env.local` with your SQL Server details:

```env
# SQL Server Connection
DB_SERVER=your-server-name
DB_NAME=StudentAssistant
DB_AUTH_TYPE=default|ntlm
DB_USER=sa
DB_PASSWORD=your-password

# For Windows Authentication (Domain):
# DB_AUTH_TYPE=ntlm
# DB_DOMAIN=YOURDOMAIN

# JWT Secret (change to a long random string!)
JWT_SECRET=your-very-long-random-secret-key-at-least-32-characters

# Ollama
NEXT_PUBLIC_OLLAMA_API_URL=http://localhost:11434
NEXT_PUBLIC_DEFAULT_MODEL=llama2
```

## Step 4: Create Test User (SQL)

Connect to your database and run:

```sql
-- First, generate a bcrypt hash for password "password123"
-- Using Node.js: bcrypt.hash('password123', 10)
-- Result example: $2b$10$9Jz0k1ZzK1K0Z9z0k1ZzC.N0z0k1ZzC.N0z0k1ZzC

INSERT INTO Users (StudentId, FullName, PasswordHash, Email, Department, AcademicYear, IsActive)
VALUES 
    ('20201001', 'محمد علي', '$2b$10$9Jz0k1ZzK1K0Z9z0k1ZzC.N0z0k1ZzC.N0z0k1ZzC', 'test@example.com', 'هندسة البرمجيات', 3, 1);
```

## Step 5: Start the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
npm start
```

## Step 6: Test the Application

### Login Page
1. Navigate to `http://localhost:3000`
2. Enter a valid student ID (8-10 digits)
3. Enter the password
4. You should be redirected to the chat page

### Features to Test
- ✅ Login validation (empty fields, invalid format)
- ✅ Database connection (user verification)
- ✅ JWT token generation and storage
- ✅ Chat interface with Ollama models
- ✅ Session history and analytics
- ✅ Logout functionality

## Database Schema Overview

### Users Table
- Stores student credentials and profiles
- Unique constraint on StudentId
- Active status tracking
- Last login timestamp

### ChatSessions Table
- One-to-many relationship with Users
- Tracks chat session metadata
- Active status for soft deletes

### ChatMessages Table
- Stores individual messages within sessions
- Role field: 'user' or 'assistant'
- Support for images (base64 JSON)

### StudentAnalytics Table
- Aggregated student usage statistics
- Topic analysis and session metrics

## Troubleshooting

### SQL Connection Issues
- Verify SQL Server is running: `sqlcmd -S localhost -Q "SELECT @@VERSION"`
- Check credentials in `.env.local`
- For Windows Auth: Ensure domain is correct
- Check TCP/IP is enabled in SQL Server Configuration Manager

### Authentication Issues
- Verify JWT_SECRET is set correctly
- Check that user exists in Users table
- Verify password hash format (bcryptjs format)
- Clear browser cookies and retry

### Middleware Issues
- Ensure middleware.ts is at project root
- Check authentication routes are public (/api/auth/*)
- Verify token cookie name matches in auth.ts

### Database Query Issues
- Check SQL syntax in executeQuery calls
- Verify table and column names match schema
- Review connection pool configuration

## API Endpoints

### Authentication
- `POST /api/auth/login` - Student login (public)
- `POST /api/auth/logout` - Student logout (protected)

### Chat
- `GET /api/history` - Get user's chat sessions (protected)
- `POST /api/history` - Create/update chat session (protected)
- `DELETE /api/history?id=X` - Delete session (protected)

### Analytics
- `GET /api/analytics` - Get student analytics (protected)

## Security Considerations

✅ **Implemented:**
- HTTP-only cookies for JWT tokens
- Parameterized SQL queries (prevent injection)
- Password hashing with bcryptjs
- Rate limiting on login (5 attempts/minute)
- Middleware authentication on protected routes
- CSRF protection via HTTP-only cookies

**Recommended for Production:**
- Use environment-specific secrets manager (Azure Key Vault, AWS Secrets Manager)
- Enable HTTPS/TLS
- Implement refresh token rotation
- Add request rate limiting on all endpoints
- Set up database query logging
- Implement audit trails for user actions
- Add 2FA (Two-Factor Authentication)

## Performance Optimization

- Connection pooling configured (2-10 connections)
- Database indexes on foreign keys and common queries
- Pagination on history endpoint (10 items per page)
- Analytics calculated on-demand with caching potential

## Next Steps

1. Customize UI branding and colors in Tailwind classes
2. Add more Ollama models to ModelSelector
3. Implement real-time chat with WebSockets
4. Add file upload support
5. Integrate voice input/output
6. Add student progress tracking
7. Implement admin dashboard

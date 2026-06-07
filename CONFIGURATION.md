# Configuration Guide

## SQL Server Connection Strings

### SQL Server Authentication (Default)
```env
DB_AUTH_TYPE=default
DB_SERVER=localhost
DB_NAME=StudentAssistant
DB_USER=sa
DB_PASSWORD=YourPassword123!
```

### Windows/Domain Authentication
```env
DB_AUTH_TYPE=ntlm
DB_SERVER=DOMAIN\SERVERNAME
DB_DOMAIN=YOURDOMAIN
DB_NAME=StudentAssistant
```

### Remote SQL Server
```env
DB_SERVER=192.168.1.100,1433
DB_USER=sa
DB_PASSWORD=YourPassword123!
```

## JWT Configuration

```env
# Duration options:
# "7d" = 7 days
# "24h" = 24 hours
# "30m" = 30 minutes
JWT_SECRET=your-long-random-string-min-32-characters
JWT_EXPIRATION=7d
```

## Rate Limiting Configuration

```env
# Login attempts allowed per window
RATE_LIMIT_MAX_ATTEMPTS=5

# Time window in milliseconds
RATE_LIMIT_WINDOW=60000  # 1 minute
```

## Ollama Configuration

```env
# Ollama server URL
NEXT_PUBLIC_OLLAMA_API_URL=http://localhost:11434

# Default model (must be installed in Ollama)
# Available models: llama2, neural-chat, mistral, etc.
NEXT_PUBLIC_DEFAULT_MODEL=llama2
```

## Database Connection Pool Settings

Edit `src/lib/db.ts` to adjust:
```typescript
pool: {
  min: 2,    // Minimum connections
  max: 10,   // Maximum connections
}
```

## Timeout Configuration

Edit `src/lib/db.ts`:
```typescript
options: {
  connectTimeout: 30000,     // Connection timeout (ms)
  requestTimeout: 30000,     // Query timeout (ms)
}
```

## SSL/TLS Configuration

For SQL Server SSL connections, modify `src/lib/db.ts`:
```typescript
options: {
  encrypt: true,
  trustServerCertificate: false,  // Set to true only for self-signed certs
}
```

## Email Configuration (Optional - for password recovery)

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@example.com
```

## Logging Configuration

### Database Query Logging

Edit `src/lib/db.ts` to enable detailed logging:
```typescript
// Enable in development
if (process.env.NODE_ENV === 'development') {
  pool.on('debug', (msg: string) => console.log(msg));
}
```

### Error Logging

For production, integrate with a service like:
- Sentry
- LogRocket
- DataDog
- ELK Stack

## Cookie Configuration

### Secure Cookies (Production)

Edit `src/app/api/auth/login/route.ts`:
```typescript
response.cookies.set('auth-token', token, {
  httpOnly: true,
  secure: true,  // Only HTTPS
  sameSite: 'strict',  // Stricter CSRF protection
  domain: '.yourdomain.com',
  path: '/',
});
```

## CORS Configuration

If your API is on a different domain, add to `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        {
          key: 'Access-Control-Allow-Origin',
          value: 'https://yourdomain.com'
        },
      ]
    }
  ]
}
```

## Session Configuration

### Session Duration
- Default: 7 days
- To change: Edit `JWT_EXPIRATION` in `.env.local`

### Session Storage
- Currently: HTTP-only cookies
- Alternative: Server-side sessions (requires additional setup)

## Performance Tuning

### Database Indexes

Predefined indexes exist for:
- `Users.StudentId` (lookup by student ID)
- `ChatSessions.UserId` (get user sessions)
- `ChatMessages.SessionId` (get session messages)
- `StudentAnalytics.UserId` (get analytics)

Add custom indexes for frequently queried columns:
```sql
CREATE INDEX idx_ChatMessages_Timestamp ON ChatMessages(Timestamp DESC);
CREATE INDEX idx_ChatSessions_LastActivityAt ON ChatSessions(LastActivityAt DESC);
```

### Query Optimization

Enable query hints in `src/lib/db.ts`:
```typescript
// For large datasets
WITH (NOLOCK)  // Read uncommitted data (faster, for analytics)
```

### Caching Strategy

Recommended caching layers:
1. **Redis** - Cache session data and analytics
2. **Browser Cache** - Cache static assets (Tailwind, icons)
3. **CDN** - Distribute static files

## API Rate Limiting

### Current Implementation
- Per IP address
- 5 login attempts per minute
- In-memory store (resets on server restart)

### For Production
Use `express-rate-limit` with persistent store:
```typescript
import RedisStore from 'rate-limit-redis';
import redis from 'redis';

const client = redis.createClient();
const store = new RedisStore({
  client: client,
  prefix: 'rl:',
});
```

## Multi-Language Configuration

### Current Setup
- Arabic (RTL) - Primary language
- English (LTR) - Fallback

### To Add Languages

1. Create translation files: `src/locales/[lang].json`
2. Create locale switcher component
3. Update middleware to detect language preference
4. Update HTML dir attribute based on locale

## Monitoring & Health Checks

### Database Health Check

Create `/api/health` endpoint:
```typescript
export async function GET() {
  try {
    const result = await executeQuery('SELECT 1');
    return NextResponse.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    return NextResponse.json(
      { status: 'error', database: 'disconnected' },
      { status: 503 }
    );
  }
}
```

## Development vs Production

### Development (.env.local)
```env
NODE_ENV=development
DEBUG=true
NEXT_PUBLIC_OLLAMA_API_URL=http://localhost:11434
```

### Production (.env.production.local)
```env
NODE_ENV=production
DEBUG=false
NEXT_PUBLIC_OLLAMA_API_URL=https://ollama.yourdomain.com
JWT_SECRET=<very-long-random-string>
```

## Backup & Recovery

### Database Backup
```sql
BACKUP DATABASE StudentAssistant
TO DISK = 'C:\Backups\StudentAssistant_$(date).bak'
WITH INIT, COMPRESSION;
```

### Backup Strategy
- Daily full backups
- Hourly transaction log backups
- Test recovery procedures weekly
- Store backups offsite

## Disaster Recovery

### Recovery Point Objective (RPO)
- Data loss tolerance: 1 hour
- Implement hourly backups

### Recovery Time Objective (RTO)
- Downtime tolerance: 30 minutes
- Maintain hot standby or failover cluster

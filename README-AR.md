# Smart Student Assistant System - نظام المساعد الذكي للطلاب

A modern Next.js 14 application with student login system, SQL Server integration, real-time AI chat, and analytics dashboard.

## Features

### 🔐 Authentication System
- Arabic language support with RTL layout
- Glass-morphism login UI with animations
- SQL Server database integration
- JWT token-based authentication
- HTTP-only secure cookies
- Rate limiting (5 attempts/minute)
- Password hashing with bcryptjs

### 💬 Chat Interface
- Real-time chat with Ollama models
- Conversation history and session management
- Student analytics dashboard
- Model selection
- Message history per session

### 📊 Analytics Dashboard
- Total questions asked
- Total sessions count
- Most discussed topics
- Average session length
- Weekly/monthly activity trends

### 🎨 User Interface
- Modern gradient backgrounds with animations
- Responsive design (mobile-first)
- RTL support for Arabic content
- Glass-morphism components
- Dark mode compatible

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, React 19
- **Backend**: Next.js API Routes, TypeScript
- **Database**: SQL Server 2019+
- **Authentication**: JWT, bcryptjs
- **AI**: Ollama (local LLMs)
- **Icons**: Lucide React

## Quick Start

### 1. Prerequisites
```bash
# Required
- Node.js 18+
- SQL Server 2019+
- Ollama (download from https://ollama.ai)
```

### 2. Install Ollama Model
```bash
ollama pull llama2
ollama serve
# Ollama will run on http://localhost:11434
```

### 3. Setup Database
- Execute `database/schema.sql` in SQL Server Management Studio
- Or use: `sqlcmd -S localhost -U sa -P "password" -i database\schema.sql`

### 4. Configure Environment
```bash
# Copy and edit .env.local
cp .env.local.example .env.local

# Update with your SQL Server details
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=YourPassword
JWT_SECRET=your-long-random-secret
```

### 5. Run Application
```bash
npm install
npm run dev

# Open http://localhost:3000
```

### 6. Test Login
- Student ID: 20201001 (example from schema)
- Password: (hash password using bcryptjs)

## Project Structure

```
ollama-chat-app/
├── src/
│   ├── app/
│   │   ├── page.tsx                 # Login page
│   │   ├── chat/
│   │   │   └── page.tsx             # Chat interface
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/route.ts    # Login endpoint
│   │   │   │   └── logout/route.ts   # Logout endpoint
│   │   │   ├── history/route.ts      # Session history API
│   │   │   ├── analytics/route.ts    # Analytics API
│   │   │   ├── chat/route.ts         # Chat endpoint
│   │   │   └── models/route.ts       # Available models
│   │   └── layout.tsx                # Root layout
│   ├── components/
│   │   ├── ChatContainer.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   └── ModelSelector.tsx
│   ├── hooks/
│   │   └── useChat.ts
│   ├── lib/
│   │   ├── db.ts                    # Database connection
│   │   ├── auth.ts                  # JWT & password utilities
│   │   ├── rateLimit.ts             # Rate limiting
│   │   └── ollama.ts                # Ollama API client
│   └── types/
│       └── chat.ts
├── database/
│   └── schema.sql                    # Database schema
├── middleware.ts                     # Auth middleware
├── next.config.ts
├── tailwind.config.ts
├── INSTALLATION.md                   # Detailed setup guide
├── CONFIGURATION.md                  # Configuration options
└── README.md
```

## Database Schema

### Users
- StudentId (UNIQUE)
- FullName
- PasswordHash
- Department
- AcademicYear
- CreatedAt, LastLogin

### ChatSessions
- UserId (FK)
- SessionTitle
- ModelUsed
- StartedAt, LastActivityAt
- IsActive

### ChatMessages
- SessionId (FK)
- UserId (FK)
- Role (user/assistant)
- Content
- Images
- Timestamp

### StudentAnalytics
- UserId (FK)
- TotalQuestions
- TotalSessions
- AverageSessionLength
- MostAskedTopic
- LastActiveDate

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Student login |
| POST | `/api/auth/logout` | Student logout |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/chat` | Send message |
| GET | `/api/models` | Get available models |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history` | Get sessions (paginated) |
| POST | `/api/history` | Create/update session |
| DELETE | `/api/history?id=X` | Delete session |

### Analytics
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics` | Get user statistics |

## Authentication Flow

1. User enters credentials on login page
2. Password is sent to `/api/auth/login`
3. Server verifies against database
4. JWT token generated and stored in HTTP-only cookie
5. User redirected to `/chat`
6. Middleware validates token on protected routes
7. User info attached to request headers
8. User can access chat, history, and analytics

## Security Features

✅ **Implemented**
- SQL injection prevention (parameterized queries)
- Password hashing with bcryptjs (10 salt rounds)
- HTTP-only cookies (XSS protection)
- JWT with expiration (7 days)
- Rate limiting on login (5 attempts/minute)
- CSRF protection via SameSite cookies
- Middleware authentication on protected routes
- Secure production defaults

**Recommended for Production**
- HTTPS/TLS enforcement
- Environment secrets management
- Request rate limiting on all endpoints
- Audit logging
- Database encryption
- Two-factor authentication
- Database query monitoring

## Performance Considerations

- Connection pooling (2-10 SQL connections)
- Database indexes on foreign keys
- Pagination on history (10 items/page)
- Static asset optimization
- API response caching (optional)
- Query optimization with NOLOCK where appropriate

## Troubleshooting

### Cannot connect to SQL Server
```bash
# Test connection
sqlcmd -S localhost -U sa -P "password" -Q "SELECT @@VERSION"

# Check if SQL Server is running
Get-Service | Where-Object {$_.Name -like "*SQL*"}
```

### Login fails
- Verify user exists: `SELECT * FROM Users`
- Check password hash format
- Ensure IsActive = 1
- Check JWT_SECRET in .env.local

### Chat not working
- Verify Ollama is running: `curl http://localhost:11434/api/tags`
- Check model is installed: `ollama list`
- Pull model: `ollama pull llama2`

### Middleware issues
- Clear browser cookies
- Check token expiration
- Verify auth-token cookie exists
- Check middleware.ts path (project root)

## Development Commands

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Check for syntax errors
npm run type-check
```

## Environment Variables

See `.env.local` and `CONFIGURATION.md` for complete list.

```env
# Required
DB_SERVER=localhost
DB_NAME=StudentAssistant
DB_USER=sa
DB_PASSWORD=...
JWT_SECRET=...

# Optional
NODE_ENV=development
NEXT_PUBLIC_OLLAMA_API_URL=http://localhost:11434
NEXT_PUBLIC_DEFAULT_MODEL=llama2
```

## Documentation

- [Installation Guide](./INSTALLATION.md) - Step-by-step setup
- [Configuration Guide](./CONFIGURATION.md) - Environment and advanced config
- [Database Schema](./database/schema.sql) - SQL Server schema
- [API Documentation](./API.md) - Endpoint specifications

## Features Roadmap

- [ ] Real-time chat with WebSockets
- [ ] File upload support (PDFs, images)
- [ ] Voice input/output
- [ ] Admin dashboard
- [ ] Student progress tracking
- [ ] Multi-language support
- [ ] Dark mode toggle
- [ ] Email notifications
- [ ] Advanced analytics (charts, trends)
- [ ] OAuth integration

## Contributing

1. Create feature branch: `git checkout -b feature/name`
2. Commit changes: `git commit -am 'Add feature'`
3. Push branch: `git push origin feature/name`
4. Create Pull Request

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check existing documentation
- Review troubleshooting section

## Credits

Built with:
- Next.js by Vercel
- Ollama for local AI
- Tailwind CSS for styling
- TypeScript for type safety

---

**Last Updated**: May 2024
**Version**: 1.0.0

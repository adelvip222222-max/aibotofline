# Smart Student Assistant System - نظام المساعد الذكي للطلاب

> A complete Next.js 14 application with student authentication, AI chat, and analytics dashboard

[![Status](https://img.shields.io/badge/Status-Production%20Ready-green?style=flat-square)](.)
[![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=flat-square)](.)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](.)

## 🚀 Quick Start

**New to this project?** Read in this order:

1. **[📖 INDEX.md](./INDEX.md)** - Documentation guide (start here!)
2. **[🚀 GETTING-STARTED.md](./GETTING-STARTED.md)** - Quick overview & setup
3. **[📋 INSTALLATION.md](./INSTALLATION.md)** - Step-by-step installation
4. **[⚙️ CONFIGURATION.md](./CONFIGURATION.md)** - Configuration options
5. **[📡 API.md](./API.md)** - API endpoint documentation

## ✨ Features

- 🔐 **Secure Authentication** - JWT + bcryptjs
- 💬 **AI Chat Interface** - Ollama integration
- 📊 **Analytics Dashboard** - Student statistics
- 🌍 **Arabic RTL Support** - Full localization
- 📱 **Responsive Design** - Mobile-first approach
- 🗄️ **SQL Server Backend** - Enterprise database
- 🚀 **Production Ready** - Security & performance optimized

## 📦 What's Inside

### 🎨 Frontend
- Next.js 14 with App Router
- React 19 components
- Tailwind CSS styling
- TypeScript for type safety
- Arabic language support

### 🔧 Backend
- API routes with Next.js
- SQL Server integration
- JWT authentication
- Rate limiting
- Middleware protection

### 📚 Database
- Users table (credentials)
- ChatSessions table (conversations)
- ChatMessages table (history)
- StudentAnalytics table (statistics)

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| **Framework** | Next.js 16.2.6 |
| **UI Library** | React 19.2.4 |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 4 |
| **Database** | SQL Server 2019+ |
| **Auth** | JWT + bcryptjs |
| **Runtime** | Node.js 18+ |

## 📖 Documentation

All documentation files are organized for easy access:

| Document | Purpose |
|----------|---------|
| [INDEX.md](./INDEX.md) | 📑 Documentation index & navigation |
| [GETTING-STARTED.md](./GETTING-STARTED.md) | 🚀 Quick start guide |
| [INSTALLATION.md](./INSTALLATION.md) | 📋 Step-by-step setup |
| [CONFIGURATION.md](./CONFIGURATION.md) | ⚙️ Configuration guide |
| [API.md](./API.md) | 📡 API documentation |
| [BUILD-SUMMARY.md](./BUILD-SUMMARY.md) | 🏗️ Architecture overview |
| [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md) | ✅ Verification checklist |
| [DEPENDENCIES.md](./DEPENDENCIES.md) | 📦 Packages guide |
| [README-AR.md](./README-AR.md) | 🌍 Arabic README |

## ⚡ Quick Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
# Edit .env.local with your SQL Server details

# 3. Setup database
# Execute database/schema.sql in SQL Server

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🔐 Security

- ✅ SQL injection prevention (parameterized queries)
- ✅ Password hashing (bcryptjs 10 rounds)
- ✅ JWT tokens with expiration
- ✅ HTTP-only cookies (XSS protection)
- ✅ CSRF protection (SameSite cookies)
- ✅ Rate limiting (5 attempts/minute)
- ✅ Middleware authentication

## 📊 Database Schema

### Tables
- **Users** - Student credentials and profiles
- **ChatSessions** - Conversation tracking
- **ChatMessages** - Message history
- **StudentAnalytics** - Usage statistics

## 🌐 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/login` | Student login |
| POST | `/api/auth/logout` | Student logout |
| GET | `/api/history` | Get sessions (paginated) |
| POST | `/api/history` | Create/update session |
| DELETE | `/api/history?id=X` | Delete session |
| GET | `/api/analytics` | Get statistics |

See [API.md](./API.md) for detailed documentation.

## 🎯 Project Structure

```
src/
├── app/
│   ├── page.tsx              ← Login page
│   ├── chat/page.tsx         ← Chat interface
│   ├── layout.tsx            ← Root layout (RTL)
│   └── api/
│       ├── auth/             ← Authentication
│       ├── history/          ← Session history
│       └── analytics/        ← Analytics
├── lib/
│   ├── db.ts                 ← Database utility
│   ├── auth.ts               ← JWT utilities
│   └── rateLimit.ts          ← Rate limiting
└── components/               ← React components

database/
└── schema.sql                ← Database schema

middleware.ts                 ← Auth middleware
.env.local                    ← Configuration
```

## 🧪 Development

```bash
# Development server with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Linting
npm run lint
```

## 🐛 Troubleshooting

For common issues and solutions, see:
- [GETTING-STARTED.md - Troubleshooting](./GETTING-STARTED.md#troubleshooting)
- [INSTALLATION.md - Troubleshooting](./INSTALLATION.md#troubleshooting)

## 📱 Features

### Authentication
- Modern login interface with Arabic support
- Form validation
- Password show/hide toggle
- Error messaging
- Loading indicators

### Chat
- Real-time messaging
- Session history
- Model selection
- Message persistence

### Analytics
- Total questions asked
- Session count
- Average session length
- Most discussed topics

## 🚀 Deployment

See [SETUP-CHECKLIST.md](./SETUP-CHECKLIST.md) for production deployment steps.

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues and questions:
1. Check [INDEX.md](./INDEX.md) for documentation
2. Review [INSTALLATION.md](./INSTALLATION.md) for setup issues
3. See [API.md](./API.md) for endpoint questions
4. Check [GETTING-STARTED.md](./GETTING-STARTED.md) Troubleshooting

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

---

**Created:** May 10, 2024  
**Version:** 1.0.0  
**Status:** ✅ Production Ready

🚀 Ready to build something amazing!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
"# aibotofline" 

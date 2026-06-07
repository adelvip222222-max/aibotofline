# Dependencies and Packages Guide

## Installation Summary

All required packages have been installed via `npm install`.

---

## Production Dependencies

### Core Framework
- **next** (16.2.6) - React framework with App Router
- **react** (19.2.4) - UI library
- **react-dom** (19.2.4) - React DOM rendering

### Database & Query
- **mssql** (11.x) - SQL Server driver for Node.js
  - Supports connection pooling
  - Both SQL Server and Windows authentication
  - Transaction support

### Authentication & Security
- **jsonwebtoken** - JWT token generation and verification
  - Sign tokens: `jwt.sign(payload, secret, options)`
  - Verify tokens: `jwt.verify(token, secret)`
  - Used for: 7-day session tokens
  
- **bcryptjs** - Password hashing
  - Hash passwords: `bcrypt.hash(password, 10)`
  - Compare passwords: `bcrypt.compare(plain, hashed)`
  - Salt rounds: 10 (security/performance balance)

### HTTP Client
- **axios** - Promise-based HTTP client
  - Used for: Optional (Next.js has built-in fetch)
  - Can be used for external API calls

### Markdown & Rendering
- **react-markdown** (10.1.0) - Render markdown in React
- **remark-gfm** (4.0.1) - GitHub Flavored Markdown support

### UI Icons
- **lucide-react** (1.14.0) - Icon library
  - Eye, EyeOff - Password visibility toggle
  - Loader2 - Loading spinner
  - Menu, X - Navigation menu
  - LogOut - Logout icon
  - BarChart3 - Analytics icon
  - Plus - Add new button

---

## Development Dependencies

### TypeScript & Type Definitions
- **typescript** (5.x) - Type checking and compilation
- **@types/node** (20.19.40) - Node.js type definitions
- **@types/react** (19.x) - React type definitions
- **@types/react-dom** (19.x) - React DOM type definitions
- **@types/jsonwebtoken** - JWT types
- **@types/bcryptjs** - bcryptjs types
- **@types/mssql** - SQL Server driver types

### Styling
- **tailwindcss** (4.x) - Utility-first CSS framework
- **@tailwindcss/postcss** (4.x) - Tailwind PostCSS plugin
- **postcss** - CSS processing
- **autoprefixer** - Vendor prefix automation

### Linting & Code Quality
- **eslint** (9.x) - Code quality tool
- **eslint-config-next** (16.2.6) - Next.js ESLint config

### Build Tools (Implicit)
- **next build** - Next.js build system (included with next)
- **webpack** - Module bundler (included with next)
- **babel** - JavaScript transpiler (included with next)

---

## Package Compatibility

### Node.js Version
```
Required: Node.js 18.0+
Recommended: Node.js 20+ LTS
```

### npm Version
```
Required: npm 8.0+
Recommended: npm 10+
```

### Operating Systems
```
✅ Windows (10, 11, Server 2019+)
✅ macOS (Intel and Apple Silicon)
✅ Linux (Ubuntu, Debian, CentOS, etc.)
```

---

## Installation Commands Reference

### Install All Dependencies
```bash
npm install
# Installs all packages in package.json
```

### Install Specific Package
```bash
# Production dependency
npm install package-name

# Development dependency
npm install --save-dev package-name

# Global installation (not recommended for project dependencies)
npm install -g package-name
```

### Update Packages
```bash
# Update all packages to latest minor version
npm update

# Update specific package
npm update package-name

# Check for outdated packages
npm outdated
```

### Remove Package
```bash
npm uninstall package-name
```

---

## Import/Usage Examples

### Using mssql
```typescript
import sql from 'mssql';

const pool = new sql.ConnectionPool(config);
await pool.connect();

const request = pool.request();
request.input('param', sql.Int, value);
const result = await request.query('SELECT * FROM table WHERE id = @param');
```

### Using jsonwebtoken
```typescript
import jwt from 'jsonwebtoken';

// Generate token
const token = jwt.sign({ userId: 1 }, 'secret', { expiresIn: '7d' });

// Verify token
const decoded = jwt.verify(token, 'secret');
```

### Using bcryptjs
```typescript
import bcrypt from 'bcryptjs';

// Hash password
const hash = await bcrypt.hash('password123', 10);

// Compare password
const isValid = await bcrypt.compare('password123', hash);
```

### Using Lucide Icons
```typescript
import { Eye, EyeOff, Loader2, Menu } from 'lucide-react';

// Usage in JSX
<Eye size={20} />
<Loader2 size={20} className="animate-spin" />
<Menu size={24} />
```

### Using Tailwind CSS
```tsx
<div className="bg-gradient-to-r from-blue-500 to-purple-600">
  <h1 className="text-white text-2xl font-bold">Title</h1>
</div>
```

---

## Version Constraints

### Why Specific Versions?

- **"16.2.6"** (exact) - Next.js: Critical framework, pinned for stability
- **"19.2.4"** (exact) - React: Core dependency, pinned for compatibility
- **"5.x"** (minor version) - TypeScript: Development, allows patches
- **"^1.14.0"** (caret) - lucide-react: Minor updates allowed

---

## File Changes Summary

### package.json
```json
{
  "dependencies": {
    "next": "16.2.6",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "react-markdown": "^10.1.0",
    "remark-gfm": "^4.0.1",
    "mssql": "latest",           // ← Added
    "jsonwebtoken": "latest",    // ← Added
    "bcryptjs": "latest",        // ← Added
    "axios": "latest"            // ← Added
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20.19.40",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "@types/jsonwebtoken": "latest",  // ← Added
    "@types/bcryptjs": "latest",      // ← Added
    "@types/mssql": "latest",         // ← Added
    "eslint": "^9",
    "eslint-config-next": "16.2.6",
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4"
  }
}
```

---

## Dependency Tree

```
ollama-chat-app
├── next (16.2.6)
│   ├── react (19.2.4)
│   ├── react-dom (19.2.4)
│   └── webpack, babel, etc.
│
├── mssql (Database)
│   └── tedious (TDS protocol)
│
├── jsonwebtoken (Auth)
│   └── jsonschema
│
├── bcryptjs (Security)
│   └── [no dependencies]
│
├── axios (HTTP)
│   └── follow-redirects
│
├── react-markdown (Content)
│   ├── react
│   └── remark, unified
│
├── lucide-react (Icons)
│   └── react
│
└── tailwindcss (Styling)
    ├── autoprefixer
    └── postcss
```

---

## Security Recommendations

### Keep Packages Updated
```bash
# Check for security vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# Fix with breaking changes (careful!)
npm audit fix --force
```

### Lock File (package-lock.json)
- Ensures reproducible installations
- Commit to version control
- Don't manually edit

### Peer Dependencies
All peer dependencies (react, react-dom) are satisfied.

---

## Performance Notes

### Package Sizes
```
mssql        - ~2 MB
jsonwebtoken - ~300 KB
bcryptjs     - ~1 MB
axios        - ~500 KB
lucide-react - ~500 KB (tree-shakeable)
tailwindcss  - ~30 MB (dev only)
```

### Bundle Impact
Only production dependencies are included in the final build:
- mssql: Only used server-side (not in browser)
- jsonwebtoken: Only used server-side
- bcryptjs: Only used server-side
- react-markdown: Included (used in chat)
- lucide-react: Included (used in UI)
- tailwindcss: Compiled to CSS (included)

---

## Troubleshooting

### "Cannot find module 'mssql'"
```bash
# Solution:
npm install mssql
npm install --save-dev @types/mssql
```

### "jsonwebtoken requires Node.js X"
```bash
# Check Node version
node --version

# Solution: Update Node.js to 18+
```

### npm Install Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and lock file
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Port Already in Use (dev server)
```bash
# Use different port
npm run dev -- -p 3001
```

---

## Next Steps

1. ✅ All packages installed
2. ✅ Ready to run: `npm run dev`
3. ✅ Ready to build: `npm run build`
4. ✅ Ready to deploy

See INSTALLATION.md for database setup.

---

## Additional Resources

### Official Documentation
- Next.js: https://nextjs.org/docs
- React: https://react.dev
- mssql npm: https://www.npmjs.com/package/mssql
- jsonwebtoken: https://www.npmjs.com/package/jsonwebtoken
- bcryptjs: https://www.npmjs.com/package/bcryptjs
- Tailwind CSS: https://tailwindcss.com/docs
- Lucide Icons: https://lucide.dev

### Package Managers
- npm: https://www.npmjs.com
- Yarn: https://yarnpkg.com (alternative)
- pnpm: https://pnpm.io (alternative, faster)

---

**Last Updated:** May 10, 2024
**Package Version Status:** Current
**All Dependencies:** ✅ Installed

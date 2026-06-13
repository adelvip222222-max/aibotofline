# Admin / Developer / Translator Update

## Added

- `/admin`: admin panel for all users.
  - Search users.
  - View user activity counts.
  - Reset any user's password.
  - Activate/deactivate users.
  - Change user role: `student`, `admin`, `developer`, `owner`.
- `/developer`: developer monitoring panel.
  - Server OS, CPU, memory, uptime.
  - Node.js process info.
  - SQL Server health check.
  - Ollama health check and installed models.
- `/translator`: public offline student translator.
  - English to Arabic.
  - Arabic to English.
  - Auto mode.
  - Uses local Ollama `OLLAMA_TEXT_MODEL`, no external API.
- API routes:
  - `GET /api/admin/overview`
  - `GET /api/admin/users`
  - `PATCH /api/admin/users/:studentCode`
  - `GET /api/developer/status`
  - `POST /api/translate`

## Security

- `/admin`, `/developer`, `/api/admin/*`, and `/api/developer/*` are protected.
- Users with DB roles `admin`, `developer`, `owner`, or `super_admin` can access.
- You can also set admin codes in `.env`:

```env
ADMIN_STUDENT_CODES=12325,10001
```

## Offline Translator

The translator is public for students and uses:

```env
OLLAMA_TEXT_MODEL=qwen2.5:14b
OLLAMA_BASE_URL=http://127.0.0.1:11434
```

## Notes

- The admin API auto-adds missing `Role`, `LockedUntil`, `LastLogin`, `CreatedAt`, `Email`, and `UserGroup` columns to `Users` if needed.
- `crypto.randomUUID` fallback was added so chat sending works on HTTP/IP deployments.
- `NEXTAUTH_SECRET || AUTH_SECRET` is now supported consistently.

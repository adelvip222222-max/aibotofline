import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type sql from "mssql";

export function getAuthSecret() {
  return process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET;
}

export function getAdminCodes() {
  return (process.env.ADMIN_STUDENT_CODES || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isAdminLike(token: any) {
  const role = String(token?.role || "").toLowerCase();
  const studentCode = String(token?.studentId || token?.sub || "");

  return ["admin", "owner", "developer", "super_admin"].includes(role) || getAdminCodes().includes(studentCode);
}

export async function requireAdmin(request: NextRequest) {
  const token = await getToken({ req: request, secret: getAuthSecret() });
  if (!token) {
    return { token: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (!isAdminLike(token)) {
    return { token, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return { token, response: null };
}

export async function ensureAdminSchema(pool: sql.ConnectionPool) {
  const result = await pool.request().query(`
    SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'Users'
  `);

  const columns = new Set(result.recordset.map((row: any) => String(row.COLUMN_NAME).toLowerCase()));
  const statements: string[] = [];

  if (!columns.has("role")) statements.push("ALTER TABLE Users ADD Role NVARCHAR(20) NULL");
  if (!columns.has("lockeduntil")) statements.push("ALTER TABLE Users ADD LockedUntil DATETIME2 NULL");
  if (!columns.has("lastlogin")) statements.push("ALTER TABLE Users ADD LastLogin DATETIME2 NULL");
  if (!columns.has("createdat")) statements.push("ALTER TABLE Users ADD CreatedAt DATETIME2 NULL CONSTRAINT DF_Users_CreatedAt DEFAULT GETDATE() WITH VALUES");
  if (!columns.has("email")) statements.push("ALTER TABLE Users ADD Email NVARCHAR(100) NULL");
  if (!columns.has("usergroup")) statements.push("ALTER TABLE Users ADD UserGroup NVARCHAR(100) NULL");

  for (const statement of statements) {
    await pool.request().query(statement);
  }

  await pool.request().query("UPDATE Users SET Role = 'student' WHERE Role IS NULL OR Role = ''");
}

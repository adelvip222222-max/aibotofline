import { NextRequest, NextResponse } from "next/server";
import sql from "mssql";
import { connectToDB } from "../../../lib/db";
import { ensureAdminSchema, requireAdmin } from "../../../lib/admin";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.response) return auth.response;

    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") || "1"));
    const pageSize = Math.min(100, Math.max(10, parseInt(request.nextUrl.searchParams.get("pageSize") || "25")));
    const search = (request.nextUrl.searchParams.get("search") || "").trim();
    const offset = (page - 1) * pageSize;
    const like = `%${search}%`;

    const pool = await connectToDB();
    await ensureAdminSchema(pool);

    const usersResult = await pool
      .request()
      .input("search", sql.NVarChar, search)
      .input("like", sql.NVarChar, like)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, pageSize)
      .query(`
        WITH MessageStats AS (
          SELECT
            StudentCode,
            COUNT(*) AS TotalMessages,
            COUNT(DISTINCT SessionId) AS TotalSessions,
            MAX(Timestamp) AS LastMessageAt
          FROM ChatMessages
          GROUP BY StudentCode
        )
        SELECT
          U.Id,
          U.StudentCode,
          U.FullName,
          U.Email,
          U.UserGroup,
          ISNULL(U.Role, 'student') AS Role,
          ISNULL(U.IsActive, 1) AS IsActive,
          U.CreatedAt,
          U.LastLogin,
          U.LockedUntil,
          ISNULL(M.TotalMessages, 0) AS TotalMessages,
          ISNULL(M.TotalSessions, 0) AS TotalSessions,
          M.LastMessageAt
        FROM Users U
        LEFT JOIN MessageStats M ON M.StudentCode = U.StudentCode
        WHERE @search = ''
          OR U.StudentCode LIKE @like
          OR U.FullName LIKE @like
          OR ISNULL(U.Email, '') LIKE @like
          OR ISNULL(U.UserGroup, '') LIKE @like
        ORDER BY U.CreatedAt DESC, U.Id DESC
        OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
      `);

    const countResult = await pool
      .request()
      .input("search", sql.NVarChar, search)
      .input("like", sql.NVarChar, like)
      .query(`
        SELECT COUNT(*) AS Total
        FROM Users U
        WHERE @search = ''
          OR U.StudentCode LIKE @like
          OR U.FullName LIKE @like
          OR ISNULL(U.Email, '') LIKE @like
          OR ISNULL(U.UserGroup, '') LIKE @like
      `);

    return NextResponse.json({
      success: true,
      page,
      pageSize,
      total: Number(countResult.recordset[0]?.Total || 0),
      users: usersResult.recordset.map((row: any) => ({
        id: row.Id,
        studentCode: row.StudentCode,
        fullName: row.FullName,
        email: row.Email || "",
        group: row.UserGroup || "",
        role: row.Role || "student",
        isActive: Boolean(row.IsActive),
        createdAt: row.CreatedAt,
        lastLogin: row.LastLogin,
        lockedUntil: row.LockedUntil,
        totalMessages: Number(row.TotalMessages || 0),
        totalSessions: Number(row.TotalSessions || 0),
        lastMessageAt: row.LastMessageAt,
      })),
    });
  } catch (error: any) {
    console.error("Admin users GET error:", error);
    return NextResponse.json({ error: "Failed to load users", details: error.message }, { status: 500 });
  }
}

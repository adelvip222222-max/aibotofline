import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from "../../../lib/db";
import { ensureAdminSchema, requireAdmin } from "../../../lib/admin";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth.response) return auth.response;

    const pool = await connectToDB();
    await ensureAdminSchema(pool);

    const result = await pool.request().query(`
      SELECT
        (SELECT COUNT(*) FROM Users) AS TotalUsers,
        (SELECT COUNT(*) FROM Users WHERE ISNULL(IsActive, 1) = 1) AS ActiveUsers,
        (SELECT COUNT(*) FROM Users WHERE ISNULL(IsActive, 1) = 0) AS DisabledUsers,
        (SELECT COUNT(*) FROM ChatSessions WHERE ISNULL(IsActive, 1) = 1) AS ActiveSessions,
        (SELECT COUNT(*) FROM ChatMessages WHERE Role = 'user') AS UserQuestions,
        (SELECT COUNT(*) FROM ChatMessages WHERE Role = 'assistant') AS AssistantAnswers,
        (SELECT COUNT(*) FROM ChatMessages WHERE Timestamp >= DATEADD(day, -1, GETDATE())) AS Messages24h
    `);

    const recent = await pool.request().query(`
      SELECT TOP 8 U.StudentCode, U.FullName, U.UserGroup, U.LastLogin,
        COUNT(M.Id) AS MessageCount,
        MAX(M.Timestamp) AS LastMessageAt
      FROM Users U
      LEFT JOIN ChatMessages M ON M.StudentCode = U.StudentCode
      GROUP BY U.StudentCode, U.FullName, U.UserGroup, U.LastLogin
      ORDER BY LastMessageAt DESC, U.LastLogin DESC
    `);

    return NextResponse.json({ success: true, stats: result.recordset[0] || {}, recent: recent.recordset });
  } catch (error: any) {
    console.error("Admin overview error:", error);
    return NextResponse.json({ error: "Failed to load overview", details: error.message }, { status: 500 });
  }
}

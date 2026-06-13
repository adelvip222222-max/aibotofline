import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import sql from "mssql";
import { connectToDB } from "../../lib/db";

export async function GET(req: NextRequest) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const studentCode = token.studentId as string;
    const pool = await connectToDB();

    const statsResult = await pool
      .request()
      .input("studentCode", sql.NVarChar, studentCode)
      .query(`
        SELECT
          SUM(CASE WHEN Role = 'user' THEN 1 ELSE 0 END) AS TotalQuestions,
          SUM(CASE WHEN Role = 'assistant' THEN 1 ELSE 0 END) AS TotalAnswers,
          COUNT(DISTINCT SessionId) AS TotalSessions
        FROM ChatMessages
        WHERE StudentCode = @studentCode
      `);

    const avgResult = await pool
      .request()
      .input("studentCode", sql.NVarChar, studentCode)
      .query(`
        SELECT AVG(NULLIF(DATEDIFF(SECOND, StartedAt, LastActivityAt), 0)) AS AvgSeconds
        FROM ChatSessions
        WHERE StudentCode = @studentCode AND IsActive = 1
      `);

    const topicResult = await pool
      .request()
      .input("studentCode", sql.NVarChar, studentCode)
      .query(`
        SELECT TOP 1 Content AS MostAskedTopic
        FROM ChatMessages
        WHERE StudentCode = @studentCode AND Role = 'user' AND LEN(Content) > 0
        GROUP BY Content
        ORDER BY COUNT(*) DESC, MAX(Timestamp) DESC
      `);

    const sessionsResult = await pool
      .request()
      .input("studentCode", sql.NVarChar, studentCode)
      .query(`
        SELECT TOP 10 Id AS SessionId, SessionTitle, ModelUsed, StartedAt, LastActivityAt
        FROM ChatSessions
        WHERE StudentCode = @studentCode AND IsActive = 1
        ORDER BY LastActivityAt DESC
      `);

    const row = statsResult.recordset[0] || {};
    const avgSeconds = Number(avgResult.recordset[0]?.AvgSeconds || 0);

    return NextResponse.json({
      success: true,
      stats: {
        totalQuestions: Number(row.TotalQuestions || 0),
        totalAnswers: Number(row.TotalAnswers || 0),
        totalSessions: Number(row.TotalSessions || 0),
        averageSessionLength: avgSeconds / 60,
        mostAskedTopic: topicResult.recordset[0]?.MostAskedTopic || "",
      },
      recentSessions: sessionsResult.recordset,
    });
  } catch (error: any) {
    console.error("Analytics error:", error.message);
    return NextResponse.json({ error: "حدث خطأ في جلب الإحصائيات", details: error.message }, { status: 500 });
  }
}

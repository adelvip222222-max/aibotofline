import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import sql from "mssql";
import { connectToDB } from "../../lib/db";

export async function GET(req: NextRequest) {
  try {
    // 1. التحقق من جلسة NextAuth
    const token = await getToken({ 
      req, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const studentCode = token.studentId as string;

    const pool = await connectToDB();

    // 2. جلب إحصائيات الطالب من ChatMessages
    const statsResult = await pool
      .request()
      .input("studentCode", sql.NVarChar, studentCode)
      .query(`
        SELECT 
          COUNT(*) AS TotalQuestions,
          COUNT(DISTINCT SessionId) AS TotalSessions
        FROM ChatMessages 
        WHERE StudentCode = @studentCode
      `);

    // 3. جلب متوسط مدة الجلسة
    const avgResult = await pool
      .request()
      .input("studentCode", sql.NVarChar, studentCode)
      .query(`
        SELECT 
          AVG(DATEDIFF(MINUTE, StartedAt, LastActivityAt)) AS AvgMinutes
        FROM ChatSessions 
        WHERE StudentCode = @studentCode AND IsActive = 1
      `);

    // 4. جلب أكثر المواضيع طلباً
    const topicResult = await pool
      .request()
      .input("studentCode", sql.NVarChar, studentCode)
      .query(`
        SELECT TOP 1 
          Content AS MostAskedTopic
        FROM ChatMessages 
        WHERE StudentCode = @studentCode AND Role = 'user'
        GROUP BY Content
        ORDER BY COUNT(*) DESC
      `);

    // 5. جلب آخر 10 جلسات
    const sessionsResult = await pool
      .request()
      .input("studentCode", sql.NVarChar, studentCode)
      .query(`
        SELECT TOP 10 
          Id AS SessionId,
          SessionTitle,
          ModelUsed,
          StartedAt,
          LastActivityAt
        FROM ChatSessions 
        WHERE StudentCode = @studentCode AND IsActive = 1
        ORDER BY LastActivityAt DESC
      `);

    await pool.close();

    // 6. تجميع النتائج
    const stats = {
      totalQuestions: statsResult.recordset[0]?.TotalQuestions || 0,
      totalSessions: statsResult.recordset[0]?.TotalSessions || 0,
      averageSessionLength: avgResult.recordset[0]?.AvgMinutes || 0,
      mostAskedTopic: topicResult.recordset[0]?.MostAskedTopic || "",
    };

    return NextResponse.json({
      success: true,
      stats: stats,
      recentSessions: sessionsResult.recordset,
    });
  } catch (error: any) {
    console.error("Analytics error:", error.message);
    return NextResponse.json(
      { error: "حدث خطأ في جلب الإحصائيات", details: error.message },
      { status: 500 }
    );
  }
}
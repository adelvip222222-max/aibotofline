import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDB } from "../../../lib/db"; // تأكد من أن مسار الاتصال بقاعدة البيانات صحيح
import sql from 'mssql';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const sessionId = parseInt(id);
    const studentCode = token.studentId as string;

    const pool = await connectToDB();
    const result = await pool
      .request()
      .input("sessionId", sql.Int, sessionId)
      .input("studentCode", sql.NVarChar, studentCode)
      .query(`
        SELECT Id, Role, Content, Timestamp
        FROM ChatMessages
        WHERE SessionId = @sessionId AND StudentCode = @studentCode
        ORDER BY Timestamp ASC
      `);
    await pool.close();

    console.log(`📩 Loaded ${result.recordset.length} messages for session ${sessionId}`);

    return NextResponse.json({
      success: true,
      messages: result.recordset,
    });
  } catch (error: any) {
    console.error('Load session error:', error);
    return NextResponse.json({ error: 'Failed to load session' }, { status: 500 });
  }
}
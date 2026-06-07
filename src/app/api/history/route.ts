import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectToDB } from '../../lib/db';
import sql from 'mssql';

export async function GET(request: NextRequest) {
  try {
    // 1. التحقق من جلسة NextAuth
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. جلب رقم الصفحة
    const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
    const pageSize = 10;
    const offset = (page - 1) * pageSize;

    // 3. الاتصال بقاعدة البيانات وجلب جلسات هذا الطالب
    const pool = await connectToDB();
    const result = await pool
      .request()
      .input("studentCode", sql.NVarChar, token.studentId as string)
      .input("offset", sql.Int, offset)
      .input("pageSize", sql.Int, pageSize)
      .query(`
        SELECT Id, SessionTitle as title, ModelUsed, StartedAt, LastActivityAt, IsActive 
        FROM ChatSessions 
        WHERE StudentCode = @studentCode AND IsActive = 1
        ORDER BY StartedAt DESC
        OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
      `);
    await pool.close();

    return NextResponse.json({
      success: true,
      sessions: result.recordset,
      page,
      pageSize,
    });
  } catch (error: any) {
    console.error('History GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. التحقق من جلسة NextAuth
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, title, modelUsed, messages } = body;
    const studentCode = token.studentId as string;

    const pool = await connectToDB();

    if (sessionId) {
      // تحديث جلسة موجودة
      await pool.request()
        .input("sessionId", sql.Int, sessionId)
        .input("studentCode", sql.NVarChar, studentCode)
        .input("title", sql.NVarChar, title || 'Untitled Chat')
        .query(`
          UPDATE ChatSessions 
          SET SessionTitle = @title, LastActivityAt = GETDATE() 
          WHERE Id = @sessionId AND StudentCode = @studentCode
        `);

      // حفظ الرسائل
      if (messages) {
        for (const msg of messages) {
          await pool.request()
            .input("sessionId", sql.Int, sessionId)
            .input("studentCode", sql.NVarChar, studentCode)
            .input("role", sql.NVarChar, msg.role)
            .input("content", sql.NVarChar, msg.content)
            .query(`
              INSERT INTO ChatMessages (SessionId, StudentCode, Role, Content, Timestamp)
              VALUES (@sessionId, @studentCode, @role, @content, GETDATE())
            `);
        }
      }
      await pool.close();
      return NextResponse.json({ success: true, sessionId, message: 'Session updated' });

    } else {
      // إنشاء جلسة جديدة
      const result = await pool.request()
        .input("studentCode", sql.NVarChar, studentCode)
        .input("title", sql.NVarChar, title || 'New Chat')
        .input("model", sql.NVarChar, modelUsed || 'llama3')
        .query(`
          INSERT INTO ChatSessions (StudentCode, SessionTitle, ModelUsed)
          OUTPUT inserted.Id
          VALUES (@studentCode, @title, @model)
        `);
      
      const newSessionId = result.recordset[0].Id;

      // حفظ الرسائل
      if (messages) {
        for (const msg of messages) {
          await pool.request()
            .input("sessionId", sql.Int, newSessionId)
            .input("studentCode", sql.NVarChar, studentCode)
            .input("role", sql.NVarChar, msg.role)
            .input("content", sql.NVarChar, msg.content)
            .query(`
              INSERT INTO ChatMessages (SessionId, StudentCode, Role, Content, Timestamp)
              VALUES (@sessionId, @studentCode, @role, @content, GETDATE())
            `);
        }
      }
      await pool.close();
      return NextResponse.json({ success: true, sessionId: newSessionId, message: 'Session created' });
    }
  } catch (error: any) {
    console.error('History POST error:', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 1. التحقق من جلسة NextAuth
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get('id');
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    const studentCode = token.studentId as string;

    const pool = await connectToDB();
    await pool.request()
      .input("sessionId", sql.Int, parseInt(sessionId))
      .input("studentCode", sql.NVarChar, studentCode)
      .query('UPDATE ChatSessions SET IsActive = 0 WHERE Id = @sessionId AND StudentCode = @studentCode');
    await pool.close();

    return NextResponse.json({ success: true, message: 'Session deleted' });
  } catch (error: any) {
    console.error('History DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
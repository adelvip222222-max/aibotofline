import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectToDB } from "../../lib/db";
import sql from "mssql";

function normalizeSession(row: any) {
  return {
    id: row.Id,
    title: row.title || row.SessionTitle || "محادثة بدون عنوان",
    modelUsed: row.ModelUsed || "",
    startedAt: row.StartedAt,
    lastActivityAt: row.LastActivityAt,
    isActive: row.IsActive,
  };
}

export async function GET(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const page = Math.max(1, parseInt(request.nextUrl.searchParams.get("page") || "1"));
    const pageSize = Math.min(50, Math.max(10, parseInt(request.nextUrl.searchParams.get("pageSize") || "20")));
    const offset = (page - 1) * pageSize;

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
        ORDER BY LastActivityAt DESC, StartedAt DESC
        OFFSET @offset ROWS FETCH NEXT @pageSize ROWS ONLY
      `);

    return NextResponse.json({
      success: true,
      sessions: result.recordset.map(normalizeSession),
      page,
      pageSize,
    });
  } catch (error: any) {
    console.error("History GET error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { sessionId, title, modelUsed, messages } = body;
    const studentCode = token.studentId as string;
    const pool = await connectToDB();

    if (sessionId) {
      await pool
        .request()
        .input("sessionId", sql.Int, sessionId)
        .input("studentCode", sql.NVarChar, studentCode)
        .input("title", sql.NVarChar, title || "محادثة بدون عنوان")
        .query(`
          UPDATE ChatSessions
          SET SessionTitle = @title, LastActivityAt = GETDATE()
          WHERE Id = @sessionId AND StudentCode = @studentCode
        `);

      if (Array.isArray(messages)) {
        for (const msg of messages) {
          await pool
            .request()
            .input("sessionId", sql.Int, sessionId)
            .input("studentCode", sql.NVarChar, studentCode)
            .input("role", sql.NVarChar, msg.role)
            .input("content", sql.NVarChar(sql.MAX), msg.content || "")
            .query(`
              INSERT INTO ChatMessages (SessionId, StudentCode, Role, Content, Timestamp)
              VALUES (@sessionId, @studentCode, @role, @content, GETDATE())
            `);
        }
      }

      return NextResponse.json({ success: true, sessionId, message: "Session updated" });
    }

    const result = await pool
      .request()
      .input("studentCode", sql.NVarChar, studentCode)
      .input("title", sql.NVarChar, title || "محادثة جديدة")
      .input("model", sql.NVarChar, modelUsed || process.env.OLLAMA_TEXT_MODEL || "qwen2.5:14b")
      .query(`
        INSERT INTO ChatSessions (StudentCode, SessionTitle, ModelUsed)
        OUTPUT inserted.Id
        VALUES (@studentCode, @title, @model)
      `);

    const newSessionId = result.recordset[0].Id;

    if (Array.isArray(messages)) {
      for (const msg of messages) {
        await pool
          .request()
          .input("sessionId", sql.Int, newSessionId)
          .input("studentCode", sql.NVarChar, studentCode)
          .input("role", sql.NVarChar, msg.role)
          .input("content", sql.NVarChar(sql.MAX), msg.content || "")
          .query(`
            INSERT INTO ChatMessages (SessionId, StudentCode, Role, Content, Timestamp)
            VALUES (@sessionId, @studentCode, @role, @content, GETDATE())
          `);
      }
    }

    return NextResponse.json({ success: true, sessionId: newSessionId, message: "Session created" });
  } catch (error: any) {
    console.error("History POST error:", error);
    return NextResponse.json({ error: "Failed to save session" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const sessionId = request.nextUrl.searchParams.get("id");
    if (!sessionId) return NextResponse.json({ error: "Session ID is required" }, { status: 400 });

    const pool = await connectToDB();
    await pool
      .request()
      .input("sessionId", sql.Int, parseInt(sessionId))
      .input("studentCode", sql.NVarChar, token.studentId as string)
      .query("UPDATE ChatSessions SET IsActive = 0 WHERE Id = @sessionId AND StudentCode = @studentCode");

    return NextResponse.json({ success: true, message: "Session deleted" });
  } catch (error: any) {
    console.error("History DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete session" }, { status: 500 });
  }
}

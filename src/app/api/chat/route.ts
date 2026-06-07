import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectToDB } from "../../lib/db"; // تأكد من أن مسار الاتصال بقاعدة البيانات صحيح
import sql from "mssql";

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    const studentCode = token?.studentId as string || "guest";

    const body = await request.json();
    const OLLAMA_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";

    // ✅ حفظ رسالة المستخدم
    let sessionId: number | null = null;
    
    if (studentCode !== "guest" && body.messages?.length > 0) {
      try {
        const lastMessage = body.messages[body.messages.length - 1];
        const pool = await connectToDB();
        
        // إنشاء جلسة جديدة أو استخدام الموجودة
        let sessionResult = await pool
          .request()
          .input("studentCode", sql.NVarChar, studentCode)
          .query(`
            SELECT TOP 1 Id FROM ChatSessions 
            WHERE StudentCode = @studentCode AND IsActive = 1 
            ORDER BY LastActivityAt DESC
          `);
        
        if (sessionResult.recordset.length > 0) {
          sessionId = sessionResult.recordset[0].Id;
          await pool.request()
            .input("sessionId", sql.Int, sessionId)
            .query("UPDATE ChatSessions SET LastActivityAt = GETDATE() WHERE Id = @sessionId");
        } else {
          const newSession = await pool
            .request()
            .input("studentCode", sql.NVarChar, studentCode)
            .input("title", sql.NVarChar, lastMessage.content?.substring(0, 100) || "محادثة جديدة")
            .input("model", sql.NVarChar, body.model || "llama3")
            .query(`
              INSERT INTO ChatSessions (StudentCode, SessionTitle, ModelUsed)
              OUTPUT inserted.Id
              VALUES (@studentCode, @title, @model)
            `);
          sessionId = newSession.recordset[0].Id;
        }
        
        // حفظ رسالة المستخدم
        await pool.request()
          .input("sessionId", sql.Int, sessionId)
          .input("studentCode", sql.NVarChar, studentCode)
          .input("role", sql.NVarChar, "user")
          .input("content", sql.NVarChar, lastMessage.content || "")
          .query(`
            INSERT INTO ChatMessages (SessionId, StudentCode, Role, Content)
            VALUES (@sessionId, @studentCode, @role, @content)
          `);
        
        await pool.close();
      } catch (dbError: any) {
        console.error("Database save error:", dbError.message);
      }
    }

    // إرسال الطلب إلى Ollama
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: body.model || "llama3",
        messages: body.messages,
        stream: true, // ✅ Streaming
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(errText, { status: response.status });
    }

    // ✅ للـ Streaming: نرجع الـ stream كما هو
    return new Response(response.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
    
  } catch (error: any) {
    console.error("Chat API error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const OLLAMA_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
    const res = await fetch(`${OLLAMA_URL}/api/tags`);
    const data = await res.json();
    return NextResponse.json({ models: data.models?.map((m: any) => m.name) || [] });
  } catch {
    return NextResponse.json({ models: ["llama3"] });
  }
}
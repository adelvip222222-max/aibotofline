import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { connectToDB } from "../../../lib/db";
import sql from "mssql";

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await context.params;
    const sessionId = parseInt(id);
    if (!sessionId || Number.isNaN(sessionId)) {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 });
    }

    const pool = await connectToDB();
    const result = await pool
      .request()
      .input("sessionId", sql.Int, sessionId)
      .input("studentCode", sql.NVarChar, token.studentId as string)
      .query(`
        SELECT Id, Role, Content, Timestamp
        FROM ChatMessages
        WHERE SessionId = @sessionId AND StudentCode = @studentCode
        ORDER BY Timestamp ASC, Id ASC
      `);

    return NextResponse.json({
      success: true,
      messages: result.recordset.map((row: any) => ({
        id: row.Id,
        role: row.Role,
        content: row.Content,
        timestamp: row.Timestamp,
      })),
    });
  } catch (error: any) {
    console.error("Load session error:", error);
    return NextResponse.json({ error: "Failed to load session" }, { status: 500 });
  }
}

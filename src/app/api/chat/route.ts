import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import sql from "mssql";
import { connectToDB } from "../../lib/db";
import {
  buildOllamaOptions,
  normalizeMessages,
  OLLAMA_BASE_URL,
  OLLAMA_KEEP_ALIVE,
  requestHasImages,
  selectModel,
  TEXT_MODEL,
  VISION_MODEL,
} from "../../lib/ai";

type PersistResult = {
  sessionId: number | null;
};

function getLastUserMessage(messages: any[]) {
  return [...messages].reverse().find((message) => message?.role === "user");
}

function makeSessionTitle(content: string, hasImages: boolean) {
  const title = content?.trim() || (hasImages ? "تحليل صورة" : "محادثة جديدة");
  return title.substring(0, 100);
}

async function persistUserMessage(params: {
  studentCode: string;
  messages: any[];
  model: string;
  hasImages: boolean;
}): Promise<PersistResult> {
  if (!params.studentCode || params.studentCode === "guest" || params.messages.length === 0) {
    return { sessionId: null };
  }

  try {
    const lastMessage = getLastUserMessage(params.messages);
    if (!lastMessage) return { sessionId: null };

    const pool = await connectToDB();
    const sessionResult = await pool
      .request()
      .input("studentCode", sql.NVarChar, params.studentCode)
      .query(`
        SELECT TOP 1 Id
        FROM ChatSessions
        WHERE StudentCode = @studentCode AND IsActive = 1
        ORDER BY LastActivityAt DESC
      `);

    let sessionId: number;

    if (sessionResult.recordset.length > 0) {
      sessionId = sessionResult.recordset[0].Id;
      await pool
        .request()
        .input("sessionId", sql.Int, sessionId)
        .query("UPDATE ChatSessions SET LastActivityAt = GETDATE() WHERE Id = @sessionId");
    } else {
      const newSession = await pool
        .request()
        .input("studentCode", sql.NVarChar, params.studentCode)
        .input("title", sql.NVarChar, makeSessionTitle(lastMessage.content || "", params.hasImages))
        .input("model", sql.NVarChar, params.model)
        .query(`
          INSERT INTO ChatSessions (StudentCode, SessionTitle, ModelUsed)
          OUTPUT inserted.Id
          VALUES (@studentCode, @title, @model)
        `);
      sessionId = newSession.recordset[0].Id;
    }

    const content = lastMessage.content?.trim() || (params.hasImages ? "[صورة مرفقة للتحليل]" : "");

    await pool
      .request()
      .input("sessionId", sql.Int, sessionId)
      .input("studentCode", sql.NVarChar, params.studentCode)
      .input("role", sql.NVarChar, "user")
      .input("content", sql.NVarChar(sql.MAX), content)
      .query(`
        INSERT INTO ChatMessages (SessionId, StudentCode, Role, Content)
        VALUES (@sessionId, @studentCode, @role, @content)
      `);

    return { sessionId };
  } catch (error: any) {
    console.error("Database user message save error:", error.message);
    return { sessionId: null };
  }
}

async function persistAssistantMessage(params: {
  sessionId: number | null;
  studentCode: string;
  content: string;
}) {
  const content = params.content.trim();
  if (!params.sessionId || !params.studentCode || params.studentCode === "guest" || !content) return;

  try {
    const pool = await connectToDB();
    await pool
      .request()
      .input("sessionId", sql.Int, params.sessionId)
      .input("studentCode", sql.NVarChar, params.studentCode)
      .input("role", sql.NVarChar, "assistant")
      .input("content", sql.NVarChar(sql.MAX), content)
      .query(`
        INSERT INTO ChatMessages (SessionId, StudentCode, Role, Content)
        VALUES (@sessionId, @studentCode, @role, @content)
      `);

    await pool
      .request()
      .input("sessionId", sql.Int, params.sessionId)
      .query("UPDATE ChatSessions SET LastActivityAt = GETDATE() WHERE Id = @sessionId");
  } catch (error: any) {
    console.error("Database assistant message save error:", error.message);
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    const studentCode = (token?.studentId as string) || "guest";
    const body = await request.json();
    const messages = Array.isArray(body.messages) ? body.messages : [];
    const hasImages = requestHasImages(messages);
    const model = selectModel(body.model, messages);
    const ollamaMessages = normalizeMessages(messages);

    if (ollamaMessages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const persistUserPromise = persistUserMessage({
      studentCode,
      messages,
      model,
      hasImages,
    });

    const ollamaResponse = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: ollamaMessages,
        stream: true,
        keep_alive: OLLAMA_KEEP_ALIVE,
        options: buildOllamaOptions(hasImages),
      }),
      signal: request.signal,
    });

    if (!ollamaResponse.ok || !ollamaResponse.body) {
      const errText = await ollamaResponse.text();
      return new Response(errText, { status: ollamaResponse.status });
    }

    const reader = ollamaResponse.body.getReader();
    const decoder = new TextDecoder();
    let assistantContent = "";
    let parseBuffer = "";
    let wasAborted = false;

    request.signal.addEventListener("abort", () => {
      wasAborted = true;
      reader.cancel().catch(() => undefined);
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            controller.enqueue(value);

            parseBuffer += decoder.decode(value, { stream: true });
            const lines = parseBuffer.split("\n");
            parseBuffer = lines.pop() || "";

            for (const line of lines) {
              if (!line.trim()) continue;
              try {
                const parsed = JSON.parse(line);
                if (parsed.message?.content) {
                  assistantContent += parsed.message.content;
                }
              } catch {
                // Keep streaming even if an incomplete or non-JSON line appears.
              }
            }
          }

          if (parseBuffer.trim()) {
            try {
              const parsed = JSON.parse(parseBuffer);
              if (parsed.message?.content) assistantContent += parsed.message.content;
            } catch {
              // Ignore trailing non-JSON data.
            }
          }
        } catch (error: any) {
          wasAborted = error?.name === "AbortError" || request.signal.aborted;
          if (!wasAborted) {
            console.error("Ollama stream error:", error.message);
            controller.error(error);
            return;
          }
        } finally {
          try {
            controller.close();
          } catch {
            // Client may already be disconnected.
          }

          if (!wasAborted && assistantContent.trim()) {
            const { sessionId } = await persistUserPromise;
            await persistAssistantMessage({ sessionId, studentCode, content: assistantContent });
          }
        }
      },
      cancel() {
        wasAborted = true;
        reader.cancel().catch(() => undefined);
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "X-Selected-Model": model,
        "X-Text-Model": TEXT_MODEL,
        "X-Vision-Model": VISION_MODEL,
      },
    });
  } catch (error: any) {
    if (error?.name === "AbortError") {
      return new Response(null, { status: 499 });
    }

    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message || "Chat failed" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json({
      models: data.models?.map((m: any) => m.name) || [TEXT_MODEL, VISION_MODEL],
      textModel: TEXT_MODEL,
      visionModel: VISION_MODEL,
    });
  } catch {
    return NextResponse.json({ models: [TEXT_MODEL, VISION_MODEL], textModel: TEXT_MODEL, visionModel: VISION_MODEL });
  }
}

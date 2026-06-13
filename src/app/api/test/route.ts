import { NextRequest, NextResponse } from "next/server";
import { OLLAMA_BASE_URL, OLLAMA_KEEP_ALIVE, TEXT_MODEL, VISION_MODEL } from "../../lib/ai";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: body.model || TEXT_MODEL,
        messages: body.messages,
        stream: body.stream ?? true,
        keep_alive: OLLAMA_KEEP_ALIVE,
      }),
      signal: request.signal,
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(errText, { status: response.status });
    }

    if (body.stream) {
      return new Response(response.body, {
        headers: {
          "Content-Type": "application/x-ndjson; charset=utf-8",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
        },
      });
    }

    const data = await response.json();
    return Response.json(data);
  } catch (error: any) {
    if (error?.name === "AbortError") return new Response(null, { status: 499 });
    console.error("Test API error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json({ models: data.models?.map((m: any) => m.name) || [TEXT_MODEL, VISION_MODEL] });
  } catch {
    return NextResponse.json({ models: [TEXT_MODEL, VISION_MODEL] });
  }
}

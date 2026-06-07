import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const OLLAMA_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";

    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: body.model || "llama3",
        messages: body.messages,
        stream: body.stream ?? true,
      }),
    });

    if (!response.ok) {
    const errText = await response.text()
    return new Response(errText,{status : response.status})
    }

    if (body.stream) {
      return new Response(response.body, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    const data = await response.json();
    return Response.json(data);
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
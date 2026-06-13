import { NextRequest, NextResponse } from "next/server";
import { OLLAMA_BASE_URL, OLLAMA_KEEP_ALIVE, TEXT_MODEL } from "../../lib/ai";

function buildPrompt(text: string, direction: string) {
  const target = direction === "ar-to-en" ? "English" : direction === "en-to-ar" ? "Arabic" : "the other language between Arabic and English";
  return `You are an offline professional translator for students. Translate the user's text to ${target}.\nRules:\n- Return only the translation.\n- Do not add explanations.\n- Preserve numbers, names, bullets, and formatting when possible.\n- If the input is mixed Arabic and English, translate each meaningful part to the requested target.\n\nText:\n${text}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = String(body.text || "").trim();
    const direction = String(body.direction || "auto");

    if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });
    if (text.length > 12000) return NextResponse.json({ error: "Text is too long" }, { status: 413 });

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: TEXT_MODEL,
        prompt: buildPrompt(text, direction),
        stream: false,
        keep_alive: OLLAMA_KEEP_ALIVE,
        options: {
          temperature: 0.05,
          num_predict: 1800,
          repeat_penalty: 1.05,
        },
      }),
      signal: request.signal,
    });

    if (!response.ok) {
      return NextResponse.json({ error: await response.text() }, { status: 502 });
    }

    const data = await response.json();
    return NextResponse.json({ success: true, translation: String(data.response || "").trim(), model: TEXT_MODEL });
  } catch (error: any) {
    if (error?.name === "AbortError") return new Response(null, { status: 499 });
    console.error("Translate error:", error);
    return NextResponse.json({ error: "Translation failed", details: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { OLLAMA_BASE_URL, TEXT_MODEL, VISION_MODEL } from "../../lib/ai";

export async function GET() {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { cache: "no-store" });
    const data = await res.json();
    const models = data.models?.map((m: any) => m.name) || [];

    const ordered = [TEXT_MODEL, VISION_MODEL, ...models].filter(
      (model, index, arr) => model && arr.indexOf(model) === index
    );

    return NextResponse.json({ models: ordered, textModel: TEXT_MODEL, visionModel: VISION_MODEL });
  } catch {
    return NextResponse.json({ models: [TEXT_MODEL, VISION_MODEL], textModel: TEXT_MODEL, visionModel: VISION_MODEL });
  }
}

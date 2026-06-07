import { NextResponse } from "next/server";

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
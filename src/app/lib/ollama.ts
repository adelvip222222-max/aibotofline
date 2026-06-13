import { cleanBase64Image, OLLAMA_BASE_URL, OLLAMA_KEEP_ALIVE } from "./ai";

export async function listModels(): Promise<string[]> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`, { cache: "no-store" });
  const data = await res.json();
  return data.models?.map((m: any) => m.name) || [];
}

export async function generateCompletion(model: string, prompt: string, images?: string[], signal?: AbortSignal) {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      images: images?.map(cleanBase64Image),
      stream: false,
      keep_alive: OLLAMA_KEEP_ALIVE,
    }),
    signal,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

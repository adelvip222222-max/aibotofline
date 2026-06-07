const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

export async function listModels(): Promise<string[]> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
  const data = await res.json();
  return data.models?.map((m: any) => m.name) || [];
}

export async function generateCompletion(
  model: string,
  prompt: string,
  images?: string[]
) {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, prompt, images, stream: false }),
  });
  return res.json();
}
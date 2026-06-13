type OllamaMessage = {
  role: "system" | "user" | "assistant";
  content: string;
  images?: string[];
};

const DATA_URL_IMAGE_RE = /^data:image\/[a-zA-Z0-9.+-]+;base64,/;

export const TEXT_MODEL = process.env.OLLAMA_TEXT_MODEL || "qwen2.5:14b";
export const VISION_MODEL = process.env.OLLAMA_VISION_MODEL || "llava:latest";
export const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
export const OLLAMA_KEEP_ALIVE = process.env.OLLAMA_KEEP_ALIVE || "30m";

export function cleanBase64Image(image: string) {
  return image.replace(DATA_URL_IMAGE_RE, "");
}

export function messageHasImages(message: any) {
  return Array.isArray(message?.images) && message.images.length > 0;
}

export function requestHasImages(messages: any[]) {
  return messages.some(messageHasImages);
}

export function selectModel(requestedModel: string | undefined, messages: any[]) {
  if (requestHasImages(messages)) return VISION_MODEL;
  return requestedModel || TEXT_MODEL;
}

export function normalizeMessages(messages: any[]): OllamaMessage[] {
  const lastMessages = messages.slice(-12);

  return lastMessages
    .filter((message) => ["system", "user", "assistant"].includes(message?.role))
    .map((message) => {
      const normalized: OllamaMessage = {
        role: message.role,
        content: String(message.content || ""),
      };

      if (messageHasImages(message)) {
        normalized.images = message.images.map((image: string) => cleanBase64Image(image));
        if (!normalized.content.trim()) {
          normalized.content = "حلل الصورة المرفقة بدقة، واشرح محتواها بالعربية بوضوح، ولا تخترع تفاصيل غير ظاهرة.";
        }
      }

      return normalized;
    });
}

export function buildOllamaOptions(hasImages: boolean) {
  return {
    temperature: hasImages ? 0.2 : 0.35,
    num_predict: hasImages ? 800 : 1400,
    repeat_penalty: 1.08,
  };
}

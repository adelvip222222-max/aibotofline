"use client";

import { useCallback, useRef, useState } from "react";
import { Message } from "@/types/chat";

interface UseChatOptions {
  onResponseComplete?: () => void | Promise<void>;
}

function createMessageId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function useChat(options: UseChatOptions = {}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState(process.env.NEXT_PUBLIC_DEFAULT_TEXT_MODEL || "qwen2.5:14b");
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      if (!content.trim() && (!images || images.length === 0)) return;
      if (isLoading) return;

      const userMessage: Message = {
        id: createMessageId(),
        role: "user",
        content,
        images,
        timestamp: Date.now(),
      };

      const assistantId = createMessageId();
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };

      const nextMessages = [...messages, userMessage];
      setMessages([...nextMessages, assistantMessage]);
      setIsLoading(true);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: currentModel,
            messages: nextMessages.map((m) => ({
              role: m.role,
              content: m.content,
              images: m.images,
            })),
            stream: true,
          }),
          signal: controller.signal,
        });

        if (!res.ok) {
          const message = await res.text();
          throw new Error(message || "Network response was not ok");
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No response stream returned");

        const decoder = new TextDecoder();
        let assistantContent = "";
        let buffer = "";
        let lastRender = 0;

        const render = (force = false) => {
          const now = performance.now();
          if (!force && now - lastRender < 24) return;
          lastRender = now;

          setMessages((prev) =>
            prev.map((msg) => (msg.id === assistantId ? { ...msg, content: assistantContent } : msg))
          );
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.trim()) continue;
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                assistantContent += parsed.message.content;
                render();
              }
            } catch {
              // Ollama streams NDJSON. Incomplete lines stay in buffer; malformed lines are ignored.
            }
          }
        }

        if (buffer.trim()) {
          try {
            const parsed = JSON.parse(buffer);
            if (parsed.message?.content) assistantContent += parsed.message.content;
          } catch {
            // Ignore trailing non-JSON data.
          }
        }

        render(true);
        await options.onResponseComplete?.();
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Stream error:", error);
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId && !msg.content
                ? { ...msg, content: "حدث خطأ أثناء توليد الرد. تأكد من تشغيل Ollama والموديل المطلوب." }
                : msg
            )
          );
        }
      } finally {
        if (abortControllerRef.current === controller) {
          abortControllerRef.current = null;
        }
        setIsLoading(false);
      }
    },
    [messages, currentModel, isLoading, options]
  );

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsLoading(false);
  }, []);

  const clearChat = useCallback(() => {
    if (isLoading) abortControllerRef.current?.abort();
    setMessages([]);
    setIsLoading(false);
  }, [isLoading]);

  return {
    messages,
    isLoading,
    currentModel,
    setCurrentModel,
    sendMessage,
    stopGeneration,
    clearChat,
  };
}

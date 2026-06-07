"use client";
import { useState, useCallback, useRef } from "react";
import { Message } from "@/types/chat";

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState("llama3");
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (content: string, images?: string[]) => {
      if (!content.trim() && (!images || images.length === 0)) return;

      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content,
        images,
        timestamp: Date.now(),
      };

      const newMessages = [...messages, userMessage];
      setMessages(newMessages);
      setIsLoading(true);

      abortControllerRef.current = new AbortController();

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: currentModel,
            messages: newMessages.map((m) => ({
              role: m.role,
              content: m.content,
              images: m.images,
            })),
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!res.ok) throw new Error("Network response was not ok");

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let assistantContent = "";

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "",
          timestamp: Date.now(),
        };

        setMessages((prev) => [...prev, assistantMessage]);

        while (reader) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter((line) => line.trim() !== "");

          for (const line of lines) {
            try {
              const parsed = JSON.parse(line);
              if (parsed.message?.content) {
                assistantContent += parsed.message.content;
                setMessages((prev) => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: assistantContent,
                  };
                  return updated;
                });
              }
            } catch (e) {
              // ignore non-JSON lines
            }
          }
        }
      } catch (error: any) {
        if (error.name !== "AbortError") {
          console.error("Stream error:", error);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [messages, currentModel]
  );

  const stopGeneration = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

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
"use client";

import { useEffect, useRef } from "react";
import ChatMessage from "./ui/ChatMessage";
import ChatInput from "./ui/ChatInput";
import ModelSelector from "./ui/ModelSelector";
import { useChat } from "@/hooks/useChat";
import { MessageSquare, Sparkles, Trash2 } from "lucide-react";

interface ChatContainerProps {
  onResponseComplete?: () => void | Promise<void>;
}

export default function ChatContainer({ onResponseComplete }: ChatContainerProps) {
  const { messages, isLoading, currentModel, setCurrentModel, sendMessage, stopGeneration, clearChat } = useChat({
    onResponseComplete,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  return (
    <div className="flex h-full flex-col bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.12),transparent_38%),#020617]">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/80 px-4 py-3 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-950/40">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white sm:text-lg">المساعد الذكي</h1>
              <p className="text-xs text-gray-400">Streaming سريع وتحليل صور وملفات كشرح</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ModelSelector currentModel={currentModel} onModelChange={setCurrentModel} />
            <button
              onClick={clearChat}
              className="rounded-xl border border-white/10 bg-white/5 p-2 text-gray-400 transition hover:bg-white/10 hover:text-red-300"
              title="مسح المحادثة"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-3 py-4 sm:px-6">
        {messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-3xl items-center justify-center">
            <div className="w-full text-center">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl border border-blue-400/20 bg-blue-500/10 shadow-2xl shadow-blue-950/30">
                <Sparkles className="h-10 w-10 text-blue-300" />
              </div>
              <h2 className="mb-3 text-3xl font-bold text-white">كيف يمكنني مساعدتك؟</h2>
              <p className="mx-auto mb-6 max-w-xl text-sm leading-7 text-gray-400">
                اكتب سؤالك، أو ارفع صورة للتحليل. سيتم استخدام Qwen للنصوص وLLaVA للصور تلقائيًا.
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {[
                  "اشرح هذا المفهوم ببساطة",
                  "حلل صورة الشاشة عند رفعها",
                  "اكتب لي خطة منظمة للمذاكرة",
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-gray-300 transition hover:border-blue-400/40 hover:bg-blue-500/10 hover:text-white"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-4xl divide-y divide-white/[0.04]">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <ChatInput onSend={sendMessage} onStop={stopGeneration} isLoading={isLoading} />
    </div>
  );
}

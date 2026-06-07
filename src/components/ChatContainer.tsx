"use client";
import { useRef, useEffect } from "react";
import ChatMessage from "./ui/ChatMessage";
import ChatInput from "./ui/ChatInput";
import ModelSelector from "./ui/ModelSelector";
import { useChat } from "@/hooks/useChat";
import { Bot, MessagesSquare, Trash2 } from "lucide-react";

export default function ChatContainer() {
  const {
    messages,
    isLoading,
    currentModel,
    setCurrentModel,
    sendMessage,
    stopGeneration,
    clearChat,
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center justify-between bg-gray-900/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
            <MessagesSquare className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-gray-100">AF Academy</h1>
        </div>

        <div className="flex items-center gap-3">
          <ModelSelector
            currentModel={currentModel}
            onModelChange={setCurrentModel}
          />
          <button
            onClick={clearChat}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-red-400"
            title="مسح المحادثة"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20 flex items-center justify-center">
                <MessagesSquare className="w-10 h-10 text-blue-400" />
              </div>
            <h2 className="text-2xl font-bold text-gray-200">كيف يمكنني مساعدتك؟</h2>
<p className="text-gray-500 max-w-md">
  اسأل أي سؤال، ارفع صورة للتحليل، أو استخدم الإدخال الصوتي
</p>
              <div className="flex gap-2 justify-center flex-wrap">
                {["اشرح لي مفهوم الذكاء الاصطناعي", "اكتب كود HTML بسيط", "ما الفرق بين TCP و UDP"].map(
                  (suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => sendMessage(suggestion)}
                      className="px-3 py-1.5 text-sm rounded-full border border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-2">
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} />
            ))}
            {isLoading && (
              <div className="flex gap-3 py-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-gray-800/50 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-700/50">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput onSend={sendMessage} onStop={stopGeneration} isLoading={isLoading} />
    </div>
  );
}
"use client";
import { Message } from "@/types/chat";
import { User, Bot } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 py-4 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}

      <div
        className={`max-w-[85%] rounded-2xl px-5 py-4 text-base leading-relaxed ${
          isUser
            ? "bg-blue-600/20 border border-blue-500/30 rounded-br-md text-gray-100"
            : "bg-gray-800/50 border border-gray-700/50 rounded-bl-md text-gray-100"
        }`}
      >
        {/* Images */}
        {message.images && message.images.length > 0 && (
          <div className="flex gap-2 mb-2 flex-wrap">
            {message.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Uploaded"
                className="max-w-[200px] max-h-[200px] object-cover rounded-lg border border-gray-600"
              />
            ))}
          </div>
        )}

        {/* Text Content */}
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="prose prose-invert max-w-none text-gray-100 text-base">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );
}

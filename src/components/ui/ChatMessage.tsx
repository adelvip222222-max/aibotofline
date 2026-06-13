"use client";

import { Message } from "@/types/chat";
import { getTextDirection } from "@/lib/textDirection";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  const direction = getTextDirection(message.content);
  const hasContent = message.content.trim().length > 0;

  return (
    <div className={`group flex w-full gap-3 py-5 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-600 shadow-lg shadow-blue-950/30">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}

      <article
        dir={direction}
        className={`max-w-[88%] rounded-3xl px-5 py-4 text-start text-[15px] leading-7 shadow-sm sm:max-w-[78%] ${
          isUser
            ? "rounded-br-md border border-blue-400/20 bg-blue-600 text-white shadow-blue-950/20"
            : "rounded-bl-md border border-white/10 bg-gray-900/80 text-gray-100 shadow-black/20"
        }`}
      >
        {message.images && message.images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2" dir="ltr">
            {message.images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt="Uploaded"
                className="max-h-52 max-w-[220px] rounded-2xl border border-white/10 object-cover"
              />
            ))}
          </div>
        )}

        {isUser ? (
          <p className="whitespace-pre-wrap text-start">{message.content}</p>
        ) : hasContent ? (
          <div className="prose prose-invert max-w-none text-start prose-pre:overflow-x-auto prose-pre:rounded-2xl prose-pre:border prose-pre:border-white/10 prose-pre:bg-black/40 prose-code:text-blue-100 prose-a:text-blue-300">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-gray-400" dir="rtl">
            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "0ms" }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "140ms" }} />
            <span className="h-2 w-2 animate-bounce rounded-full bg-blue-400" style={{ animationDelay: "280ms" }} />
            <span className="text-sm">جاري تجهيز الرد...</span>
          </div>
        )}
      </article>

      {isUser && (
        <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-950/30">
          <User className="h-4 w-4 text-white" />
        </div>
      )}
    </div>
  );
}

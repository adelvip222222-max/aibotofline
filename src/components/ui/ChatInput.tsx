"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FileText, Mic, Paperclip, Send, Square, StopCircle, X } from "lucide-react";
import { getTextDirection } from "@/lib/textDirection";

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  onStop?: () => void;
  isLoading: boolean;
}

type LocalFile = {
  name: string;
  size: number;
  text: string;
};

const TEXT_FILE_EXTENSIONS = [".txt", ".md", ".csv", ".json", ".log", ".sql", ".js", ".ts", ".tsx", ".jsx", ".html", ".css"];
const MAX_TEXT_FILE_CHARS = 18000;

function isTextFile(file: File) {
  const lowerName = file.name.toLowerCase();
  return file.type.startsWith("text/") || TEXT_FILE_EXTENSIONS.some((ext) => lowerName.endsWith(ext));
}

function resizeImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxSide = 1280;
        const ratio = Math.min(1, maxSide / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * ratio));
        const height = Math.max(1, Math.round(img.height * ratio));

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Cannot resize image"));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.86));
      };
      img.onerror = () => reject(new Error("Cannot read image"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Cannot read image"));
    reader.readAsDataURL(file);
  });
}

export default function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<LocalFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const direction = useMemo(() => getTextDirection(input), [input]);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
  }, [input]);

  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("المتصفح لا يدعم التعرف على الصوت. جرب Chrome.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "ar-SA";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsRecording(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => `${prev ? `${prev} ` : ""}${transcript}`);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  };

  useEffect(() => {
    return () => recognitionRef.current?.stop();
  }, []);

  const buildMessage = () => {
    const fileBlocks = files.map(
      (file) => `\n\n--- ملف مرفق: ${file.name} ---\n${file.text}\n--- نهاية الملف ---`
    );
    return `${input.trim()}${fileBlocks.join("")}`.trim();
  };

  const handleSend = () => {
    const message = buildMessage();
    if (!message && images.length === 0) return;
    onSend(message, images.length > 0 ? images : undefined);
    setInput("");
    setImages([]);
    setFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    e.target.value = "";
    if (selected.length === 0) return;

    for (const file of selected) {
      try {
        if (file.type.startsWith("image/")) {
          const optimized = await resizeImage(file);
          setImages((prev) => [...prev, optimized]);
          continue;
        }

        if (isTextFile(file)) {
          const text = await file.text();
          setFiles((prev) => [
            ...prev,
            {
              name: file.name,
              size: file.size,
              text: text.slice(0, MAX_TEXT_FILE_CHARS),
            },
          ]);
          continue;
        }

        alert(`الملف ${file.name} غير مدعوم حاليًا بدون مكتبة استخراج. استخدم txt/csv/json/md أو ارفع صورة/سكرين شوت.`);
      } catch (error) {
        console.error("File upload error:", error);
        alert(`تعذر قراءة الملف: ${file.name}`);
      }
    }
  };

  return (
    <div className="border-t border-white/10 bg-slate-950/85 px-3 py-3 backdrop-blur-xl sm:px-6">
      <div className="mx-auto max-w-4xl">
        {(images.length > 0 || files.length > 0) && (
          <div className="mb-3 flex flex-wrap gap-2" dir="ltr">
            {images.map((img, i) => (
              <div key={i} className="group relative">
                <img src={img} alt="Preview" className="h-16 w-16 rounded-2xl border border-white/10 object-cover" />
                <button
                  onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                  className="absolute -right-1.5 -top-1.5 rounded-full bg-red-500 p-1 opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}

            {files.map((file, i) => (
              <div key={`${file.name}-${i}`} className="group relative flex max-w-[240px] items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-gray-300">
                <FileText className="h-4 w-4 text-blue-300" />
                <span className="truncate">{file.name}</span>
                <button
                  onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                  className="rounded-full p-1 text-gray-500 transition hover:bg-red-500/20 hover:text-red-300"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-end gap-2 rounded-3xl border border-white/10 bg-white/[0.04] p-2 shadow-2xl shadow-black/20 transition focus-within:border-blue-400/40 focus-within:bg-white/[0.06]">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="rounded-2xl p-2.5 text-gray-400 transition hover:bg-white/10 hover:text-blue-300"
            title="إضافة صورة أو ملف نصي"
            disabled={isLoading}
          >
            <Paperclip className="h-5 w-5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.txt,.md,.csv,.json,.log,.sql,.js,.ts,.tsx,.jsx,.html,.css"
            multiple
            className="hidden"
            onChange={handleFileUpload}
          />

          {isRecording ? (
            <button
              onClick={stopRecording}
              className="rounded-2xl bg-red-500/15 p-2.5 text-red-300 transition hover:bg-red-500/25"
              title="إيقاف التسجيل"
            >
              <Square className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={startRecording}
              className="rounded-2xl p-2.5 text-gray-400 transition hover:bg-white/10 hover:text-blue-300"
              title="إدخال صوتي"
              disabled={isLoading}
            >
              <Mic className="h-5 w-5" />
            </button>
          )}

          <div className="relative min-w-0 flex-1">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              dir={direction}
              placeholder={isRecording ? "جاري الاستماع... تحدث الآن..." : "اكتب رسالتك هنا..."}
              rows={1}
              className="max-h-44 min-h-11 w-full resize-none bg-transparent px-2 py-2.5 text-start text-[15px] leading-7 text-gray-100 placeholder-gray-500 outline-none"
            />
            {isRecording && (
              <div className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 flex items-center gap-1">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
                </span>
              </div>
            )}
          </div>

          {isLoading ? (
            <button
              onClick={onStop}
              className="rounded-2xl bg-red-500/15 p-3 text-red-300 transition hover:bg-red-500/25"
              title="إيقاف التوليد"
            >
              <StopCircle className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleSend}
              disabled={!buildMessage() && images.length === 0}
              className="rounded-2xl bg-blue-600 p-3 text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
              title="إرسال"
            >
              <Send className="h-5 w-5" />
            </button>
          )}
        </div>

        <p className="mt-2 text-center text-[11px] text-gray-500">
          Enter للإرسال، Shift + Enter لسطر جديد. الصور تُحلل تلقائيًا عبر موديل الرؤية.
        </p>
      </div>
    </div>
  );
}

"use client";
import { useState, useRef, useEffect } from "react";
import { Send, ImagePlus, Mic, X, StopCircle, Square } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string, images?: string[]) => void;
  onStop?: () => void;
  isLoading: boolean;
}

export default function ChatInput({ onSend, onStop, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // دالة بدء التسجيل
  const startRecording = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("المتصفح لا يدعم التعرف على الصوت. جرب Chrome.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
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
      setInput((prev) => prev + " " + transcript);
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  // دالة إيقاف التسجيل يدوياً
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // إيقاف التسجيل تلقائي عند فك المكون
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleSend = () => {
    if (!input.trim() && images.length === 0) return;
    onSend(input, images.length > 0 ? images : undefined);
    setInput("");
    setImages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="border-t border-gray-700/50 p-4 bg-gray-900/80 backdrop-blur-sm">
      {/* Image Previews */}
      {images.length > 0 && (
        <div className="flex gap-2 mb-3 flex-wrap">
          {images.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt="Preview"
                className="w-16 h-16 object-cover rounded-lg border border-gray-600"
              />
              <button
                onClick={() => setImages((prev) => prev.filter((_, j) => j !== i))}
                className="absolute -top-1.5 -right-1.5 bg-red-500 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* صورة */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-blue-400"
          title="إضافة صورة"
        >
          <ImagePlus className="w-5 h-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleImageUpload}
        />

        {/* ميكروفون أو زر إيقاف التسجيل */}
        {isRecording ? (
          <button
            onClick={stopRecording}
            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors animate-pulse"
            title="إيقاف التسجيل"
          >
            <Square className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={startRecording}
            className="p-2 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-blue-400"
            title="إدخال صوتي"
          >
            <Mic className="w-5 h-5" />
          </button>
        )}

        {/* شريط الكتابة */}
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRecording
                ? "جاري الاستماع... تحدث الآن..."
                : "اكتب رسالتك هنا... (Shift+Enter لسطر جديد)"
            }
            rows={1}
            className={`w-full bg-gray-800/50 border rounded-xl px-4 py-2.5 text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 resize-none max-h-32 transition-all ${
              isRecording
                ? "border-red-500/50 ring-1 ring-red-500/30"
                : "border-gray-700"
            }`}
            style={{ minHeight: "42px" }}
          />
          {/* مؤشر بصري لما يكون في تسجيل */}
          {isRecording && (
            <div className="absolute top-1/2 right-3 -translate-y-1/2 flex items-center gap-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
          )}
        </div>

        {/* زر إيقاف الطلب أثناء التوليد */}
        {isLoading ? (
          <button
            onClick={onStop}
            className="p-2.5 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            title="إيقاف التوليد"
          >
            <StopCircle className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim() && images.length === 0}
            className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="إرسال"
          >
            <Send className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

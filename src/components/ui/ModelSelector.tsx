"use client";

import { useEffect, useMemo, useState } from "react";
import { Cpu, Eye } from "lucide-react";

interface ModelSelectorProps {
  currentModel: string;
  onModelChange: (model: string) => void;
}

export default function ModelSelector({ currentModel, onModelChange }: ModelSelectorProps) {
  const [models, setModels] = useState<string[]>(["qwen2.5:14b", "llava:latest"]);
  const [visionModel, setVisionModel] = useState("llava:latest");
  const [textModel, setTextModel] = useState("qwen2.5:14b");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/models", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        const nextModels = Array.isArray(data.models) && data.models.length > 0 ? data.models : ["qwen2.5:14b", "llava:latest"];
        setModels(nextModels);
        if (data.textModel) setTextModel(data.textModel);
        if (data.visionModel) setVisionModel(data.visionModel);
        if (!nextModels.includes(currentModel) && data.textModel) onModelChange(data.textModel);
      })
      .catch(() => {
        setModels(["qwen2.5:14b", "llava:latest"]);
      });
  }, [currentModel, onModelChange]);

  const modelHint = useMemo(() => {
    if (currentModel === visionModel) return "تحليل الصور";
    if (currentModel === textModel) return "النص الأساسي";
    return "موديل نصي";
  }, [currentModel, textModel, visionModel]);

  return (
    <div className="relative" dir="ltr">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex max-w-[210px] items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200 transition hover:bg-white/10"
      >
        <Cpu className="h-4 w-4 text-blue-300" />
        <span className="truncate">{currentModel}</span>
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-2 min-w-[240px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl shadow-black/40">
          <div className="border-b border-white/10 px-4 py-3" dir="rtl">
            <p className="text-sm font-semibold text-white">اختيار موديل النص</p>
            <p className="text-xs text-gray-400">الصور تتحول تلقائيًا إلى موديل الرؤية: {visionModel}</p>
          </div>
          {models.map((model) => {
            const isVision = model === visionModel || model.toLowerCase().includes("llava") || model.toLowerCase().includes("vl");
            return (
              <button
                key={model}
                onClick={() => {
                  onModelChange(model);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition hover:bg-white/10 ${
                  model === currentModel ? "bg-blue-500/10 text-blue-200" : "text-gray-300"
                }`}
              >
                <span className="truncate">{model}</span>
                {isVision ? <Eye className="h-4 w-4 text-violet-300" /> : <Cpu className="h-4 w-4 text-blue-300" />}
              </button>
            );
          })}
          <div className="border-t border-white/10 px-4 py-2 text-xs text-gray-500" dir="rtl">
            الحالي: {modelHint}
          </div>
        </div>
      )}
    </div>
  );
}
